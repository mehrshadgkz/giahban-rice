// Path: /app/lib
// File: session.ts
// Version: 1.0.0
//
// Helper functions for creating, reading, and destroying login sessions.
// A session is just a random token stored both in Supabase's `sessions`
// table and in the customer's browser cookie — as long as the two match
// and the session hasn't expired, the customer is considered signed in.
//
// Sessions last 7 days from creation, matching the spec. Every time a
// signed-in customer visits, we don't automatically extend the 7 days —
// it's a flat window from when they last verified their OTP.

import { randomBytes } from "crypto";
import { supabase } from "./supabase";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE_NAME = "giahban_session";

// Generates a long, random, unguessable token — this is what goes in
// the browser's cookie and in the sessions table, never the phone
// number itself.
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// Creates a new session row for a customer (called right after a
// successful OTP verification) and returns the token to be set as a cookie.
export async function createSession(customerId: string): Promise<string | null> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const { error } = await supabase.from("sessions").insert({
    token,
    customer_id: customerId,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("Failed to create session:", error);
    return null;
  }

  return token;
}

// Looks up which customer (if any) a given session token belongs to,
// checking it hasn't expired. Returns null if the token is invalid,
// expired, or doesn't exist — treated the same as "not signed in."
export async function getCustomerIdFromSessionToken(
  token: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("customer_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return null; // expired — treat as signed out
  }

  return data.customer_id;
}

// Deletes a session row — used for "خروج از حساب" (sign out) and as
// part of account deletion.
export async function destroySession(token: string): Promise<void> {
  await supabase.from("sessions").delete().eq("token", token);
}