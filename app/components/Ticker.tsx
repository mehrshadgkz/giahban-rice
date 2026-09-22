// Path: /app/components
// File: Ticker.tsx
// Version: 1.0.0
//
// "use client" needed — this component manipulates the DOM directly with
// requestAnimationFrame and touch events, which only work in the browser.

"use client";

import { useEffect, useRef } from "react";

// Your news items — later this could come from the admin panel instead of being hardcoded.
const tickerItems = [
  "🌾 برداشت تازه برنج طارم هاشمی ۱۴۰۵ تمام شد",
  "🌾 ارسال رایگان از ۵۰ کیلوگرم با باربری فریدونکنار به تهران",
  "🌾 تحویل تا حداکثر ۷ روز به تمام کشور",
  "🌾 امکان سفارش بدون ثبت نام برای شما فراهم شده است",
  "🌾 سوالات خود را در صفحه سوالات متداول جستجو کنید",
  "🌾 برای مشاوره خرید با ما تماس بگیرید",
];

export default function Ticker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let baseSpeed = window.innerWidth < 768 ? 1.6 : 2.4;
    let position = 0;
    let paused = false;
    let currentSpeed = baseSpeed;
    const friction = 0.95;

    let halfWidth = ticker.scrollWidth / 2;

    function applyTransform() {
      if (ticker) ticker.style.transform = `translateX(${position - halfWidth}px)`;
    }

    let animationFrameId: number;
    function loop() {
      if (!paused) {
        currentSpeed = baseSpeed + (currentSpeed - baseSpeed) * friction;
        position += currentSpeed;
        position = ((position % halfWidth) + halfWidth) % halfWidth;
        applyTransform();
      }
      animationFrameId = requestAnimationFrame(loop);
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        baseSpeed = window.innerWidth < 768 ? 1.6 : 2.4;
        halfWidth = ticker!.scrollWidth / 2;
      }, 200);
    }
    window.addEventListener("resize", handleResize);

    function handleMouseEnter() {
      paused = true;
    }
    function handleMouseLeave() {
      paused = false;
    }
    ticker.addEventListener("mouseenter", handleMouseEnter);
    ticker.addEventListener("mouseleave", handleMouseLeave);

    let touchStartX = 0;
    let touchStartPosition = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let lastDelta = 0;

    function handleTouchStart(e: TouchEvent) {
      paused = true;
      touchStartX = e.touches[0].clientX;
      touchStartPosition = position;
      lastTouchX = touchStartX;
      lastTouchTime = performance.now();
      lastDelta = 0;
    }

    function handleTouchMove(e: TouchEvent) {
      const touchX = e.touches[0].clientX;
      const now = performance.now();
      const delta = touchX - touchStartX;

      let newPosition = touchStartPosition + delta;
      newPosition = ((newPosition % halfWidth) + halfWidth) % halfWidth;
      position = newPosition;
      applyTransform();

      const dt = now - lastTouchTime;
      if (dt > 0) {
        lastDelta = (touchX - lastTouchX) / dt;
      }
      lastTouchX = touchX;
      lastTouchTime = now;
    }

    function handleTouchEnd() {
      paused = false;
      let flickVelocity = lastDelta * 16.6 * 3;
      const maxVelocity = 60;
      flickVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, flickVelocity));
      currentSpeed = flickVelocity;
    }

    ticker.addEventListener("touchstart", handleTouchStart, { passive: true });
    ticker.addEventListener("touchmove", handleTouchMove, { passive: true });
    ticker.addEventListener("touchend", handleTouchEnd);

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      ticker.removeEventListener("mouseenter", handleMouseEnter);
      ticker.removeEventListener("mouseleave", handleMouseLeave);
      ticker.removeEventListener("touchstart", handleTouchStart);
      ticker.removeEventListener("touchmove", handleTouchMove);
      ticker.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden bg-[#4F6F3A] py-2.5" dir="ltr">
      <div ref={tickerRef} className="flex items-center w-max touch-pan-y" style={{ direction: "ltr" }}>
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span
            key={index}
            className="whitespace-nowrap px-6 md:px-12 text-white text-sm md:[15px] font-medium select-none"
            style={{ direction: "rtl", unicodeBidi: "isolate" }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}