// Path: /app/api/auth/me
// File: route.ts
// Version: 1.0.0
//
// Checks whether the current visitor has a valid session cookie, and if
// so, returns their basic info (phone number, display name preference).
// Called by the Header on every page load to decide whether to show
// the signed-in or signed-out account icon state.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";

export async function GET(request: NextRequest) {
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
    .select("phone, name")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !customer) {
    return NextResponse.json({ signedIn: false });
  }

  return NextResponse.json({
    signedIn: true,
    phone: customer.phone,
    name: customer.name,
  });
}