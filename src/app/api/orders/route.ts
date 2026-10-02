import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Runner } from "@/models/Runner";
import { getNextSequence } from "@/models/Counter";
import { formSchema, PRICES, get7kCategory } from "@/lib/registration";
import { isAdminAuthenticated } from "@/lib/auth";

// POST público: lo usa el formulario de inscripción (también expuesto como Server Action).
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = formSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const { participants, phone, paymentMethod, paymentReceiptUrl } = parsed.data;

    const totalAmount = participants.reduce(
      (sum, p) => sum + (PRICES[p.raceType] || 0),
      0
    );

    const order = await Order.create({
      phone,
      paymentMethod,
      paymentReceiptUrl: paymentReceiptUrl || undefined,
      totalAmount,
      status: "en revisión",
    });

    const runners: {
      name: string;
      runnerNumber: number;
      raceType: string;
      raceCategory?: string;
    }[] = [];
    for (const p of participants) {
      const runnerNumber = await getNextSequence("runnerNumber");
      const runner = await Runner.create({
        runnerNumber,
        name: p.name,
        dni: p.dni,
        age: p.age,
        raceType: p.raceType as "500m" | "3k" | "7k",
        raceCategory:
          p.raceType === "7k"
            ? (get7kCategory(p.age) as "15-30" | "30-40" | "40-50+" | undefined)
            : undefined,
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

// GET admin: requiere sesión (defensa en profundidad además del proxy).
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    await connectDB();

    // Una sola agregación en vez de N+1 countDocuments.
    const orders = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "runners",
          localField: "_id",
          foreignField: "orderId",
          as: "runners",
        },
      },
      {
        $addFields: { participantsCount: { $size: "$runners" } },
      },
      {
        $project: { runners: 0 },
      },
    ]);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
