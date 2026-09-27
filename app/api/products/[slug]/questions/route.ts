// Path: /app/api/products/[slug]/questions
// File: route.ts
// Version: 1.1.0
//
// v1.1.0: after a successful question submission, notifies the store
// owner by email.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/session";
import { formatDisplayName } from "../../../../lib/reviewsHelpers";
import { notifyOwnerNewQuestion } from "../../../../lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: questions, error: qError } = await supabase
    .from("product_questions")
    .select("id, question_text, created_at, customer_id")
    .eq("product_slug", slug)
    .order("created_at", { ascending: false });

  if (qError || !questions) {
    return NextResponse.json({ error: "خطا در دریافت پرسش‌ها." }, { status: 500 });
  }

  const questionIds = questions.map((q) => q.id);

  const { data: answers } = await supabase
    .from("product_answers")
    .select("id, question_id, answer_text, created_at, customer_id")
    .in("question_id", questionIds.length > 0 ? questionIds : [""])
    .order("created_at", { ascending: true });

  const allCustomerIds = [
    ...questions.map((q) => q.customer_id),
    ...(answers || []).map((a) => a.customer_id),
  ];
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, display_name_preference")
    .in("id", allCustomerIds.length > 0 ? allCustomerIds : [""]);

  function nameFor(customerId: string) {
    const customer = customers?.find((c) => c.id === customerId);
    return customer ? formatDisplayName(customer) : "کاربر گیاه‌بان";
  }

  const shaped = questions.map((q) => ({
    id: q.id,
    questionText: q.question_text,
    createdAt: q.created_at,
    askerName: nameFor(q.customer_id),
    answers: (answers || [])
      .filter((a) => a.question_id === q.id)
      .map((a) => ({
        id: a.id,
        answerText: a.answer_text,
        createdAt: a.created_at,
        answererName: nameFor(a.customer_id),
      })),
  }));

  return NextResponse.json({ questions: shaped });
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
  const { questionText } = await request.json();

  if (!questionText || !questionText.trim()) {
    return NextResponse.json({ error: "متن پرسش نمی‌تواند خالی باشد." }, { status: 400 });
  }

  const { error } = await supabase.from("product_questions").insert({
    product_slug: slug,
    customer_id: customerId,
    question_text: questionText.trim(),
  });

  if (error) {
    console.error("Failed to insert question:", error);
    return NextResponse.json({ error: "ثبت پرسش با خطا مواجه شد." }, { status: 500 });
  }

  // Notify the owner right after a successful insert, so a question
  // doesn't sit unanswered just because nobody happened to check the site.
  await notifyOwnerNewQuestion(slug, questionText.trim());

  return NextResponse.json({ success: true });
}