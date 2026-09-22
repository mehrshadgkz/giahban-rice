// Path: /app/shop/[slug]
// File: page.tsx
// Version: 1.0.0
//
// Product detail page — one file handles every product because of the
// [slug] folder name. Next.js reads whatever comes after /shop/ in the
// URL and hands it to us as `slug`, then we look that product up in
// products.ts.
//
// Rebuilds the original WooCommerce product page layout: breadcrumb,
// variant selection with extra per-variant info, quantity selector,
// meta row, tabs (description / specs / reviews), related products,
// and a sticky mobile bottom bar.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { products, Product } from "../../data/products";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";

const categoryLabels: Record<Product["category"], string> = {
  rice: "برنج",
  "rice-products": "فراورده‌های برنج",
  "northern-condiments": "سوغات و چاشنی‌های شمال",
};

function formatToman(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">(
    "description"
  );
  const [added, setAdded] = useState(false);

  if (!product) {
    notFound();
  }

  const hasMultipleVariants = product.variants.length > 1;
  const selectedVariant = hasMultipleVariants
    ? selectedIndex !== null
      ? product.variants[selectedIndex]
      : null
    : product.variants[0];

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const isRange = hasMultipleVariants && minPrice !== maxPrice;

  const hasSpecs = product.specs && Object.keys(product.specs).length > 0;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem(
      {
        slug: product!.slug,
        name: product!.name,
        image: product!.image,
        variantLabel: selectedVariant.label,
        price: selectedVariant.price,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

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

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          {product.soldOut ? (
            <span className="inline-block text-sm text-gray-400 border border-gray-300 rounded px-4 py-2 mb-4">
              تمام شده
            </span>
          ) : (
            <div className="mb-4">
              <p className="text-green-800 font-bold text-xl">
                {selectedVariant
                  ? `${formatToman(selectedVariant.price)} تومان`
                  : isRange
                  ? `${formatToman(minPrice)} – ${formatToman(maxPrice)} تومان`
                  : `${formatToman(minPrice)} تومان`}
              </p>
              {selectedVariant && (
                <p className="text-sm text-gray-500 mt-1">
                  قیمت هر کیلوگرم:{" "}
                  {formatToman(Math.round(selectedVariant.price / product.weightKg))} تومان
                </p>
              )}
            </div>
          )}

          {product.shortDescription && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          {!product.soldOut && (
            <>
              {hasMultipleVariants && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant.label}
                        onClick={() => setSelectedIndex(index)}
                        className={`text-sm px-4 py-2 rounded-md border transition ${
                          selectedIndex === index
                            ? "bg-green-800 text-white border-green-800"
                            : "border-gray-300 text-gray-700 hover:border-green-800"
                        }`}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                  {selectedIndex !== null && (
                    <button
                      onClick={() => setSelectedIndex(null)}
                      className="text-xs text-gray-400 underline mt-2"
                    >
                      پاک کردن
                    </button>
                  )}
                </div>
              )}

              {selectedVariant?.brokenRicePercent !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                  حدود {selectedVariant.brokenRicePercent} درصد وزنی برنج شکسته
                </p>
              )}
              {selectedVariant?.suitability && (
                <p className="text-sm text-gray-600">{selectedVariant.suitability}</p>
              )}
              {selectedVariant?.availability && (
                <p className="text-sm mt-1">
                  دسترسی:{" "}
                  <span
                    className={
                      selectedVariant.availability === "موجود"
                        ? "text-green-700 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {selectedVariant.availability}
                  </span>
                </p>
              )}

              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={hasMultipleVariants && !selectedVariant}
                  className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-white font-medium px-6 py-2.5 rounded-lg"
                >
                  {added
                    ? "اضافه شد ✓"
                    : hasMultipleVariants && !selectedVariant
                    ? "یک گزینه انتخاب کنید"
                    : "افزودن به سبد خرید"}
                </button>
              </div>
            </>
          )}

          {(product.sku || product.brand) && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
              {product.sku && <span>شناسه محصول: {product.sku}</span>}
              <span>دسته: {categoryLabels[product.category]}</span>
              {product.brand && <span>برند: {product.brand}</span>}
            </div>
          )}
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="w-full max-w-sm mx-auto object-contain"
        />
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "description"
                ? "border-b-2 border-green-800 text-green-800"
                : "text-gray-500"
            }`}
          >
            توضیحات
          </button>
          {hasSpecs && (
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-sm font-medium ${
                activeTab === "specs"
                  ? "border-b-2 border-green-800 text-green-800"
                  : "text-gray-500"
              }`}
            >
              توضیحات تکمیلی
            </button>
          )}
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "reviews"
                ? "border-b-2 border-green-800 text-green-800"
                : "text-gray-500"
            }`}
          >
            نظرات (۰)
          </button>
        </div>

        {activeTab === "description" && (
          <div className="text-gray-700 leading-loose whitespace-pre-line max-w-3xl">
            {product.fullDescription || product.shortDescription || "توضیحاتی ثبت نشده است."}
          </div>
        )}

        {activeTab === "specs" && product.specs && (
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden max-w-2xl">
            <tbody>
              {product.specs.weightLabel && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">وزن</td>
                  <td className="px-4 py-3">{product.specs.weightLabel}</td>
                </tr>
              )}
              {product.specs.dimensions && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">ابعاد</td>
                  <td className="px-4 py-3">{product.specs.dimensions}</td>
                </tr>
              )}
              {product.specs.riceType && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">دسته برنج</td>
                  <td className="px-4 py-3">{product.specs.riceType}</td>
                </tr>
              )}
              {product.specs.grade && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">رده محصول</td>
                  <td className="px-4 py-3">
                    {product.specs.grade}{" "}
                    {product.specs.gradeStars && (
                      <span className="text-yellow-500">
                        {"★".repeat(product.specs.gradeStars)}
                      </span>
                    )}
                  </td>
                </tr>
              )}
              {product.specs.cultivationStatus && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">وضعیت کشت</td>
                  <td className="px-4 py-3">{product.specs.cultivationStatus}</td>
                </tr>
              )}
              {product.specs.originLocation && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">محل کشت</td>
                  <td className="px-4 py-3">{product.specs.originLocation}</td>
                </tr>
              )}
              {product.specs.harvestTime && (
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">زمان برداشت</td>
                  <td className="px-4 py-3">{product.specs.harvestTime}</td>
                </tr>
              )}
              {product.specs.grainSizing && (
                <tr>
                  <td className="px-4 py-3 text-gray-500">سایزبندی دانه</td>
                  <td className="px-4 py-3">{product.specs.grainSizing}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "reviews" && (
          <p className="text-gray-500 text-sm">هنوز دیدگاهی ثبت نشده است.</p>
        )}
      </div>

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

      {!product.soldOut && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 z-30">
          <img src={product.image} alt={product.name} className="w-10 h-12 object-contain" />
          <div className="flex-1 text-sm">
            <p className="font-medium truncate">{product.name}</p>
            <p className="text-green-800 text-xs">
              {isRange
                ? `${formatToman(minPrice)} – ${formatToman(maxPrice)} تومان`
                : `${formatToman(minPrice)} تومان`}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={hasMultipleVariants && !selectedVariant}
            className="bg-green-700 disabled:bg-gray-300 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap"
          >
            {hasMultipleVariants && !selectedVariant ? "انتخاب گزینه‌ها" : "افزودن"}
          </button>
        </div>
      )}
    </main>
  );
}