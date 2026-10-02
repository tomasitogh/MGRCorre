import { Suspense } from "react";
import { RegistrationForm } from "@/components/registration-form";
import { DniLookup } from "@/components/dni-lookup";
import { Separator } from "@/components/ui/separator";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Sponsors } from "@/components/sponsors";
import { Reveal } from "@/components/reveal";
import Image from "next/image";

export default function Home() {
  // Se lee en el servidor: no hace falta exponer NEXT_PUBLIC_* al cliente.
  const paymentAlias =
    process.env.PAYMENT_ALIAS ?? process.env.NEXT_PUBLIC_PAYMENT_ALIAS ?? "";
  const paymentName =
    process.env.PAYMENT_NAME ?? process.env.NEXT_PUBLIC_PAYMENT_NAME ?? "";

  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50/50 dark:bg-slate-950/20 py-10">
      <div className="container mx-auto px-4 max-w-2xl space-y-10">

        {/* Bienvenida: entra al instante, coreografiada con stagger de 60ms */}
        <header className="flex flex-col items-center text-center space-y-5 pt-4">
          <h1
            className="animate-hero text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-balance text-slate-900 dark:text-slate-50"
          >
            Bienvenido a la carrera{" "}
            <span className="text-[#007749] dark:text-[#00a86b]">MGRC Corre</span>
          </h1>
          <div
            className="animate-hero relative w-24 h-24 md:w-28 md:h-28"
            style={{ animationDelay: "60ms" }}
          >
            <Image
              src="/assets/mgrc.webp"
              alt="Escudo MGRC"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 96px, 112px"
            />
          </div>
          <p
            className="animate-hero text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed"
            style={{ animationDelay: "120ms" }}
          >
            Te invitamos a participar de esta carrera dentro del club con el objetivo de recaudar para la{" "}
            <span className="text-[#007749] dark:text-[#00a86b] font-bold">
              Gira Internacional a Sudáfrica
            </span>
          </p>
        </header>

        {/* Sponsors */}
        <Reveal>
          <Sponsors />
        </Reveal>

        {/* Fotos */}
        <Reveal delay={60}>
          <PhotoCarousel />
        </Reveal>

        <Separator className="my-6" />

        {/* Inscripción */}
        <Reveal>
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Formulario de inscripción</h2>
              <p className="text-sm text-muted-foreground mt-1">Completa los datos de los participantes.</p>
            </div>
            <Suspense fallback={<div className="h-64 rounded-xl bg-muted animate-pulse" aria-hidden="true" />}>
              <RegistrationForm paymentAlias={paymentAlias} paymentName={paymentName} />
            </Suspense>
          </section>
        </Reveal>

        <Separator className="my-6" />

        {/* Consulta por DNI */}
        <Reveal>
          <DniLookup />
        </Reveal>

      </div>
    </main>
  );
}
