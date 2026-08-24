import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Runner } from "@/models/Runner";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const dni = req.nextUrl.searchParams.get("dni");

    if (!dni) {
      return NextResponse.json({ error: "DNI requerido" }, { status: 400 });
    }

    const runners = await Runner.find({ dni }).populate("orderId").lean();

    if (!runners.length) {
      return NextResponse.json({ error: "No se encontraron inscripciones para ese DNI" }, { status: 404 });
    }

    const results = runners.map((r) => ({
      name: r.name,
      runnerNumber: r.runnerNumber,
      age: r.age,
      raceType: r.raceType,
      raceCategory: r.raceCategory,
      shirtSize: r.shirtSize,
      status: (r.orderId as unknown as { status: string })?.status || "desconocido",
    }));

    return NextResponse.json({ runners: results });
  } catch (error) {
    console.error("Error looking up DNI:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
