// Path: /app/api/account/settings
// File: route.ts
// Version: 1.0.0
//
// GET: returns the signed-in customer's editable settings (name, email,
// iban, display name preference) plus their read-only phone number.
// PATCH: updates the editable fields. Phone is never accepted here —
// it's the account's permanent identity, tied to OTP verification.

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

export async function GET() {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("customers")
    .select("phone, name, email, iban, display_name_preference")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "خطا در دریافت اطلاعات حساب." }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Iranian IBAN shape: "IR" followed by exactly 24 digits.
function isValidIban(iban: string) {
  return /^IR\d{24}$/.test(iban);
}

export async function PATCH(request: NextRequest) {
  const customerId = await getSignedInCustomerId();

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { name, email, iban, display_name_preference } = await request.json();

  if (iban && !isValidIban(iban)) {
    return NextResponse.json(
      { error: "شماره شبا معتبر نیست. فرمت صحیح: IR به همراه ۲۴ رقم." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: name || null,
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