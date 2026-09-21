import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Ticker from "./components/Ticker";
import CategoryBanner from "./components/CategoryBanner";
import BlogPreview from "./components/BlogPreview";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          پرفروش‌ترین محصولات
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ProductCard
            name="برنج طارم هاشمی فریدونکنار — ۵ کیلوگرم"
            image="/rice-bag-black.png"
            weightKg={5}
            variants={[
              { label: "الک نشده", price: 2250000 },
              { label: "الک شده", price: 2400000 },
            ]}
          />
          <ProductCard
            name="برنج طارم فریدونکنار — ۵ کیلوگرم"
            image="/rice-bag-blue.png"
            weightKg={5}
            variants={[
              { label: "الک نشده", price: 2225000 },
              { label: "الک شده", price: 2375000 },
            ]}
          />
          <ProductCard
            name="برنج کهنه اعلا فریدونکنار — ۵ کیلوگرم"
            image="/rice-bag-orange.png"
            weightKg={5}
            variants={[{ label: "الک شده", price: 2350000 }]}
          />
          <ProductCard
            name="برنج کشت دوم فریدونکنار — ۵ کیلوگرم"
            image="/rice-bag-green.png"
            soldOut
            weightKg={5}
            variants={[{ label: "الک شده", price: 2500000 }]}
          />
        </div>
      </section>

      <Ticker />

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <CategoryBanner
          title="انواع برنج"
          description="با گشتی تو سایت، برنج مورد نظر خودت رو انتخاب کن"
          image="/category-rice.jpg"
          href="/shop?category=rice"
        />
        <CategoryBanner
          title="فراورده‌های برنج"
          description="از آرد برنج و دیگر محصولات پایه برنج گیاه‌بان دیدن کن"
          image="/category-rice-products.jpg"
          href="/shop?category=rice-products"
          bgColor="bg-[#7d8f7a]/10"
        />
        <CategoryBanner
          title="سوغات و چاشنی‌های شمال"
          description="اینجا ارگانیک فروشی ماست"
          image="/category-northern-condiments.jpg"
          href="/shop?category=northern-condiments"
          bgColor="bg-amber-50"
        />
      </section>

      <BlogPreview />
    </main>
  );
}