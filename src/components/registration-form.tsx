"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
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
import { Minus, Plus, Banknote, Landmark } from "lucide-react";
import { createOrderAction } from "@/app/actions/orders";
import {
  PRICES,
  SHIRT_SIZES,
  get7kCategory,
  getRaceLabel,
  formSchema,
  type RegistrationFormData,
} from "@/lib/registration";
import { cn } from "@/lib/utils";

type ParticipantKind = "adulto" | "nino";

const RACE_OPTIONS = [
  { value: "500m", label: "🏃 500m" },
  { value: "3k", label: "🏃 3k" },
  { value: "7k", label: "🏃 7k" },
] as const;

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToLastCard() {
  const cards = document.querySelectorAll("[data-participant-card]");
  const last = cards[cards.length - 1];
  last?.scrollIntoView({
    behavior: isReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

interface RegistrationSuccess {
  orderId: string;
  runners: { name: string; runnerNumber: number; raceType: string; raceCategory?: string }[];
  totalAmount: number;
}

function CountStepper({
  label,
  count,
  onChange,
}: {
  label: string;
  count: number;
  onChange: (delta: 1 | -1) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
      <span className="text-base font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          aria-label={`Quitar ${label.toLowerCase()}`}
          className="h-11 w-11 rounded-full"
          disabled={count === 0}
          onClick={() => onChange(-1)}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span
          key={count}
          className="animate-pop inline-block w-8 text-center text-2xl font-bold tabular-nums"
        >
          {count}
        </span>
        <Button
          type="button"
          variant="outline"
          aria-label={`Agregar ${label.toLowerCase()}`}
          className="h-11 w-11 rounded-full"
          onClick={() => onChange(1)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ParticipantCard({
  index,
  title,
  control,
  register,
  errors,
  setValue,
  leaving,
}: {
  index: number;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  leaving: boolean;
}) {
  const race = useWatch({ control, name: `participants.${index}.raceType` });
  const age = useWatch({ control, name: `participants.${index}.age` });
  const shirtSize = useWatch({ control, name: `participants.${index}.shirtSize` });

  return (
    <Card
      data-participant-card
      className={cn("relative scroll-mt-24", leaving ? "animate-card-exit" : "animate-card-entry")}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
            {race && (
              <span className="ml-2 text-primary font-semibold">
                → {getRaceLabel(race ?? "")}
                {race === "7k" && age && get7kCategory(Number(age)) ? ` (${get7kCategory(Number(age))})` : ""}
              </span>
            )}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`participants.${index}.name`}>Nombre y apellido</Label>
            <Input
              {...register(`participants.${index}.name`)}
              placeholder="Nombre completo"
              autoComplete="off"
            />
            {errors?.[index]?.name && (
              <p className="text-xs text-destructive">{errors[index].name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`participants.${index}.dni`}>DNI</Label>
              <Input
                {...register(`participants.${index}.dni`)}
                placeholder="12345678"
                inputMode="numeric"
              />
              {errors?.[index]?.dni && (
                <p className="text-xs text-destructive">{errors[index].dni.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`participants.${index}.age`}>Edad</Label>
              <Input
                type="number"
                inputMode="numeric"
                {...register(`participants.${index}.age`, { valueAsNumber: true })}
                placeholder="Ej: 25"
                min={5}
                max={50}
              />
              {errors?.[index]?.age && (
                <p className="text-xs text-destructive">{errors[index].age.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`participants.${index}.raceType`}>Carrera</Label>
              <Select
                value={race || ""}
                onValueChange={(val) => {
                  setValue(`participants.${index}.raceType`, val, { shouldValidate: true });
                }}
              >
                <SelectTrigger id={`participants.${index}.raceType`} className="w-full">
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  {RACE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.[index]?.raceType && (
                <p className="text-xs text-destructive">{errors[index].raceType.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`participants.${index}.shirtSize`}>Talle de remera</Label>
              <Select
                value={shirtSize || ""}
                onValueChange={(val) => {
                  setValue(`participants.${index}.shirtSize`, val, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
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
                <p className="text-xs text-destructive">{errors[index].shirtSize.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RegistrationForm({
  paymentAlias,
  paymentName,
}: {
  paymentAlias: string;
  paymentName: string;
}) {
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tipos por tarjeta (cliente únicamente; NO viaja al servidor).
  const [kinds, setKinds] = useState<ParticipantKind[]>([]);
  const [leaving, setLeaving] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: [],
      phone: "",
      paymentMethod: "efectivo",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const watchPaymentMethod = form.watch("paymentMethod");

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

  const adultCount = useMemo(() => kinds.filter((k) => k === "adulto").length, [kinds]);
  const kidCount = kinds.length - adultCount;

  function changeCount(kind: ParticipantKind, delta: 1 | -1) {
    if (delta === 1) {
      append({ name: "", dni: "", age: 0, shirtSize: "", raceType: "" });
      setKinds((k) => [...k, kind]);
      timers.current.push(setTimeout(scrollToLastCard, 100));
      return;
    }
    const idx = (() => {
      for (let i = kinds.length - 1; i >= 0; i--) if (kinds[i] === kind) return i;
      return -1;
    })();
    if (idx === -1) return;
    const fieldId = fields[idx]?.id;
    if (!fieldId || leaving.includes(fieldId)) return;
    setLeaving((l) => [...l, fieldId]);
    timers.current.push(
      setTimeout(() => {
        remove(idx);
        setKinds((k) => k.filter((_, i) => i !== idx));
        setLeaving((l) => l.filter((id) => id !== fieldId));
      }, 190) // slideOutCard dura 180ms
    );
  }

  function titleFor(index: number): string {
    const kind = kinds[index];
    const n = kinds.slice(0, index + 1).filter((k) => k === kind).length;
    return kind === "nino" ? `Niño ${n}` : `Adulto ${n}`;
  }

  async function onSubmit(data: RegistrationFormData) {
    if (data.paymentMethod === "transferencia" && !receiptUrl) {
      toast.error("Cargá el comprobante de pago antes de inscribirte");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createOrderAction({
        ...data,
        paymentReceiptUrl: receiptUrl || undefined,
      });
      setSuccess(result);
      toast.success("¡Inscripción exitosa!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al inscribirse");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="border-primary/20 animate-card-entry">
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
              setKinds([]);
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Paso 1: ¿Quiénes se inscriben? */}
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-extrabold tracking-tight">¿Quiénes se inscriben?</h3>
        <p className="text-sm text-muted-foreground">
          Elegí cuántos adultos y cuántos niños participan.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <CountStepper label="Adultos" count={adultCount} onChange={(d) => changeCount("adulto", d)} />
          <CountStepper label="Niños" count={kidCount} onChange={(d) => changeCount("nino", d)} />
        </div>
      </div>

      {/* Paso 2: una tarjeta por persona */}
      <div className="space-y-4">
        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Sumá adultos o niños con los botones de arriba para cargar sus datos.
          </div>
        )}
        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            index={index}
            title={titleFor(index)}
            control={form.control}
            register={form.register}
            errors={form.formState.errors.participants}
            setValue={form.setValue}
            leaving={leaving.includes(field.id)}
          />
        ))}
      </div>

      {fields.length > 0 && (
        <>
          {/* Paso 3: contacto */}
          <div className="space-y-1">
            <Label htmlFor="phone">Teléfono de contacto</Label>
            <Input
              {...form.register("phone")}
              placeholder="1122334455"
              inputMode="tel"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Paso 4: pago */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
            <div role="group" aria-label="Método de pago" className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={watchPaymentMethod === "efectivo"}
                onClick={() => form.setValue("paymentMethod", "efectivo", { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]",
                  watchPaymentMethod === "efectivo"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                <Banknote className="h-6 w-6" />
                Efectivo
              </button>
              <button
                type="button"
                aria-pressed={watchPaymentMethod === "transferencia"}
                onClick={() => form.setValue("paymentMethod", "transferencia", { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]",
                  watchPaymentMethod === "transferencia"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                <Landmark className="h-6 w-6" />
                Transferencia
              </button>
            </div>

            {/* Detalle de transferencia: reveal por grid-rows (animación de layout única,
                ocasional y liviana; el contenido interno solo hace fade) */}
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-(--ease-out)",
                watchPaymentMethod === "transferencia"
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden min-h-0">
                <Card className="bg-muted">
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-sm">
                      Debes abonar <strong>${total.toLocaleString("es-AR")}</strong> al alias:{" "}
                      <strong>{paymentAlias}</strong> a nombre de{" "}
                      <strong>{paymentName}</strong>.
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
                          if (res[0]) {
                            setReceiptUrl(res[0].url);
                            toast.success("Comprobante cargado correctamente");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Error: ${error.message}`);
                        }}
                      />
                      {receiptUrl && (
                        <p className="text-xs text-green-600">Comprobante cargado correctamente</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Cierre */}
          <div className="border-t pt-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-sm text-muted-foreground">Total a pagar:</span>
              <span className="ml-2 text-2xl font-bold">${total.toLocaleString("es-AR")}</span>
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting || fields.length === 0}>
              {isSubmitting ? "Enviando..." : "Inscribirse"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
