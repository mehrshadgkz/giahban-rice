// Path: /app
// File: page.tsx
// Version: 1.0.0
//
// Homepage. Header and Footer are handled globally in layout.tsx, so
// this file only needs the homepage-specific sections.

import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Ticker from "./components/Ticker";
import CategoryBanner from "./components/CategoryBanner";
import BlogPreview from "./components/BlogPreview";
import { featuredProducts } from "./data/products";

export default function Home() {
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