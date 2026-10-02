// Path: app/about
// File: page.tsx
// Version: 1.2.0
//
// v1.2.0: back to 2 photo spots on the page — section 2 has ONE static
// photo (rice-field.jpg), and section 4 has the 3-photo carousel
// (AboutCarousel.tsx: white-rice.jpg, polow.jpg, grains.jpg).
// 1 static + 3 in the carousel = 4 photos total on this page.
//
// This file is a Server Component (no "use client" here) — only the
// carousel itself needs the browser, so it's kept in its own file.

import AboutCarousel from "./AboutCarousel";

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6">

      {/* ---------- Section 1: Title ---------- */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-green-800 mb-4">درباره ما</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          گیاه‌بان؛ مرجع تخصصی تأمین برنج اصیل و یکدست فریدونکنار
        </p>
      </section>

      {/* ---------- Section 2: Intro text + ONE static photo ---------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pb-16">
        <div className="order-2 md:order-1">
          <p className="text-gray-700 leading-relaxed">
            گیاه‌بان تنها یک وب‌سایت فروشگاهی نیست؛ بلکه مجموعه‌ای استوار با
            پشتوانه حضوری در پایتخت برنج ایران. تمام تلاش ما این است که
            تجربه خریدی آسان، شفاف و بی‌واسطه را برای شما فراهم کنیم تا با
            هر بار سفره انداختن، از عطر و طعم اصیل برنج شمال لذت ببرید.
          </p>
        </div>

        {/* Upload this file to public/about/rice-field.jpg */}
        <div className="order-1 md:order-2">
          <img
            src="/about/rice-field.jpg"
            alt="شالیزار برنج گیاه‌بان"
            className="w-full h-160 rounded-lg object-cover"
          />
        </div>
      </section>

      {/* ---------- Section 3: Stats bar ---------- */}
      <section className="-mx-6 bg-gray-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-lg font-semibold mb-10">
            اعداد خود حقیقت را روشن می‌کند
          </h2>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold">+۴۰</p>
              <p className="text-sm text-gray-300 mt-2">سابقه کشاورزی</p>
            </div>
            <div>
              <p className="text-4xl font-bold">٪۱۰۰</p>
              <p className="text-sm text-gray-300 mt-2">خلوص و اصالت محصولات</p>
            </div>
            <div>
              <p className="text-4xl font-bold">+۳۰۰</p>
              <p className="text-sm text-gray-300 mt-2">رضایت مشتریان</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Section 4: Guarantee + checklist + CTA + carousel ---------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16">
        {/* Upload 3 files: public/about/white-rice.jpg, polow.jpg, grains.jpg
            (see AboutCarousel.tsx for the exact list) */}
        <AboutCarousel />

        <div>
          <p className="text-green-800 font-semibold mb-2">
            تضمین ۱۰۰٪ اصالت فریدونکنار
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            عرضه مستقیم اصیل‌ترین برنج فریدونکنار؛ از شالیزار تا سفره شما
          </h2>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-700">✔</span>
              انواع برنج و محصولات فریدونکنار
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-700">✔</span>
              ارسال سریع به تمام نقاط کشور
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-700">✔</span>
              امنیت در پرداخت و تضمین ارجاع
            </li>
          </ul>

          <a
            href="/shop"
            className="inline-block bg-green-700 hover:bg-green-800 transition text-white font-medium px-6 py-3 rounded-lg"
          >
            خرید کنید
          </a>
        </div>
      </section>
    </main>
  );
}