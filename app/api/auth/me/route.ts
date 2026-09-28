// Path: /app/api/auth/me
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: now also returns the customer's id, first/last name, and
// email, so checkout can skip the phone/OTP step for signed-in
// customers and pre-fill their details. Uses select("*") so a missing
// column can never break the "am I signed in?" check.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ signedIn: false });
  }

  const customerId = await getCustomerIdFromSessionToken(token);

  if (!customerId) {
    return NextResponse.json({ signedIn: false });
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !customer) {
    return NextResponse.json({ signedIn: false });
  }

  return NextResponse.json({
    signedIn: true,
    id: customer.id,
    phone: customer.phone,
    firstName: customer.first_name ?? null,
    lastName: customer.last_name ?? null,
    email: customer.email ?? null,
  });
}