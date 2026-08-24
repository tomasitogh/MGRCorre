"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const PHOTOS = [
  "/assets/photo1.png",
  "/assets/photo2.png",
  "/assets/photo3.png"
];

export function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? PHOTOS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === PHOTOS.length - 1 ? 0 : prev + 1));
  };

  // Autoplay functionality
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Carousel Container */}
      <div className="relative h-[250px] sm:h-[350px] md:h-[400px] w-full overflow-hidden rounded-2xl shadow-lg border border-muted/50 bg-muted">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {PHOTOS.map((src, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={src}
                alt={`Carrera MGRCorre foto ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay for modern look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Left Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
          aria-label="Siguiente foto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {PHOTOS.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir a foto ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
