"use client";
// "use client" needed because we use useEffect + useState for the lazy-loaded Enamad badge

import { useEffect, useRef, useState } from "react";

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
  // Tracks whether the Enamad badge has scrolled into view yet (lazy-load, same idea as your WP version)
  const [enamadVisible, setEnamadVisible] = useState(false);
  const enamadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = enamadRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setEnamadVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 py-10 px-5" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[auto_1.4fr_1fr_1fr_1fr] gap-x-8 gap-y-6 items-start">

        {/* Column 1 — Logo */}
        <div className="flex justify-center md:justify-start">
          {/* Replace this src once you upload your real logo file to /public */}
          <img
            src="/giahban-logo.png"
            alt="برنج گیاه‌بان"
            width={110}
            height={137}
            className="w-[110px] h-auto"
          />
        </div>

        {/* Column 2 — Brand text + address */}
        <div className="flex flex-col gap-1.5 items-center md:items-start text-center md:text-right">
          <h3 className="text-[17px] font-bold text-gray-900">برنج گیاه‌بان</h3>
          <p className="text-[13px] leading-[1.8] text-gray-500 max-w-[300px]">
            گیاه‌بان؛ مرجع تخصصی تأمین برنج اصیل و یک‌دست فریدونکنار، مستقیم از
            شالیزار تا سفره شما. تعهد ما تضمین عطر، طعم و کیفیت واقعی برنج
            ایرانی است.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="opacity-70 shrink-0">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
            </svg>
            <span>فریدونکنار، ولیعصر، خیابان جزیره</span>
          </div>
        </div>

        {/* Column 3 — Main pages (hidden on mobile, matching your original) */}
        <nav className="hidden md:block" aria-label="صفحات اصلی">
          <ul className="flex flex-col gap-2.5">
            {mainPages.map((page) => (
              <li key={page.label}>
                <a href={page.href} className="text-sm text-gray-800 hover:text-green-800 transition">
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Column 4 — Guide pages */}
        <nav className="hidden md:block" aria-label="راهنما">
          <ul className="flex flex-col gap-2.5">
            {guidePages.map((page) => (
              <li key={page.label}>
                <a href={page.href} className="text-sm text-gray-800 hover:text-green-800 transition">
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Column 5 — Enamad badge + social icons */}
        <div className="flex flex-col gap-3.5 items-center md:items-start">
          {/* Enamad trust badge — only loads once scrolled into view */}
          <div ref={enamadRef}>
            {enamadVisible && (
              <a
                href="https://trustseal.enamad.ir/?id=762929&Code=dL2xacGdvYMOZcLSGbqaUA4ZYyFqRzkx"
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="origin"
              >
                <img
                  src="https://trustseal.enamad.ir/logo.aspx?id=762929&Code=dL2xacGdvYMOZcLSGbqaUA4ZYyFqRzkx"
                  alt="نماد اعتماد الکترونیکی"
                  referrerPolicy="origin"
                  className="max-w-[90px] h-auto cursor-pointer"
                />
              </a>
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3.5">
            <a
              href="https://t.me/mehrshadgk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تلگرام"
              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[#229ED9] transition"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="scale-[0.92]">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
              </svg>
            </a>

            <a
              href="https://wa.me/989308103909"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="واتساپ"
              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[#25D366] transition"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </a>

            {/* Instagram — two icons stacked, cross-fade to gradient on hover */}
            <a
              href="https://instagram.com/mehrshad_gk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="اینستاگرام"
              className="relative w-5 h-5 flex items-center justify-center group"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="absolute inset-0 text-gray-500 opacity-100 group-hover:opacity-0 transition-opacity"
              >
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
              </svg>
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <defs>
                  <linearGradient id="giahban-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FEDA75" />
                    <stop offset="25%" stopColor="#FA7E1E" />
                    <stop offset="50%" stopColor="#D62976" />
                    <stop offset="75%" stopColor="#962FBF" />
                    <stop offset="100%" stopColor="#4F5BD5" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#giahban-ig-gradient)"
                  d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}