// Path: /app/lib
// File: shipping.ts
// Version: 1.0.0
//
// Fetches shipping companies and their weight-based rate brackets from
// Supabase, and calculates the real shipping cost to show a customer
// for a given order weight and destination.

import { supabase } from "./supabase";
import { getFlatShippingAmountPerKg } from "./pricing";

export type ShippingOption = {
  companyId: string;
  name: string;
  slug: string;
  cost: number;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  minTotalPriceApplied: boolean; // true if the company's minimum charge kicked in
};

// Finds the correct rate bracket for a given weight — e.g. تیپاکس at
// 15kg falls into the "10 to 20 kg" bracket. max_weight_kg of null
// means "this bracket applies from min_weight_kg upward with no ceiling".
function findBracketRate(
  brackets: { min_weight_kg: number; max_weight_kg: number | null; price_per_kg: number }[],
  weightKg: number
): number | null {
  const match = brackets.find(
    (b) => weightKg > b.min_weight_kg && (b.max_weight_kg === null || weightKg <= b.max_weight_kg)
  );
  return match ? match.price_per_kg : null;
}

// Returns every shipping option available for the given weight and
// destination, with the flat 10,000/kg already subtracted from each
// company's real rate — since that flat portion is shown as part of
// the product price instead (see pricing.ts).
export async function getAvailableShippingOptions(
  weightKg: number,
  province: string,
  city: string
): Promise<ShippingOption[]> {
  const flatAmount = await getFlatShippingAmountPerKg();

  const { data: companies, error: companiesError } = await supabase
    .from("shipping_companies")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (companiesError || !companies) {
    console.error("Failed to fetch shipping_companies:", companiesError);
    return [];
  }

  const { data: brackets, error: bracketsError } = await supabase
    .from("shipping_rate_brackets")
    .select("*");

  if (bracketsError || !brackets) {
    console.error("Failed to fetch shipping_rate_brackets:", bracketsError);
    return [];
  }

  const options: ShippingOption[] = [];

  for (const company of companies) {
    // Skip a company entirely if it's restricted to a specific
    // province/city and the customer's destination doesn't match —
    // this is how باربری به تهران only shows up for Tehran orders.
    if (company.restricted_province && company.restricted_province !== province) continue;
    if (company.restricted_city && company.restricted_city !== city) continue;

    const companyBrackets = brackets.filter((b) => b.company_id === company.id);
    const realRatePerKg = findBracketRate(companyBrackets, weightKg);

    if (realRatePerKg === null) continue; // no matching bracket for this weight

    const shownRatePerKg = Math.max(0, realRatePerKg - flatAmount);
    let cost = shownRatePerKg * weightKg;

    let minTotalPriceApplied = false;
    if (company.min_total_price && cost < company.min_total_price) {
      cost = company.min_total_price;
      minTotalPriceApplied = true;
    }

    options.push({
      companyId: company.id,
      name: company.name,
      slug: company.slug,
      cost,
      deliveryDaysMin: company.delivery_days_min,
      deliveryDaysMax: company.delivery_days_max,
      minTotalPriceApplied,
    });
  }

  return options;
}