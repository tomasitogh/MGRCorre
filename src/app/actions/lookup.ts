"use server";

import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Runner } from "@/models/Runner";

const dniSchema = z.string().trim().min(1, "DNI requerido").regex(/^\d+$/, "Solo números");

export interface LookupRunner {
  name: string;
  runnerNumber: number;
  age: number;
  raceType: string;
  raceCategory?: string;
  shirtSize: string;
  status: string;
}

export async function lookupByDniAction(dni: string): Promise<LookupRunner[]> {
  const parsed = dniSchema.safeParse(dni);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "DNI inválido");
  }

  await connectDB();
  const runners = await Runner.find({ dni: parsed.data })
    .populate("orderId")
    .lean();

  if (!runners.length) {
    throw new Error("No se encontraron inscripciones para ese DNI");
  }

  return runners.map((r) => ({
    name: r.name,
    runnerNumber: r.runnerNumber,
    age: r.age,
    raceType: r.raceType,
    raceCategory: r.raceCategory,
    shirtSize: r.shirtSize,
    status:
      (r.orderId as unknown as { status: string } | null)?.status ||
      "desconocido",
  }));
}
