// Path: /app/api/test-email
// File: route.ts
// Version: 1.0.0
//
// TEMPORARY diagnostic route — visit it directly in a browser to see
// Resend's exact raw response, bypassing the need for Vercel's paid
// Observability Plus or waiting on Resend's own log timing. Delete this
// file once email sending is confirmed working.

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set in this environment." });
  }

  if (!ownerEmail) {
    return NextResponse.json({ error: "OWNER_EMAIL is not set in this environment." });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: ownerEmail,
      subject: "تست ارسال ایمیل گیاه‌بان",
      html: "<p>این یک ایمیل تستی است.</p>",
    }),
  });

  const body = await res.text();

  return NextResponse.json({
    sentTo: ownerEmail,
    resendStatusCode: res.status,
    resendResponseBody: body,
  });
}