// Path: /app/api/account/settings
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: first name and last name are now separate fields. The old
// combined "name" column is still kept up to date for compatibility.
// Phone is never accepted here, since it's the account's permanent
// identity tied to OTP verification.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";

export const dynamic = "force-dynamic";

async function getSignedInCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return getCustomerIdFromSessionToken(token);
}

export async function GET() {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to load account settings:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات حساب." }, { status: 500 });
  }

  return NextResponse.json({
    phone: data.phone,
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    email: data.email ?? "",
    iban: data.iban ?? "",
    display_name_preference: data.display_name_preference ?? "first_name",
  });
}

// Iranian IBAN shape: "IR" followed by exactly 24 digits.
function isValidIban(iban: string) {
  return /^IR\d{24}$/.test(iban);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function PATCH(request: NextRequest) {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { first_name, last_name, email, iban, display_name_preference } = await request.json();

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "ایمیل واردشده معتبر نیست." }, { status: 400 });
  }

  if (iban && !isValidIban(iban)) {
    return NextResponse.json(
      { error: "شماره شبا معتبر نیست. فرمت صحیح: IR به همراه ۲۴ رقم." },
      { status: 400 }
    );
  }

  const first = (first_name || "").trim();
  const last = (last_name || "").trim();

  const { error } = await supabase
    .from("customers")
    .update({
      first_name: first || null,
      last_name: last || null,
      email: email || null,
      iban: iban || null,
      display_name_preference: display_name_preference || "first_name",
    })
    .eq("id", customerId);

  if (error) {
    console.error("Failed to update account settings:", error);
    return NextResponse.json({ error: "ذخیره اطلاعات با خطا مواجه شد." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}