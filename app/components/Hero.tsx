// Path: /app/components
// File: Hero.tsx
// Version: 1.0.0

export default function Hero() {
  return (
    <section className="relative w-full h-[420px] flex items-center justify-center text-center">
      <img
        src="/hero-rice-field.jpg"
        alt="شالیزار برنج فریدونکنار"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 px-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          برنج اصیل فریدونکنار، مستقیم به خانه شما
        </h1>
        <p className="text-white/90 mb-6">
          عطر و طعم واقعی برنج ایرانی، بدون واسطه، از کشاورزان خطه فریدونکنار
        </p>
        <a
          href="/shop"
          className="inline-block bg-green-700 hover:bg-green-800 transition text-white font-medium px-8 py-3 rounded-lg"
        >
          مشاهده فروشگاه
        </a>
      </div>
    </section>
  );
}