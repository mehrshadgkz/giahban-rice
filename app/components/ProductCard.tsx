// Path: /app/components
// File: ProductCard.tsx
// Version: 1.1.0
//
// v1.1.0: variants now carry a stockCount instead of being either fully
// available or fully removed. A product only shows the overall
// "تمام شده" (sold out) badge when every variant is out of stock —
// otherwise, individual variant buttons that are out of stock are shown
// disabled with their own small "ناموجود" label, so a customer can
// still see and pick a variant that IS in stock.

"use client";

import { useState } from "react";
import Link from "next/link";

type Variant = {
  label: string;
  price: number;
  stockCount: number;
};

type ProductCardProps = {
  slug: string;
  name: string;
  image: string;
  soldOut: boolean;
  weightKg: number;
  variants: Variant[];
};

function formatToman(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function ProductCard({
  slug,
  name,
  image,
  soldOut,
  weightKg,
  variants,
}: ProductCardProps) {
  // Default selection: the first variant that's actually in stock, if any.
  const firstInStockIndex = variants.findIndex((v) => v.stockCount > 0);
  const [selectedIndex, setSelectedIndex] = useState(
    firstInStockIndex >= 0 ? firstInStockIndex : 0
  );

  const hasToggle = variants.length > 1;
  const selectedVariant = variants[selectedIndex];
  const pricePerKg = Math.round(selectedVariant.price / weightKg);

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition">
      <Link href={`/shop/${slug}`} className="w-full flex flex-col items-center">
        <img src={image} alt={name} className="w-32 h-40 object-contain mb-3" />
        <h3 className="text-sm font-medium text-gray-800 mb-1 hover:text-green-800 transition">
          {name}
        </h3>
      </Link>

      {soldOut ? (
        <span className="text-xs text-gray-400 border border-gray-300 rounded px-3 py-1 mt-2">
          تمام شده
        </span>
      ) : (
        <>
          <p className="text-green-800 font-semibold text-sm mb-1">
            {formatToman(selectedVariant.price)} تومان
          </p>
          <p className="text-xs text-gray-500 mb-3">
            قیمت هر کیلوگرم: {formatToman(pricePerKg)} تومان
          </p>

          {hasToggle && (
            <div className="flex flex-wrap justify-center gap-2">
              {variants.map((variant, index) => {
                const isOutOfStock = variant.stockCount <= 0;
                return (
                  <button
                    key={variant.label}
                    onClick={() => !isOutOfStock && setSelectedIndex(index)}
                    disabled={isOutOfStock}
                    className={`text-xs px-3 py-1.5 rounded-md border transition ${
                      isOutOfStock
                        ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                        : selectedIndex === index
                        ? "bg-green-800 text-white border-green-800"
                        : "border-gray-300 text-gray-600 hover:border-green-800"
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}