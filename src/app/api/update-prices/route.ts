import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get all assets for this user
    const assets = await prisma.asset.findMany({
      where: { userId },
      select: { id: true, ticker: true, type: true },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum ativo encontrado",
        updated: 0,
      });
    }

    // Separate Brazilian (B3) and international assets
    // B3 assets: ACAO, FII
    // International: STOCK, REIT, ETF
    const b3Assets = assets.filter((a) => ["ACAO", "FII"].includes(a.type));
    const intlAssets = assets.filter((a) =>
      ["STOCK", "REIT", "ETF"].includes(a.type),
    );

    const results = { updated: 0, errors: [] as string[] };

    // --- Update B3 assets via Brapi ---
    if (b3Assets.length > 0) {
      const tickers = b3Assets.map((a) => a.ticker).join(",");
      const brapiToken = process.env.BRAPI_TOKEN;

      const url = `https://brapi.dev/api/quote/${tickers}?token=${brapiToken}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Brapi error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        for (const quote of data.results) {
          const asset = b3Assets.find(
            (a) => a.ticker.toUpperCase() === quote.symbol.toUpperCase(),
          );

          if (asset && quote.regularMarketPrice) {
            await prisma.asset.update({
              where: { id: asset.id },
              data: { currentPrice: quote.regularMarketPrice },
            });
            results.updated++;
          }
        }
      }
    }

    // --- Update international assets via Yahoo Finance ---
    if (intlAssets.length > 0) {
      for (const asset of intlAssets) {
        try {
          // Yahoo Finance format: ticker only (no suffix for US stocks)
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${asset.ticker}`;
          const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          if (response.ok) {
            const data = await response.json();
            const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;

            if (price) {
              await prisma.asset.update({
                where: { id: asset.id },
                data: { currentPrice: price },
              });
              results.updated++;
            }
          }
        } catch (err) {
          results.errors.push(`${asset.ticker}: failed to update`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.updated} ativo(s) atualizado(s) com sucesso!`,
      updated: results.updated,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Price update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao atualizar cotações",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
