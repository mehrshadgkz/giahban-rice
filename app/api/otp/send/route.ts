// app/api/otp/send/route.ts
//
// Server-side API route — the ONLY place the Melipayamak token is used.
//
// Pending codes are now stored in Supabase's otp_codes table instead of
// an in-memory JS Map. The old approach broke in two real situations:
// 1. Restarting the dev server (or any server crash/redeploy) wiped all
//    pending codes instantly, since they only ever lived in that
//    process's memory.
// 2. On Vercel specifically, a "send" request and the following "verify"
//    request can be handled by two completely separate server instances,
//    each with its own private memory — so the second instance would
//    never see what the first one stored.
// Supabase is a single shared table every instance reads/writes to, so
// both problems go away.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

const MELIPAYAMAK_TOKEN = "aae9a6c10acf49508e6dad736073ab7b";
const MELIPAYAMAK_OTP_URL = `https://console.melipayamak.com/api/send/otp/${MELIPAYAMAK_TOKEN}`;

const COOLDOWN_MS = 120 * 1000; // 120 seconds between sends
const MAX_SENDS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { phone } = await request.json();

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "شماره موبایل ارسال نشده است." }, { status: 400 });
  }

  const now = new Date();
  const nowMs = now.getTime();

  // Look up any existing pending-code row for this phone number.
  const { data: existing, error: lookupError } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (lookupError) {
    console.error("Supabase otp_codes lookup error:", lookupError);
    return NextResponse.json({ error: "خطای داخلی سرور." }, { status: 500 });
  }

  // Enforce 120s cooldown
  if (existing) {
    const sentAtMs = new Date(existing.sent_at).getTime();
    if (nowMs - sentAtMs < COOLDOWN_MS) {
      return NextResponse.json(
        { error: "لطفاً کمی صبر کنید و دوباره تلاش کنید." },
        { status: 429 }
      );
    }
  }

  // Enforce 3 sends per hour, per phone number
  let sendCount = 1;
  let hourWindowStart = now.toISOString();
  if (existing) {
    const windowStartMs = new Date(existing.hour_window_start).getTime();
    if (nowMs - windowStartMs < HOUR_MS) {
      if (existing.send_count >= MAX_SENDS_PER_HOUR) {
        return NextResponse.json(
          { error: "تعداد درخواست‌های شما بیش از حد مجاز است. بعداً تلاش کنید." },
          { status: 429 }
        );
      }
      sendCount = existing.send_count + 1;
      hourWindowStart = existing.hour_window_start;
    }
  }

  const localPhone = phone.replace("+98", "0");

  try {
    const res = await fetch(MELIPAYAMAK_OTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: localPhone }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Melipayamak error response:", data);
      return NextResponse.json(
        { error: "ارسال پیامک با خطا مواجه شد." },
        { status: 502 }
      );
    }

    // Melipayamak generates the code on their end and returns it here —
    // adjust this field name if their actual response uses something
    // other than "code" (check by temporarily logging `data` if needed).
    const generatedCode = data.code;

    if (!generatedCode) {
      console.error("Could not find OTP code in Melipayamak response:", data);
      return NextResponse.json(
        { error: "خطای غیرمنتظره در سرویس پیامک." },
        { status: 502 }
      );
    }

    // Upsert: creates a new row if this phone has never requested a code
    // before, or overwrites the existing row if it has — either way,
    // only the latest code for a given phone number should ever be valid.
    const { error: upsertError } = await supabase.from("otp_codes").upsert({
      phone,
      code: String(generatedCode),
      sent_at: now.toISOString(),
      send_count: sendCount,
      hour_window_start: hourWindowStart,
    });

    if (upsertError) {
      console.error("Supabase otp_codes upsert error:", upsertError);
      return NextResponse.json({ error: "خطای داخلی سرور." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Melipayamak request failed:", err);
    return NextResponse.json(
      { error: "خطا در ارتباط با سرویس پیامک." },
      { status: 500 }
    );
  }
}