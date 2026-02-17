import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Helper: extract clean name from "TICKER - FULL NAME    " format
function parseName(produto: string): { ticker: string; name: string } {
  if (!produto || typeof produto !== "string") return { ticker: "", name: "" };
  const cleaned = produto.trim();
  const dashIndex = cleaned.indexOf(" - ");
  if (dashIndex === -1) return { ticker: cleaned, name: cleaned };
  const ticker = cleaned.substring(0, dashIndex).trim();
  const name = cleaned.substring(dashIndex + 3).trim();
  return { ticker, name };
}

// Helper: parse a standard sheet (Acoes, BDR, ETF, FII)
function parseStandardSheet(
  sheet: XLSX.WorkSheet,
  assetType: "ACAO" | "FII" | "ETF" | "STOCK",
  tickerCol: number,
  nameCol: number,
  quantityCol: number,
  priceCol: number,
): ParsedAsset[] {
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  const assets: ParsedAsset[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const ticker = row[tickerCol];
    const produtoRaw = row[nameCol];
    const quantity = row[quantityCol];
    const price = row[priceCol];

    // Skip empty rows or total rows
    if (!ticker || typeof ticker !== "string" || ticker.trim() === "") continue;
    if (typeof quantity !== "number" || typeof price !== "number") continue;

    const { name } = parseName(String(produtoRaw));

    assets.push({
      ticker: ticker.trim().toUpperCase(),
      name: name || ticker.trim(),
      type: assetType,
      quantity,
      currentPrice: price,
    });
  }

  return assets;
}

// Helper: parse Tesouro Direto sheet (different structure)
function parseTesouroDiretoSheet(sheet: XLSX.WorkSheet): ParsedAsset[] {
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  const assets: ParsedAsset[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[0]; // Produto
    const quantity = row[5]; // Quantidade
    const valorAplicado = row[9]; // Valor Aplicado (invested value)
    const valorAtualizado = row[12]; // Valor Atualizado

    if (!name || typeof name !== "string" || name.trim() === "") continue;
    if (typeof quantity !== "number") continue;

    // For tesouro, use "TESOURO-VENCIMENTO" as ticker
    const nameCleaned = name.trim();
    const ticker = nameCleaned
      .replace("Tesouro ", "TES-")
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-+]/gi, "")
      .toUpperCase()
      .substring(0, 10);

    const valorAtual =
      typeof valorAtualizado === "number" ? valorAtualizado : 0;
    const valorInvest =
      typeof valorAplicado === "number" ? valorAplicado : valorAtual;
    const currentPrice = quantity > 0 ? valorAtual / quantity : valorAtual;
    const averagePrice = quantity > 0 ? valorInvest / quantity : valorInvest;

    assets.push({
      ticker,
      name: nameCleaned,
      type: "ETF", // Closest available type for now
      quantity,
      currentPrice,
      averagePrice,
      isTesouroDireto: true,
    });
  }

  return assets;
}

interface ParsedAsset {
  ticker: string;
  name: string;
  type: "ACAO" | "FII" | "ETF" | "STOCK";
  quantity: number;
  currentPrice: number;
  averagePrice?: number;
  isTesouroDireto?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "1");

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });

    const allParsed: ParsedAsset[] = [];

    // --- Parse Acoes ---
    if (wb.SheetNames.includes("Acoes")) {
      const ws = wb.Sheets["Acoes"];
      // Columns: Produto(0), Instituição(1), Conta(2), Código de Negociação(3), CNPJ(4), ISIN(5), Tipo(6), Escriturador(7), Quantidade(8), ...Preço de Fechamento(12)
      const parsed = parseStandardSheet(ws, "ACAO", 3, 0, 8, 12);
      allParsed.push(...parsed);
    }

    // --- Parse BDR ---
    if (wb.SheetNames.includes("BDR")) {
      const ws = wb.Sheets["BDR"];
      // Columns: Produto(0), Instituição(1), Conta(2), Código de Negociação(3), ISIN(4), Tipo(5), Escriturador(6), Quantidade(7), ...Preço de Fechamento(11)
      const parsed = parseStandardSheet(ws, "STOCK", 3, 0, 7, 11);
      allParsed.push(...parsed);
    }

    // --- Parse ETF ---
    if (wb.SheetNames.includes("ETF")) {
      const ws = wb.Sheets["ETF"];
      // Columns: Produto(0), Instituição(1), Conta(2), Código de Negociação(3), CNPJ(4), ISIN(5), Tipo(6), Quantidade(7), ...Preço de Fechamento(11)
      const parsed = parseStandardSheet(ws, "ETF", 3, 0, 7, 11);
      allParsed.push(...parsed);
    }

    // --- Parse FII (Fundo de Investimento) ---
    if (wb.SheetNames.includes("Fundo de Investimento")) {
      const ws = wb.Sheets["Fundo de Investimento"];
      // Columns: Produto(0), Instituição(1), Conta(2), Código de Negociação(3), CNPJ(4), ISIN(5), Tipo(6), Administrador(7), Quantidade(8), ...Preço de Fechamento(12)
      const parsed = parseStandardSheet(ws, "FII", 3, 0, 8, 12);
      allParsed.push(...parsed);
    }

    // --- Parse Tesouro Direto ---
    if (wb.SheetNames.includes("Tesouro Direto")) {
      const ws = wb.Sheets["Tesouro Direto"];
      const parsed = parseTesouroDiretoSheet(ws);
      allParsed.push(...parsed);
    }

    // --- Consolidate same tickers (e.g., KNSC11 in two brokers) ---
    const consolidated = new Map<string, ParsedAsset>();

    for (const asset of allParsed) {
      if (consolidated.has(asset.ticker)) {
        const existing = consolidated.get(asset.ticker)!;
        existing.quantity += asset.quantity; // Sum quantities from all brokers
      } else {
        consolidated.set(asset.ticker, { ...asset });
      }
    }

    // --- Upsert to database ---
    let created = 0;
    let updated = 0;
    const skipped: string[] = [];

    for (const asset of consolidated.values()) {
      try {
        const averagePrice = asset.averagePrice ?? asset.currentPrice;

        const existing = await prisma.asset.findFirst({
          where: { userId, ticker: asset.ticker },
        });

        if (existing) {
          await prisma.asset.update({
            where: { id: existing.id },
            data: {
              quantity: asset.quantity,
              currentPrice: asset.currentPrice,
              name: asset.name,
            },
          });
          updated++;
        } else {
          await prisma.asset.create({
            data: {
              userId,
              ticker: asset.ticker,
              name: asset.name,
              type: asset.type,
              quantity: asset.quantity,
              averagePrice,
              currentPrice: asset.currentPrice,
            },
          });
          created++;
        }
      } catch (err) {
        skipped.push(asset.ticker);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importação concluída! ${created} ativos criados, ${updated} atualizados.`,
      summary: {
        created,
        updated,
        skipped,
        total: consolidated.size,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao importar arquivo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
