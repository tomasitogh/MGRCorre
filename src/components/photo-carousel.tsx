"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const PHOTOS = [
  { src: "/assets/photo1.jpg", position: "center" },
  { src: "/assets/photo2.jpg", position: "50% 60%" },
  { src: "/assets/photo3.jpg", position: "center" },
  { src: "/assets/photo4.jpg", position: "center" },
];

const SWIPE_DISTANCE_PX = 60;
const SWIPE_VELOCITY_PX_PER_MS = 0.11;
const AUTOPLAY_MS = 5000;
const PAUSE_AFTER_INTERACTION_MS = 8000;

export function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pauseUntil, setPauseUntil] = useState(0);

  const dragState = useRef({ startX: 0, lastDx: 0, startTime: 0 });

  const pauseAutoplay = () => setPauseUntil(Date.now() + PAUSE_AFTER_INTERACTION_MS);

  const prevSlide = () => {
    pauseAutoplay();
    setCurrentIndex((prev) => (prev === 0 ? PHOTOS.length - 1 : prev - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === PHOTOS.length - 1 ? 0 : prev + 1));
  }, []);

  const nextSlideManual = () => {
    pauseAutoplay();
    nextSlide();
  };

  // Autoplay: apagado con reduced-motion, pausado tras interacción y en pestaña oculta
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() < pauseUntil) return;
      nextSlide();
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [nextSlide, pauseUntil]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragState.current = { startX: e.clientX, lastDx: 0, startTime: e.timeStamp };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.lastDx = dx;
    setDragOffset(dx);
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = dragState.current.lastDx;
    const elapsed = Math.max(e.timeStamp - dragState.current.startTime, 1);
    const velocity = Math.abs(dx) / elapsed;
    setDragging(false);
    setDragOffset(0);
    if (Math.abs(dx) > SWIPE_DISTANCE_PX || velocity > SWIPE_VELOCITY_PX_PER_MS) {
      if (dx < 0) nextSlideManual();
      else prevSlide();
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Carousel Container */}
      <div
        className="relative h-[250px] sm:h-[350px] md:h-[400px] w-full overflow-hidden rounded-2xl shadow-lg border border-muted/50 bg-muted touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div
          className={cn(
            "flex h-full w-full motion-reduce:transition-none",
            !dragging && "transition-transform duration-300 ease-(--ease-out)"
          )}
          style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
        >
          {PHOTOS.map(({ src, position }, index) => (
            <div key={src} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={src}
                alt={`Carrera MGRCorre foto ${index + 1}`}
                fill
                style={{ objectPosition: position }}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority={index === 0}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Flechas: solo desktop con hover real */}
      <button
        type="button"
        onClick={prevSlide}
        className="hidden [@media(hover:hover)_and_(pointer:fine)]:flex absolute top-1/2 left-4 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={nextSlideManual}
        className="hidden [@media(hover:hover)_and_(pointer:fine)]:flex absolute top-1/2 right-4 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
        aria-label="Siguiente foto"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {PHOTOS.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              pauseAutoplay();
              setCurrentIndex(index);
            }}
            className={cn(
              "w-2.5 h-2.5 rounded-full origin-center transition-[transform,background-color] duration-200 cursor-pointer",
              currentIndex === index
                ? "bg-white scale-x-[2.4]"
                : "bg-white/50 hover:bg-white/80"
            )}
            aria-label={`Ir a foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
