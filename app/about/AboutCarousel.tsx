// Path: /app/about
// File: AboutCarousel.tsx
// Version: 1.2.0
//
// v1.2.0: fixed arrow direction/position — this is an RTL (Persian)
// site, so the right-side button is "previous" (back toward the start,
// since Persian reading begins on the right) and the left-side button
// is "next." The old version had this backwards, which is what made
// the arrows feel "misplaced." Also switched from text glyphs (‹ ›) to
// lucide-react chevron icons, which render consistently across devices.

"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const images = [
  { src: "/about/white-rice.jpg", alt: "برنج سفید گیاه‌بان" },
  { src: "/about/polow.jpg", alt: "پلوی برنج گیاه‌بان" },
  { src: "/about/grains.jpg", alt: "دانه‌های برنج گیاه‌بان" },
];

export default function AboutCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      <img
        src={images[activeIndex].src}
        alt={images[activeIndex].alt}
        className="w-full h-80 object-cover"
      />

      {/* Previous — right side, since Persian reading starts on the right */}
      <button
        onClick={goToPrevious}
        aria-label="تصویر قبلی"
        className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800"
      >
        <ChevronRight size={18} />
      </button>

      {/* Next — left side */}
      <button
        onClick={goToNext}
        aria-label="تصویر بعدی"
        className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((image, index) => (
          <button
            key={image.src}
            onClick={() => setActiveIndex(index)}
            aria-label={`رفتن به تصویر ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition ${
              index === activeIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}