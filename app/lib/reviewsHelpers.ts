// Path: /app/lib
// File: reviewsHelpers.ts
// Version: 1.1.0
//
// v1.1.0: formatDisplayName now uses the separate first_name and
// last_name fields instead of splitting one combined name.
//
// Two shared helpers used across reviews, questions, and answers:
// checking whether a customer actually bought a given product (needed
// to gate reviews and answers to buyers only), and formatting how a
// customer's name should display, based on their own preference.

import { supabase } from "./supabase";

export async function hasCustomerPurchased(
  customerId: string,
  productSlug: string,
  productName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select("items")
    .eq("customer_id", customerId);

  if (error || !data) return false;

  return data.some((order) =>
    (order.items as any[]).some(
      (item) => item.slug === productSlug || item.name === productName
    )
  );
}

type DisplayNameSource = {
  first_name: string | null;
  last_name: string | null;
  phone: string;
  display_name_preference: string;
};

const FALLBACK_NAME = "کاربر گیاه‌بان";

export function formatDisplayName(customer: DisplayNameSource): string {
  const first = customer.first_name?.trim() || "";
  const last = customer.last_name?.trim() || "";
  const fullName = [first, last].filter(Boolean).join(" ");

  switch (customer.display_name_preference) {
    case "first_name":
      return first || FALLBACK_NAME;
    case "last_name":
      return last || first || FALLBACK_NAME;
    case "full_name":
      return fullName || FALLBACK_NAME;
    case "masked_phone": {
      // e.g. +989123456789 -> 0912***6789
      const local = customer.phone.replace("+98", "0");
      return `${local.slice(0, 4)}***${local.slice(-4)}`;
    }
    default:
      return first || FALLBACK_NAME;
  }
}