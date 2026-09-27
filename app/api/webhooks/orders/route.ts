// Path: /app/api/webhooks/orders
// File: route.ts
// Version: 1.0.0
//
// Called automatically by Supabase whenever a row in `orders` changes —
// including changes made directly in Supabase's Table Editor, since
// there's no admin panel yet. This is what makes "you manually change
// an order's status in Supabase" also trigger a customer email.
//
// Secured with a shared secret header, so this endpoint can't be
// triggered by a random outside request pretending to be Supabase.

import { NextRequest, NextResponse } from "next/server";
import { notifyOwnerNewOrder, notifyCustomerOrderConfirmed, notifyCustomerStatusChanged } from "../../../lib/email";

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get("x-webhook-secret");
  if (providedSecret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { type, record, old_record } = payload;

  if (type === "INSERT") {
    await notifyOwnerNewOrder(record.order_number, record.total_price);
    if (record.email) {
      await notifyCustomerOrderConfirmed(record.email, record.order_number);
    }
  }

  if (type === "UPDATE" && old_record?.status !== record.status) {
    if (record.email) {
      await notifyCustomerStatusChanged(record.email, record.order_number, record.status);
    }
  }

  return NextResponse.json({ received: true });
}