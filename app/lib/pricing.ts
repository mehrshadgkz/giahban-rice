// Path: /app/lib
// File: pricing.ts
// Version: 1.0.0
//
// Core price-splitting math, shared by the shop page, product page, and
// checkout. A product's stored price (from Supabase) already reflects
// its real selling price per bag. On top of that, a flat amount per kg
// (currently 10,000 toman, editable in the shipping_settings table) is
// always added into the displayed product price — this amount is the
// same no matter which of the 5 shipping companies the customer later
// picks. What's shown separately as "shipping cost" is only the
// remainder: each company's real per-kg rate minus that flat amount.

import { supabase } from "./supabase";

// Fetches the current flat amount from Supabase rather than hardcoding
// it, so changing it in the table takes effect everywhere automatically.
export async function getFlatShippingAmountPerKg(): Promise<number> {
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("flat_amount_per_kg")
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Failed to fetch shipping_settings:", error);
    return 0; // fail safe: adds nothing rather than breaking the page
  }

  return data.flat_amount_per_kg;
}

// The price shown for a product bag, with the flat shipping-inclusion
// amount already folded in. This is what customers see as "the price"
// everywhere on the site — shop listing, product page, cart, checkout.
export function calculateDisplayedProductPrice(
  storedPrice: number,
  weightKg: number,
  flatAmountPerKg: number
): number {
  return storedPrice + flatAmountPerKg * weightKg;
}