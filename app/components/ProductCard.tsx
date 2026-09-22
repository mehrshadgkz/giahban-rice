// Path: /app/components
// File: ProductCard.tsx
// Version: 1.0.0
//
// Product card shown in grids (homepage featured products, shop listing,
// related products). Displays image, name, price, and a variant toggle
// when a product has more than one price option.

"use client";

import { useState } from "react";
import Link from "next/link";

type Variant = {
  label: string;
  price: number;
};

type ProductCardProps = {
  slug: string;
  name: string;
  image: string;
  soldOut?: boolean;
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
  soldOut = false,
  weightKg,
  variants,
}: ProductCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasToggle = variants.length > 1;
  const currentPrice = variants[selectedIndex].price;
  const pricePerKg = Math.round(currentPrice / weightKg);

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
            {formatToman(currentPrice)} تومان
          </p>
          <p className="text-xs text-gray-500 mb-3">
            قیمت هر کیلوگرم: {formatToman(pricePerKg)} تومان
          </p>

          {hasToggle && (
            <div className="flex flex-wrap justify-center gap-2">
              {variants.map((variant, index) => (
                <button
                  key={variant.label}
                  onClick={() => setSelectedIndex(index)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition ${
                    selectedIndex === index
                      ? "bg-green-800 text-white border-green-800"
                      : "border-gray-300 text-gray-600 hover:border-green-800"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}