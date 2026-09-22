// Path: /app/components
// File: Footer.tsx
// Version: 1.0.0
//
// "use client" needed for the lazy-loaded Enamad trust badge script,
// which only initializes once the footer scrolls into view.

"use client";

import { useEffect, useRef } from "react";
import { Instagram, MessageCircle, Send, MapPin } from "lucide-react";

const mainPages = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/shop" },
  { label: "بلاگ", href: "/blog" },
];

const guidePages = [
  { label: "سوالات متداول", href: "/faq" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export default function Footer() {
  const enamadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Placeholder for Enamad trust-badge script injection once
          // the real Enamad code/id is available.
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (enamadRef.current) {
      observer.observe(enamadRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-green-800 mb-3">برنج گیاه‌بان</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            گیاه‌بان؛ مرجع تخصصی تأمین برنج اصیل و یکدست فریدونکنار، مستقیم از شالیزار تا سفره شما.
            تعهد ما تضمین عطر، طعم و کیفیت واقعی برنج ایرانی است.
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} /> فریدونکنار، خیابان ولیعصر، جزیره
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">خانه</h4>
          <ul className="space-y-2 text-sm">
            {mainPages.map((page) => (
              <li key={page.label}>
                <a href={page.href} className="text-gray-600 hover:text-green-800">
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">سوالات متداول</h4>
          <ul className="space-y-2 text-sm">
            {guidePages.map((page) => (
              <li key={page.label}>
                <a href={page.href} className="text-gray-600 hover:text-green-800">
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">اعتماد الکترونیکی</h4>
          <div ref={enamadRef} className="w-20 h-20 bg-gray-100 rounded" />
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="اینستاگرام" className="text-gray-500 hover:text-green-800">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="واتساپ" className="text-gray-500 hover:text-green-800">
              <MessageCircle size={20} />
            </a>
            <a href="#" aria-label="تلگرام" className="text-gray-500 hover:text-green-800">
              <Send size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}