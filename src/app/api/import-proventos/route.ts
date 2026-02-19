import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface ParsedDividend {
  ticker: string;
  type: "DIVIDENDO" | "JCP" | "RENDIMENTO";
  value: number;
  date: Date;
  notes: string;
}

// Extract ticker from "TICKER - FULL NAME" format
function extractTicker(produto: string): string {
  if (!produto || typeof produto !== "string") return "";
  const cleaned = produto.trim();
  const dashIndex = cleaned.indexOf(" - ");
  if (dashIndex === -1) return cleaned;

  let ticker = cleaned.substring(0, dashIndex).trim().toUpperCase();

  // Remove suffixes like "L" from ALZR11L
  ticker = ticker.replace(/[A-Z]$/, "");

  return ticker;
}

// Parse DD/MM/YYYY date
function parseB3Date(dateStr: string | number): Date | null {
  if (typeof dateStr === "number") {
    // Excel date number
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }

  if (typeof dateStr !== "string") return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2]);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
}

// Map event type to our enum
function mapEventType(tipoEvento: string): "DIVIDENDO" | "JCP" | "RENDIMENTO" {
  if (!tipoEvento) return "DIVIDENDO";

  const normalized = tipoEvento.toUpperCase();

  if (
    normalized.includes("JCP") ||
    normalized.includes("JUROS") ||
    normalized.includes("CAPITAL")
  ) {
    return "JCP";
  }

  if (normalized.includes("RENDIMENTO")) {
    return "RENDIMENTO";
  }

  return "DIVIDENDO";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });

    if (!wb.SheetNames.includes("Proventos Recebidos")) {
      return NextResponse.json(
        { error: 'Sheet "Proventos Recebidos" not found' },
        { status: 400 },
      );
    }

    const ws = wb.Sheets["Proventos Recebidos"];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    const parsed: ParsedDividend[] = [];

    // Start from row 1 (skip header at row 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const produto = row[0];
      const pagamento = row[1];
      const tipoEvento = row[2];
      const quantidade = row[4];
      const precoUnitario = row[5];
      const valorLiquido = row[6];

      // Skip empty rows
      if (!produto || !pagamento) continue;

      const ticker = extractTicker(String(produto));
      if (!ticker) continue;

      const date = parseB3Date(pagamento);
      if (!date) continue;

      const value =
        typeof valorLiquido === "number"
          ? valorLiquido
          : parseFloat(String(valorLiquido));
      if (isNaN(value) || value <= 0) continue;

      const type = mapEventType(String(tipoEvento));

      const unitPrice =
        typeof precoUnitario === "number"
          ? precoUnitario
          : parseFloat(String(precoUnitario));
      const qty =
        typeof quantidade === "number"
          ? quantidade
          : parseFloat(String(quantidade));

      parsed.push({
        ticker,
        type,
        value,
        date,
        notes: `B3 Import - ${qty} cotas × R$ ${unitPrice.toFixed(4)}/cota`,
      });
    }

    // Get all user assets to match tickers
    const assets = await prisma.asset.findMany({
      where: { userId },
      select: { id: true, ticker: true },
    });

    const assetMap = new Map(assets.map((a) => [a.ticker.toUpperCase(), a.id]));

    let imported = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const div of parsed) {
      const assetId = assetMap.get(div.ticker);

      if (!assetId) {
        if (!notFound.includes(div.ticker)) notFound.push(div.ticker);
        skipped++;
        continue;
      }

      // Check if already exists (avoid duplicates)
      const existing = await prisma.dividend.findFirst({
        where: {
          userId,
          assetId,
          date: div.date,
          type: div.type,
          value: div.value,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.dividend.create({
        data: {
          userId,
          assetId,
          type: div.type,
          value: div.value,
          date: div.date,
          notes: div.notes,
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      message: `${imported} dividendo(s) importado(s)! ${skipped} já existiam ou não encontrados.`,
      summary: {
        imported,
        skipped,
        notFound,
        totalProcessed: parsed.length,
      },
    });
  } catch (error) {
    console.error("Dividend import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao importar proventos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
