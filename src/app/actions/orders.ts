"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Runner } from "@/models/Runner";
import { getNextSequence } from "@/models/Counter";
import {
  formSchema,
  PRICES,
  get7kCategory,
  type RegistrationFormData,
} from "@/lib/registration";
import { isAdminAuthenticated } from "@/lib/auth";

export interface CreateOrderResult {
  orderId: string;
  runners: {
    name: string;
    runnerNumber: number;
    raceType: string;
    raceCategory?: string;
  }[];
  totalAmount: number;
}

export async function createOrderAction(
  data: RegistrationFormData
): Promise<CreateOrderResult> {
  const parsed = formSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos inválidos");
  }

  const { participants, phone, paymentMethod, paymentReceiptUrl } = parsed.data;

  if (
    paymentMethod === "transferencia" &&
    (!paymentReceiptUrl || paymentReceiptUrl.trim() === "")
  ) {
    throw new Error("El comprobante de pago es requerido para transferencia");
  }

  await connectDB();

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

  // Secuencial a propósito: getNextSequence debe ser atómico por corredor.
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

  return {
    orderId: String(order._id),
    runners: runners.map((r) => ({
      name: r.name,
      runnerNumber: r.runnerNumber,
      raceType: r.raceType,
      raceCategory: r.raceCategory,
    })),
    totalAmount,
  };
}

const STATUS_VALUES = ["aprobado", "rechazado", "en revisión"] as const;

export async function updateOrderStatusAction(orderId: string, status: string) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("No autorizado");
  }
  if (!(STATUS_VALUES as readonly string[]).includes(status)) {
    throw new Error("Status inválido");
  }

  await connectDB();
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).lean();

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return { status: order.status };
}
