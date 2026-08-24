"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import { Plus, Trash2 } from "lucide-react";

const PRICES: Record<string, number> = { "500m": 3000, "3k": 5000, "7k": 8000 };
const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

function getRaceForAge(age: number): string | null {
  if (age >= 5 && age <= 9) return "500m";
  if (age >= 9 && age <= 14) return "3k";
  if (age >= 15 && age <= 50) return "7k";
  return null;
}

function get7kCategory(age: number): string | undefined {
  if (age >= 15 && age < 30) return "15-30";
  if (age >= 30 && age < 40) return "30-40";
  if (age >= 40 && age <= 50) return "40-50+";
  return undefined;
}

function getRaceLabel(race: string): string {
  switch (race) {
    case "500m": return "500m – Kids (5 a 9 años)";
    case "3k": return "3k – Juveniles (9 a 14 años)";
    case "7k": return "7k – Adults (15 a 50+ años)";
    default: return race;
  }
}

const participantSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  dni: z.string().min(1, "DNI requerido").regex(/^\d+$/, "Solo números"),
  age: z.number({ message: "Edad requerida" }).min(5, "Mínimo 5 años").max(50, "Máximo 50 años"),
  shirtSize: z.string().min(1, "Talle requerido"),
  raceType: z.string().min(1, "Carrera requerida"),
}).refine(
  (data) => {
    const age = Number(data.age);
    if (isNaN(age)) return false;
    if (data.raceType === "500m") return age >= 5 && age <= 9;
    if (data.raceType === "3k") return age >= 9 && age <= 14;
    if (data.raceType === "7k") return age >= 15 && age <= 50;
    return true;
  },
  {
    message: "La edad no coincide con el rango permitido para esta carrera",
    path: ["raceType"],
  }
);

const formSchema = z.object({
  participants: z.array(participantSchema).min(1, "Al menos un participante"),
  phone: z.string().min(1, "Teléfono requerido").regex(/^\d+$/, "Solo números"),
  paymentMethod: z.enum(["transferencia", "efectivo"], { message: "Método requerido" }),
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationSuccess {
  orderId: string;
  runners: { name: string; runnerNumber: number; raceType: string; raceCategory?: string }[];
  totalAmount: number;
}

interface ParticipantCardProps {
  index: number;
  control: any;
  register: any;
  errors: any;
  remove: (index: number) => void;
  showRemove: boolean;
  setValue: any;
}

function ParticipantCard({
  index,
  control,
  register,
  errors,
  remove,
  showRemove,
  setValue,
}: ParticipantCardProps) {
  const race = useWatch({ control, name: `participants.${index}.raceType` });
  const age = useWatch({ control, name: `participants.${index}.age` });
  const shirtSize = useWatch({ control, name: `participants.${index}.shirtSize` });

  return (
    <Card className="relative animate-card-entry">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Participante {index + 1}
            {race && (
              <span className="ml-2 text-primary font-semibold">
                → {getRaceLabel(race)}
                {race === "7k" && age && get7kCategory(Number(age)) ? ` (${get7kCategory(Number(age))})` : ""}
              </span>
            )}
          </span>
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.name`}>Nombre</Label>
            <Input
              {...register(`participants.${index}.name`)}
              placeholder="Nombre completo"
            />
            {errors?.[index]?.name && (
              <p className="text-xs text-destructive">
                {errors[index].name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.dni`}>DNI</Label>
            <Input
              {...register(`participants.${index}.dni`)}
              placeholder="12345678"
            />
            {errors?.[index]?.dni && (
              <p className="text-xs text-destructive">
                {errors[index].dni.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.age`}>Edad</Label>
            <Input
              type="number"
              {...register(`participants.${index}.age`, { valueAsNumber: true })}
              placeholder="Ej: 25"
              min={5}
              max={50}
            />
            {errors?.[index]?.age && (
              <p className="text-xs text-destructive">
                {errors[index].age.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.raceType`}>Carrera</Label>
            <Select
              value={race || ""}
              onValueChange={(val) => {
                setValue(`participants.${index}.raceType` as any, val, { shouldValidate: true });
              }}
            >
              <SelectTrigger id={`participants.${index}.raceType`}>
                <SelectValue placeholder="Seleccionar carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500m">🏃 500m (5 a 9 años)</SelectItem>
                <SelectItem value="3k">🏃 3k (9 a 14 años)</SelectItem>
                <SelectItem value="7k">🏃 7k (15 a 50+ años)</SelectItem>
              </SelectContent>
            </Select>
            {errors?.[index]?.raceType && (
              <p className="text-xs text-destructive">
                {errors[index].raceType.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.shirtSize`}>Talle de camiseta</Label>
            <Select
              value={shirtSize || ""}
              onValueChange={(val) => {
                setValue(`participants.${index}.shirtSize` as any, val, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar talle" />
              </SelectTrigger>
              <SelectContent>
                {SHIRT_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.[index]?.shirtSize && (
              <p className="text-xs text-destructive">
                {errors[index].shirtSize.message}
              </p>
            )}
          </div>
        </div>
        {age && race === "500m" && (Number(age) < 5 || Number(age) > 9) && (
          <p className="text-xs text-destructive mt-2">
            Edad fuera del rango para 500m (debe tener entre 5 y 9 años)
          </p>
        )}
        {age && race === "3k" && (Number(age) < 9 || Number(age) > 14) && (
          <p className="text-xs text-destructive mt-2">
            Edad fuera del rango para 3k (debe tener entre 9 y 14 años)
          </p>
        )}
        {age && race === "7k" && (Number(age) < 15 || Number(age) > 50) && (
          <p className="text-xs text-destructive mt-2">
            Edad fuera del rango para 7k (debe tener entre 15 y 50 años)
          </p>
        )}
        {age && (Number(age) < 5 || Number(age) > 50) && (
          <p className="text-xs text-destructive mt-2">
            Edad fuera del rango permitido general (5 a 50 años)
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function RegistrationForm() {
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: [{ name: "", dni: "", age: 0, shirtSize: "", raceType: "" }],
      phone: "",
      paymentMethod: "efectivo",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const watchPaymentMethod = form.watch("paymentMethod");

  // Watch only the raceType fields for total computation to avoid re-rendering when names or DNI values are typed
  const participantRaces = useWatch({
    control: form.control,
    name: fields.map((_, idx) => `participants.${idx}.raceType` as `participants.${number}.raceType`),
  });

  const total = useMemo(() => {
    const races = Array.isArray(participantRaces)
      ? participantRaces
      : typeof participantRaces === "string"
      ? [participantRaces]
      : [];
    return races.reduce((sum, race) => sum + (race && PRICES[race] ? PRICES[race] : 0), 0);
  }, [participantRaces]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const participants = data.participants.map((p) => {
        const race = p.raceType;
        return {
          ...p,
          raceType: race,
          raceCategory: race === "7k" ? get7kCategory(p.age) : undefined,
        };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
          paymentReceiptUrl: receiptUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al inscribirse");
        return;
      }

      const result = await res.json();
      setSuccess(result);
    } catch {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">¡Inscripción exitosa!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Tu inscripción fue registrada correctamente.
          </p>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            {success.runners.map((r) => (
              <div key={r.runnerNumber} className="flex justify-between text-sm">
                <span>{r.name}</span>
                <span className="font-mono font-bold">
                  #{r.runnerNumber} ({r.raceType}{r.raceCategory ? ` ${r.raceCategory}` : ""})
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Total: ${success.totalAmount.toLocaleString("es-AR")}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(null);
              setReceiptUrl(null);
              form.reset();
            }}
          >
            Nueva inscripción
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Participantes</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", dni: "", age: 0, shirtSize: "", raceType: "" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar participante
          </Button>
        </div>

        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            index={index}
            control={form.control}
            register={form.register}
            errors={form.formState.errors.participants}
            remove={remove}
            showRemove={fields.length > 1}
            setValue={form.setValue}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono de contacto</Label>
          <Input
            {...form.register("phone")}
            placeholder="1122334455"
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="paymentMethod">Método de pago</Label>
          <Select
            defaultValue="efectivo"
            onValueChange={(val) => {
              if (val) form.setValue("paymentMethod", val as "transferencia" | "efectivo");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {watchPaymentMethod === "transferencia" && (
          <Card className="bg-muted">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm">
                Debes abonar <strong>${total.toLocaleString("es-AR")}</strong> al alias:{" "}
                <strong>{process.env.NEXT_PUBLIC_PAYMENT_ALIAS}</strong> a nombre de{" "}
                <strong>{process.env.NEXT_PUBLIC_PAYMENT_NAME}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                El comprobante de pago lo revisará una persona real, por ende necesitamos
                que lo cargues.
              </p>
              <div className="space-y-1">
                <Label>Comprobante de pago</Label>
                <UploadButton
                  endpoint="receiptUploader"
                  onClientUploadComplete={(res) => {
                    if (res[0]) setReceiptUrl(res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Error: ${error.message}`);
                  }}
                />
                {receiptUrl && (
                  <p className="text-xs text-green-600">Comprobante cargado correctamente</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="border-t pt-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Total a pagar:</span>
          <span className="ml-2 text-2xl font-bold">${total.toLocaleString("es-AR")}</span>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Inscribirse"}
        </Button>
      </div>
    </form>
  );
}
