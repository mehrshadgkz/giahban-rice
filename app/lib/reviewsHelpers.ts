// Path: /app/lib
// File: reviewsHelpers.ts
// Version: 1.0.0
//
// Two shared helpers used across reviews, questions, and answers:
// checking whether a customer actually bought a given product (needed
// to gate reviews and answers to buyers only), and formatting how a
// customer's name should display, based on their own preference.

import { supabase } from "./supabase";

// Checks Supabase's orders table for any order by this customer that
// contains this product. Matches by slug where available (new orders),
// falling back to matching by product name for older orders placed
// before slugs were recorded in order items.
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
  name: string | null;
  phone: string;
  display_name_preference: string;
};

// Formats how a customer's name should appear publicly on a review,
// question, or answer — respecting their own chosen preference.
export function formatDisplayName(customer: DisplayNameSource): string {
  const fullName = customer.name?.trim() || "";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  switch (customer.display_name_preference) {
    case "first_name":
      return firstName || "کاربر گیاه‌بان";
    case "last_name":
      return lastName || firstName || "کاربر گیاه‌بان";
    case "full_name":
      return fullName || "کاربر گیاه‌بان";
    case "masked_phone": {
      // e.g. +989123456789 -> 0912***6789
      const local = customer.phone.replace("+98", "0");
      return `${local.slice(0, 4)}***${local.slice(-4)}`;
    }
    default:
      return firstName || "کاربر گیاه‌بان";
  }
}