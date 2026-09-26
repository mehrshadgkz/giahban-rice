// Path: /app/api/account/addresses
// File: route.ts
// Version: 1.0.0
//
// GET: returns the signed-in customer's saved addresses — always 3
// slots, with unfilled slots returned as fully empty objects (never a
// placeholder), so the frontend can show "آدرس دوم (خالی)" honestly.
// PUT: saves one address slot (1, 2, or 3).

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";

async function getSignedInCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return getCustomerIdFromSessionToken(token);
}

const emptySlot = (slot: number) => ({
  slot,
  first_name: "",
  last_name: "",
  country: "ایران",
  province: "",
  city: "",
  street_address: "",
  postal_code: "",
  unit_number: "",
  floor: "",
});

export async function GET() {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId);

  if (error) {
    return NextResponse.json({ error: "خطا در دریافت آدرس‌ها." }, { status: 500 });
  }

  // Build all 3 slots — real saved data where it exists, genuinely
  // empty objects (not placeholder text) where it doesn't.
  const slots = [1, 2, 3].map((slot) => {
    const existing = data?.find((a) => a.slot === slot);
    return existing || emptySlot(slot);
  });

  return NextResponse.json({ addresses: slots });
}

export async function PUT(request: NextRequest) {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const body = await request.json();
  const { slot, first_name, last_name, country, province, city, street_address, postal_code, unit_number, floor } = body;

  if (![1, 2, 3].includes(slot)) {
    return NextResponse.json({ error: "شماره آدرس نامعتبر است." }, { status: 400 });
  }

  const { error } = await supabase.from("customer_addresses").upsert(
    {
      customer_id: customerId,
      slot,
      first_name,
      last_name,
      country,
      province,
      city,
      street_address,
      postal_code,
      unit_number,
      floor,
    },
    { onConflict: "customer_id,slot" }
  );

  if (error) {
    console.error("Failed to save address:", error);
    return NextResponse.json({ error: "ذخیره آدرس با خطا مواجه شد." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}