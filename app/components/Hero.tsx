// Hero — the big banner right under the header on the homepage.
// Background image + heading + subtitle + call-to-action button.

export default function Hero() {
  return (
    <section className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center text-center overflow-hidden">
      {/* Background image — replace with your real rice field photo in /public */}
      <img
        src="/hero-rice-field.jpg"
        alt="مزرعه برنج فریدونکنار"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay so white text stays readable over the photo */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content sits above the image/overlay */}
      <div className="relative z-10 px-6 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          برنج اصیل فریدونکنار مستقیم به خانه شما
        </h1>
        <p className="text-white/90 text-base md:text-lg mb-8">
          کیفیت خالص، بدون واسطه — از مزارع فریدونکنار تا سفره‌های شما
        </p>
        <a
          href="/shop"
          className="inline-block bg-green-700 hover:bg-green-800 transition text-white font-medium px-8 py-3 rounded-lg"
        >
          خرید کنید
        </a>
      </div>
    </section>
  );
}