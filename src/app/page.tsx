import { RegistrationForm } from "@/components/registration-form";
import { DniLookup } from "@/components/dni-lookup";
import { Separator } from "@/components/ui/separator";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Sponsors } from "@/components/sponsors";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl space-y-10">
        
        {/* Hero / Header Section */}
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-28 h-28 md:w-32 md:h-32 transition-transform duration-300 hover:scale-105">
            <Image
              src="/assets/mgrc.webp"
              alt="Escudo MGRC"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            MGRCorre
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
            Te invitamos a participar de esta carrera dentro del club con el objetivo de recaudar para la{" "}
            <span className="text-[#007749] dark:text-[#00a86b] font-bold">
              Gira Internacional a Sudáfrica
            </span>
          </p>
        </header>

        {/* Sponsors Marquee */}
        <section>
          <Sponsors />
        </section>

        {/* Photo Gallery Carousel */}
        <section className="py-2">
          <PhotoCarousel />
        </section>

        <Separator className="my-6" />

        {/* Registration Form */}
        <section className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Formulario de inscripción</h2>
            <p className="text-sm text-muted-foreground mt-1">Completa los datos de los participantes.</p>
          </div>
          <RegistrationForm />
        </section>

        <Separator className="my-6" />

        {/* DNI State Lookup */}
        <section>
          <DniLookup />
        </section>
        
      </div>
    </main>
  );
}
