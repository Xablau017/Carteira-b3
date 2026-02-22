import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const dividends = await prisma.dividend.findMany({
      where: { userId },
      include: {
        asset: {
          select: { ticker: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Group by month for chart
    const monthlyMap = new Map<string, number>();

    for (const div of dividends) {
      const date = new Date(div.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(div.value));
    }

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        const [year, m] = month.split("-");
        const monthNames = [
          "JAN",
          "FEV",
          "MAR",
          "ABR",
          "MAI",
          "JUN",
          "JUL",
          "AGO",
          "SET",
          "OUT",
          "NOV",
          "DEZ",
        ];
        return {
          month: `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`,
          total: parseFloat(total.toFixed(2)),
        };
      });

    const totalRecebido = dividends.reduce(
      (sum, d) => sum + Number(d.value),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        dividends: dividends.map((d) => ({
          id: d.id,
          ticker: d.asset.ticker,
          name: d.asset.name,
          type: d.type,
          value: Number(d.value),
          date: d.date,
          notes: d.notes,
        })),
        monthly,
        totalRecebido: parseFloat(totalRecebido.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Dividends fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dividends" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    const { assetId, type, value, date, notes } = body;

    if (!assetId || !type || !value || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const dividend = await prisma.dividend.create({
      data: {
        userId,
        assetId: parseInt(assetId),
        type,
        value: parseFloat(value),
        date: new Date(date),
        notes: notes || null,
      },
      include: {
        asset: { select: { ticker: true } },
      },
    });

    return NextResponse.json({ success: true, dividend }, { status: 201 });
  } catch (error) {
    console.error("Dividend create error:", error);
    return NextResponse.json(
      { error: "Failed to create dividend" },
      { status: 500 },
    );
  }
}
