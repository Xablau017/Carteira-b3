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

    const assets = await prisma.asset.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

// POST - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      ticker,
      name,
      type,
      quantity,
      averagePrice,
      currentPrice,
      sector,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !ticker ||
      !name ||
      !type ||
      quantity === undefined ||
      averagePrice === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create asset in database
    const asset = await prisma.asset.create({
      data: {
        userId: parseInt(userId),
        ticker: ticker.toUpperCase(), // Always uppercase ticker
        name,
        type,
        quantity: parseFloat(quantity),
        averagePrice: parseFloat(averagePrice),
        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
        sector: sector || null,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
