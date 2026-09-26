// Path: /app/lib
// File: getProducts.ts
// Version: 1.0.0
//
// Fetches products and their variants from Supabase, replacing the old
// hardcoded data/products.ts file. Shapes the data into the same
// Product/ProductVariant structure your components already expect, so
// ProductCard, the shop page, and the product detail page don't need
// to change how they read this data — only where it comes from changes.

import { supabase } from "./supabase";
import { calculateDisplayedProductPrice, getFlatShippingAmountPerKg } from "./pricing";

export type ProductVariant = {
  label: string;
  price: number; // final displayed price, flat shipping amount already included
  stockCount: number;
  brokenRicePercent?: number;
  suitability?: string;
};

export type ProductSpecs = {
  weightLabel?: string;
  dimensions?: string;
  riceType?: string;
  grade?: string;
  gradeStars?: number;
  cultivationStatus?: string;
  originLocation?: string;
  harvestTime?: string;
  grainSizing?: string;
};

export type Product = {
  slug: string;
  name: string;
  image: string;
  weightKg: number;
  category: "rice" | "rice-products" | "northern-condiments";
  sku?: string;
  brand?: string;
  shortDescription?: string;
  fullDescription?: string;
  specs?: ProductSpecs;
  variants: ProductVariant[];
  soldOut: boolean; // true only when EVERY variant has 0 stock
};

// Fetches every product with its variants, already priced and shaped
// for use in components. Called from the shop page and homepage.
export async function getAllProducts(): Promise<Product[]> {
  const flatAmount = await getFlatShippingAmountPerKg();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at");

  if (productsError || !products) {
    console.error("Failed to fetch products:", productsError);
    return [];
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .order("sort_order");

  if (variantsError || !variants) {
    console.error("Failed to fetch product_variants:", variantsError);
    return [];
  }

  return products.map((p) => {
    const productVariants = variants
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        label: v.label,
        price: calculateDisplayedProductPrice(v.price, p.weight_kg, flatAmount),
        stockCount: v.stock_count,
        brokenRicePercent: v.broken_rice_percent ?? undefined,
        suitability: v.suitability ?? undefined,
      }));

    return {
      slug: p.slug,
      name: p.name,
      image: p.image,
      weightKg: p.weight_kg,
      category: p.category,
      sku: p.sku ?? undefined,
      brand: p.brand ?? undefined,
      shortDescription: p.short_description ?? undefined,
      fullDescription: p.full_description ?? undefined,
      specs: p.specs ?? undefined,
      variants: productVariants,
      soldOut: productVariants.every((v) => v.stockCount <= 0),
    };
  });
}

// Fetches one product by slug — used on the product detail page.
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

// Featured products for the homepage — in-stock rice products only,
// same rule as before.
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => !p.soldOut && p.category === "rice");
}