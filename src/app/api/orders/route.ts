import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Runner } from "@/models/Runner";
import { getNextSequence } from "@/models/Counter";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { participants, phone, paymentMethod, paymentReceiptUrl } = body;

    if (!participants?.length || !phone || !paymentMethod) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const PRICES: Record<string, number> = { "500m": 3000, "3k": 5000, "7k": 8000 };
    const totalAmount = participants.reduce(
      (sum: number, p: { raceType: string }) => sum + (PRICES[p.raceType] || 0),
      0
    );

    const order = await Order.create({
      phone,
      paymentMethod,
      paymentReceiptUrl: paymentReceiptUrl || undefined,
      totalAmount,
      status: "en revisión",
    });

    const runners = [];
    for (const p of participants) {
      const runnerNumber = await getNextSequence("runnerNumber");
      const runner = await Runner.create({
        runnerNumber,
        name: p.name,
        dni: p.dni,
        age: p.age,
        raceType: p.raceType,
        raceCategory: p.raceCategory || undefined,
        shirtSize: p.shirtSize,
        orderId: order._id,
      });
      runners.push(runner);
    }

    return NextResponse.json({
      orderId: order._id,
      runners: runners.map((r) => ({
        name: r.name,
        runnerNumber: r.runnerNumber,
        raceType: r.raceType,
        raceCategory: r.raceCategory,
      })),
      totalAmount,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const ordersWithCount = await Promise.all(
      orders.map(async (order) => {
        const count = await Runner.countDocuments({ orderId: order._id });
        return { ...order, participantsCount: count };
      })
    );

    return NextResponse.json(ordersWithCount);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
