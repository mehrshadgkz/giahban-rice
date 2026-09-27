// Path: /app/api/account/orders
// File: route.ts
// Version: 1.0.0
//
// GET: returns all of the signed-in customer's orders, grouped by
// status for the four tabs. Each order includes just enough info for
// the list view — full item/address detail is fetched separately per
// order on the detail page, not bundled here, to keep this fast.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";
import { getOrderGroup } from "../../../lib/orderStatus";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const customerId = token ? await getCustomerIdFromSessionToken(token) : null;

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total_price, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "خطا در دریافت سفارش‌ها." }, { status: 500 });
  }

  const orders = (data || []).map((o) => ({
    ...o,
    group: getOrderGroup(o.status),
  }));

  return NextResponse.json({ orders });
}