import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '1');

    // Fetch all assets
    const assets = await prisma.asset.findMany({
      where: { userId },
    });

    // Fetch all dividends
    const dividends = await prisma.dividend.findMany({
      where: { userId },
    });

    // Calculate stats
    const valorInvestido = assets.reduce((sum, asset) => {
      return sum + (Number(asset.quantity) * Number(asset.averagePrice));
    }, 0);

    const valorAtual = assets.reduce((sum, asset) => {
      const price = asset.currentPrice ? Number(asset.currentPrice) : Number(asset.averagePrice);
      return sum + (Number(asset.quantity) * price);
    }, 0);

    const rentabilidade = valorAtual - valorInvestido;
    const rentabilidadePercentual = valorInvestido > 0
      ? (rentabilidade / valorInvestido) * 100
      : 0;

    const dividendosRecebidos = dividends.reduce((sum, dividend) => {
      return sum + Number(dividend.value);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        valorInvestido,
        valorAtual,
        rentabilidade,
        rentabilidadePercentual,
        dividendosRecebidos,
        totalAtivos: assets.length,
        assets: assets.map(asset => ({
          id: asset.id,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          quantity: Number(asset.quantity),
          averagePrice: Number(asset.averagePrice),
          currentPrice: asset.currentPrice ? Number(asset.currentPrice) : null,
          totalInvestido: Number(asset.quantity) * Number(asset.averagePrice),
          totalAtual: Number(asset.quantity) * (asset.currentPrice ? Number(asset.currentPrice) : Number(asset.averagePrice)),
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
