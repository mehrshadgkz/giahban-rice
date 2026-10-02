// Path: app/about
// File: AboutCarousel.tsx
// Version: 1.1.0
//
// v1.1.0: this carousel now holds the 3 "guarantee section" photos
// (white rice, cooked polow, and the hand-holding-grain close-up).
// The 4th photo, rice-field.jpg, is NOT in here — it's used as a
// single static image elsewhere on the page (see page.tsx section 2).
//
// "use client" is required here (but NOT in page.tsx) because this
// file uses useState/useEffect, which only work in the browser.

"use client";

import { useState, useEffect } from "react";

// The 3 photos shown in this slideshow, in order. To change which
// pictures appear, just edit this list — nothing else needs to change.
const images = [
  { src: "/about/white-rice.jpg", alt: "برنج سفید گیاه‌بان" },
  { src: "/about/polow.jpg", alt: "پلوی برنج گیاه‌بان" },
  { src: "/about/grains.jpg", alt: "دانه‌های برنج گیاه‌بان" },
];

export default function AboutCarousel() {
  // activeIndex tracks which of the 3 photos is currently showing (0, 1, or 2).
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance to the next photo every 4 seconds. The cleanup function
  // (the "return () => ..." part) stops the timer when the component is
  // removed from the page, so it doesn't keep running in the background.
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

      {/* Left/right arrow buttons, layered on top of the photo */}
      <button
        onClick={goToPrevious}
        aria-label="تصویر قبلی"
        className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800"
      >
        ‹
      </button>
      <button
        onClick={goToNext}
        aria-label="تصویر بعدی"
        className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800"
      >
        ›
      </button>

      {/* Small dots at the bottom showing which photo (1 of 3, 2 of 3...)
          is active. Clicking a dot jumps straight to that photo. */}
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