// Path: /app/api/products/[slug]/questions/[questionId]/answers
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: after a successful answer submission, looks up the original
// asker's email (if they have one) and notifies them their question
// was answered.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../../../../lib/session";
import { hasCustomerPurchased } from "../../../../../../lib/reviewsHelpers";
import { notifyCustomerAnswered } from "../../../../../../lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; questionId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const customerId = token ? await getCustomerIdFromSessionToken(token) : null;

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { slug, questionId } = await params;
  const { answerText, productName } = await request.json();

  if (!answerText || !answerText.trim()) {
    return NextResponse.json({ error: "متن پاسخ نمی‌تواند خالی باشد." }, { status: 400 });
  }

  const purchased = await hasCustomerPurchased(customerId, slug, productName || "");

  if (!purchased) {
    return NextResponse.json(
      { error: "فقط خریداران این محصول می‌توانند پاسخ ثبت کنند." },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("product_answers").insert({
    question_id: questionId,
    customer_id: customerId,
    answer_text: answerText.trim(),
  });

  if (error) {
    console.error("Failed to insert answer:", error);
    return NextResponse.json({ error: "ثبت پاسخ با خطا مواجه شد." }, { status: 500 });
  }

  // Look up the original question + its asker, so we can email them
  // that their question was just answered — only if they have an email.
  const { data: question } = await supabase
    .from("product_questions")
    .select("question_text, customer_id")
    .eq("id", questionId)
    .maybeSingle();

  if (question) {
    const { data: asker } = await supabase
      .from("customers")
      .select("email")
      .eq("id", question.customer_id)
      .maybeSingle();

    if (asker?.email) {
      await notifyCustomerAnswered(
        asker.email,
        productName || slug,
        question.question_text,
        answerText.trim()
      );
    }
  }

  return NextResponse.json({ success: true });
}