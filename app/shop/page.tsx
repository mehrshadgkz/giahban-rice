// Path: /app/shop
// File: page.tsx
// Version: 1.1.0
//
// v1.1.0: switched from static data/products.ts to live Supabase fetch
// via getAllProducts().

import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../lib/getProducts";
import Link from "next/link";

const categories = [
  { label: "همه محصولات", value: undefined },
  { label: "انواع برنج", value: "rice" },
  { label: "فراورده‌های برنج", value: "rice-products" },
  { label: "سوغات و چاشنی‌های شمال", value: "northern-condiments" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allProducts = await getAllProducts();

  const filteredProducts = category
    ? allProducts.filter((p) => p.category === category)
    : allProducts;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">فروشگاه</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const isActive = category === cat.value;
          const href = cat.value ? `/shop?category=${cat.value}` : "/shop";
          return (
            <Link
              key={cat.label}
              href={href}
              className={`text-sm px-4 py-2 rounded-lg border transition ${
                isActive
                  ? "bg-green-800 text-white border-green-800"
                  : "border-gray-300 text-gray-700 hover:border-green-800"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">محصولی در این دسته پیدا نشد.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      )}
    </main>
  );
}