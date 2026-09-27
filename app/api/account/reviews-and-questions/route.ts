// Path: /app/api/account/reviews-and-questions
// File: route.ts
// Version: 1.0.0
//
// Powers the account page's دیدگاه‌ها و پرسش‌ها tab: returns the
// signed-in customer's own reviews, their own questions (with answers
// attached), and their own answers to other people's questions — the
// three filters you specified (نظرات من / پرسش‌های من / جواب‌های من).

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../../../lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const customerId = token ? await getCustomerIdFromSessionToken(token) : null;

  if (!customerId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { data: myReviews } = await supabase
    .from("product_reviews")
    .select("id, product_slug, rating, comment, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  const { data: myQuestions } = await supabase
    .from("product_questions")
    .select("id, product_slug, question_text, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  const { data: myAnswers } = await supabase
    .from("product_answers")
    .select("id, question_id, answer_text, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    myReviews: myReviews || [],
    myQuestions: myQuestions || [],
    myAnswers: myAnswers || [],
  });
}