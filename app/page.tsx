// Path: /app
// File: page.tsx
// Version: 1.1.0
//
// v1.1.0: switched from static data/products.ts to live Supabase fetch
// via getFeaturedProducts(), so featured/in-stock products update
// automatically as stock changes — no code edit or redeploy needed.

import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Ticker from "./components/Ticker";
import CategoryBanner from "./components/CategoryBanner";
import BlogPreview from "./components/BlogPreview";
import { getFeaturedProducts } from "./lib/getProducts";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          پرفروش‌ترین محصولات
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
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