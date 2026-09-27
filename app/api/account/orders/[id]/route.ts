// Path: /app/api/account/orders/[id]
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: after a successful cancellation, notifies the store owner by
// email. Also now selects order_number in the lookup query (needed for
// the email's subject line), not just status.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/session";
import { canCustomerCancel, OrderStatus } from "../../../../lib/orderStatus";
import { notifyOwnerCancellationRequested } from "../../../../lib/email";

async function getSignedInCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return getCustomerIdFromSessionToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customerId = await getSignedInCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customerId = await getSignedInCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json();

  if (action !== "cancel") {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  // Note: order_number is now selected here too (alongside status),
  // since the email notification below needs it for its subject line.
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("status, order_number")
    .eq("id", id)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (lookupError || !order) {
    return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
  }

  if (!canCustomerCancel(order.status as OrderStatus)) {
    return NextResponse.json(
      { error: "این سفارش دیگر قابل لغو نیست، زیرا ارسال شده است." },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "لغو سفارش با خطا مواجه شد." }, { status: 500 });
  }

  // ↓↓↓ THIS is the "successful cancellation update" spot — right after
  // the database update above succeeds, we notify the owner by email.
  await notifyOwnerCancellationRequested(order.order_number);

  return NextResponse.json({ success: true });
}