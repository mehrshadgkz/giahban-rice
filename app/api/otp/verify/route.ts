// Path: /app/api/otp/verify
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: on successful verification, also creates a 7-day session and
// sets it as an httpOnly cookie — this is what makes checkout's OTP
// step double as "signing in" for future visits, per the account
// system spec. httpOnly means client-side JavaScript can never read
// this cookie (only the browser and our server can), which protects
// it from certain attacks even if malicious code somehow ran on the page.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { createSession, SESSION_COOKIE_NAME } from "../../../lib/session";

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

  const { error: deleteError } = await supabase
    .from("otp_codes")
    .delete()
    .eq("phone", phone);

  if (deleteError) {
    console.error("Supabase otp_codes delete error:", deleteError);
  }

  const { data: existingCustomer, error: customerLookupError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (customerLookupError) {
    console.error("Supabase customers lookup error:", customerLookupError);
    return NextResponse.json({ error: "خطا در بررسی حساب کاربری." }, { status: 500 });
  }

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const localPhone = phone.replace("+98", "0");
    const { data: newCustomer, error: insertError } = await supabase
      .from("customers")
      .insert({
        phone,
        placeholder_email: `${localPhone}@giahban-customer.local`,
      })
      .select("id")
      .single();

    if (insertError || !newCustomer) {
      console.error("Supabase customers insert error:", insertError);
      return NextResponse.json({ error: "خطا در ایجاد حساب کاربری." }, { status: 500 });
    }

    customerId = newCustomer.id;
  }

  const sessionToken = await createSession(customerId);

  if (!sessionToken) {
    // Verification itself succeeded, so we don't fail the whole request —
    // but log this, since something's wrong with session creation.
    console.error("OTP verified but session creation failed for customer:", customerId);
    return NextResponse.json({ success: true });
  }

  const response = NextResponse.json({ success: true });

  // httpOnly: JavaScript can't read this cookie at all (only sent
  // automatically by the browser on requests to this site).
  // secure: only sent over HTTPS — Vercel serves everything over HTTPS,
  // so this is safe to always set.
  // sameSite: "lax" is the standard safe default, prevents this cookie
  // being sent on cross-site requests.
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
    path: "/",
  });

  return response;
}