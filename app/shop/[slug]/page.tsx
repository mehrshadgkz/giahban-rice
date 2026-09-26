// Path: /app/shop/[slug]
// File: page.tsx
// Version: 1.1.0
//
// v1.1.0: switched from static products.ts + client-side useParams() to
// a server component that fetches from Supabase via getProductBySlug().
// Stock-aware: a variant with 0 stock shows disabled with "ناموجود",
// and "add to cart" is blocked if the selected variant has no stock.
// The interactive parts (variant selection, quantity, tabs, add-to-cart)
// are split into a small client component below, since a server
// component itself can't hold that interactive state.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts, Product } from "../../lib/getProducts";
import ProductCard from "../../components/ProductCard";
import ProductDetailClient from "./ProductDetailClient";

const categoryLabels: Record<Product["category"], string> = {
  rice: "برنج",
  "rice-products": "فراورده‌های برنج",
  "northern-condiments": "سوغات و چاشنی‌های شمال",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getAllProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 pb-28 md:pb-10">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-800">خانه</Link>
        {" / "}
        <Link href={`/shop?category=${product.category}`} className="hover:text-green-800">
          {categoryLabels[product.category]}
        </Link>
        {" / "}
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} categoryLabel={categoryLabels[product.category]} />

      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold mb-6">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.slug} {...p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}