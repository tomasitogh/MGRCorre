import { z } from "zod";

export const PRICES: Record<string, number> = {
  "500m": 3000,
  "3k": 5000,
  "7k": 8000,
};

export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export function get7kCategory(age: number): string | undefined {
  if (age >= 15 && age < 30) return "15-30";
  if (age >= 30 && age < 40) return "30-40";
  if (age >= 40 && age <= 50) return "40-50+";
  return undefined;
}

export function getRaceLabel(race: string): string {
  switch (race) {
    case "500m":
      return "500m";
    case "3k":
      return "3k";
    case "7k":
      return "7k";
    default:
      return race;
  }
}

export const participantSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  dni: z.string().min(1, "DNI requerido").regex(/^\d+$/, "Solo números"),
  age: z
    .number({ message: "Edad requerida" })
    .min(5, "Mínimo 5 años")
    .max(50, "Máximo 50 años"),
  shirtSize: z.string().min(1, "Talle requerido"),
  raceType: z.string().min(1, "Carrera requerida"),
});

export const formSchema = z.object({
  participants: z.array(participantSchema).min(1, "Al menos un participante"),
  phone: z.string().min(1, "Teléfono requerido").regex(/^\d+$/, "Solo números"),
  paymentMethod: z.enum(["transferencia", "efectivo"], {
    message: "Método requerido",
  }),
  paymentReceiptUrl: z.string().url().optional(),
});

export type RegistrationFormData = z.infer<typeof formSchema>;
