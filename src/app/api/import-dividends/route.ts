import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "1");

    // Get all B3 assets (ACAO + FII only - Brapi supports these)
    const assets = await prisma.asset.findMany({
      where: {
        userId,
        type: { in: ["ACAO", "FII"] },
      },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum ativo B3 encontrado",
        imported: 0,
      });
    }

    const brapiToken = process.env.BRAPI_TOKEN;
    const tickers = assets.map((a) => a.ticker).join(",");

    // Fetch dividend history from Brapi
    const url = `https://brapi.dev/api/quote/${tickers}?modules=dividendsData&token=${brapiToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Brapi error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid Brapi response");
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const quote of data.results) {
      const asset = assets.find(
        (a) => a.ticker.toUpperCase() === quote.symbol.toUpperCase(),
      );

      if (!asset) continue;

      const cashDividends = quote.dividendsData?.cashDividends;
      if (!cashDividends || !Array.isArray(cashDividends)) continue;

      for (const div of cashDividends) {
        try {
          // Only import dividends from last 12 months
          const paymentDate = new Date(div.paymentDate);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          if (paymentDate < oneYearAgo) continue;
          if (isNaN(paymentDate.getTime())) continue;

          const rate = parseFloat(div.rate);
          if (!rate || rate <= 0) continue;

          // Calculate total value received = rate per share × quantity owned
          const totalValue = rate * Number(asset.quantity);

          // Map dividend type
          const labelUpper = (div.label || "").toUpperCase();
          let divType: "DIVIDENDO" | "JCP" | "RENDIMENTO" = "DIVIDENDO";
          if (labelUpper.includes("JCP") || labelUpper.includes("JUROS"))
            divType = "JCP";
          if (labelUpper.includes("RENDIMENTO")) divType = "RENDIMENTO";

          // Check if already exists (avoid duplicates)
          const existing = await prisma.dividend.findFirst({
            where: {
              userId,
              assetId: asset.id,
              date: paymentDate,
              type: divType,
            },
          });

          if (existing) {
            skipped++;
            continue;
          }

          await prisma.dividend.create({
            data: {
              userId,
              assetId: asset.id,
              type: divType,
              value: parseFloat(totalValue.toFixed(2)),
              date: paymentDate,
              notes: `Importado automaticamente via Brapi - R$ ${rate.toFixed(4)}/cota`,
            },
          });

          imported++;
        } catch (err) {
          errors.push(`${quote.symbol}: ${err}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${imported} dividendo(s) importado(s)! ${skipped} já existiam.`,
      imported,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("Dividend import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao importar dividendos",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
