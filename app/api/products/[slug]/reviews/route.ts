// Path: /app/api/products/[slug]/reviews
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: after a successful review submission, notifies the store
// owner by email.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/session";
import { hasCustomerPurchased, formatDisplayName } from "../../../../lib/reviewsHelpers";
import { notifyOwnerNewReview } from "../../../../lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: reviews, error } = await supabase
    .from("product_reviews")
    .select("id, rating, comment, created_at, customer_id")
    .eq("product_slug", slug)
    .order("created_at", { ascending: false });

  if (error || !reviews) {
    return NextResponse.json({ error: "خطا در دریافت دیدگاه‌ها." }, { status: 500 });
  }

  const customerIds = reviews.map((r) => r.customer_id);
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, display_name_preference")
    .in("id", customerIds.length > 0 ? customerIds : [""]);

  const shaped = reviews.map((r) => {
    const customer = customers?.find((c) => c.id === r.customer_id);
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewerName: customer ? formatDisplayName(customer) : "کاربر گیاه‌بان",
    };
  });

  return NextResponse.json({ reviews: shaped });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const customerId = token ? await getCustomerIdFromSessionToken(token) : null;

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { slug } = await params;
  const { rating, comment, productName } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "امتیاز باید بین ۱ تا ۵ باشد." }, { status: 400 });
  }

  const purchased = await hasCustomerPurchased(customerId, slug, productName || "");

  if (!purchased) {
    return NextResponse.json(
      { error: "فقط خریداران این محصول می‌توانند دیدگاه ثبت کنند." },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("product_reviews").insert({
    product_slug: slug,
    customer_id: customerId,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "شما قبلاً برای این محصول دیدگاه ثبت کرده‌اید." },
        { status: 409 }
      );
    }
    console.error("Failed to insert review:", error);
    return NextResponse.json({ error: "ثبت دیدگاه با خطا مواجه شد." }, { status: 500 });
  }

  // Notify the owner right after a successful insert — a bad review is
  // just as important for you to see quickly as a good one.
  await notifyOwnerNewReview(productName || slug, rating);

  return NextResponse.json({ success: true });
}