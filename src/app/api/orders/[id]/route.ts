import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Runner } from "@/models/Runner";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    const [order, runners] = await Promise.all([
      Order.findById(id).lean(),
      Runner.find({ orderId: id }).lean(),
    ]);
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ...order, runners });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    if (!["aprobado", "rechazado", "en revisión"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
