// Path: /app/api/otp/verify
// File: route.ts
// Version: 1.0.0
//
// Checks the submitted code against the row stored in Supabase's
// otp_codes table (previously an in-memory Map — see send/route.ts
// comments for why that broke on restarts and on Vercel specifically).
//
// On success, this also creates or matches a customer row in Supabase
// by phone number — buying never requires a separate "login" step.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  if (!phone || !code) {
    return NextResponse.json({ error: "اطلاعات ناقص است." }, { status: 400 });
  }

  const { data: record, error: lookupError } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (lookupError) {
    console.error("Supabase otp_codes lookup error:", lookupError);
    return NextResponse.json({ error: "خطای داخلی سرور." }, { status: 500 });
  }

  if (!record) {
    return NextResponse.json(
      { error: "کدی برای این شماره ارسال نشده است." },
      { status: 400 }
    );
  }

  if (record.code !== code) {
    return NextResponse.json({ error: "کد وارد شده صحیح نیست." }, { status: 400 });
  }

  // One-time use — delete the row after successful verification, so the
  // same code can't be reused for a second order.
  const { error: deleteError } = await supabase
    .from("otp_codes")
    .delete()
    .eq("phone", phone);

  if (deleteError) {
    console.error("Supabase otp_codes delete error:", deleteError);
    // Not fatal to the customer's flow — log it but continue, since the
    // verification itself already succeeded.
  }

  // Check if this phone number already has a customer row.
  const { data: existingCustomer, error: customerLookupError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (customerLookupError) {
    console.error("Supabase customers lookup error:", customerLookupError);
    return NextResponse.json({ error: "خطا در بررسی حساب کاربری." }, { status: 500 });
  }

  if (!existingCustomer) {
    const localPhone = phone.replace("+98", "0");
    const { error: insertError } = await supabase.from("customers").insert({
      phone,
      placeholder_email: `${localPhone}@giahban-customer.local`,
    });

    if (insertError) {
      console.error("Supabase customers insert error:", insertError);
      return NextResponse.json({ error: "خطا در ایجاد حساب کاربری." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}