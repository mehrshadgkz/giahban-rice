// Path: /app/account
// File: ReviewsTab.tsx
// Version: 1.0.0
//
// دیدگاه‌ها و پرسش‌ها tab: three filters (نظرات من / پرسش‌های من /
// جواب‌های من), showing the customer's own contributed content across
// every product. Star display for reviews as specified.

"use client";


import { useState, useEffect } from "react";
import Link from "next/link";

type MyReview = {
  id: string;
  product_slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type MyQuestion = {
  id: string;
  product_slug: string;
  question_text: string;
  created_at: string;
};

type MyAnswer = {
  id: string;
  question_id: string;
  answer_text: string;
  created_at: string;
};

type Filter = "reviews" | "questions" | "answers";

const filters: { id: Filter; label: string }[] = [
  { id: "reviews", label: "نظرات من" },
  { id: "questions", label: "پرسش‌های من" },
  { id: "answers", label: "جواب‌های من" },
];

export default function ReviewsTab() {
  const [activeFilter, setActiveFilter] = useState<Filter>("reviews");
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [myQuestions, setMyQuestions] = useState<MyQuestion[]>([]);
  const [myAnswers, setMyAnswers] = useState<MyAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/reviews-and-questions")
      .then((res) => res.json())
      .then((data) => {
        setMyReviews(data.myReviews || []);
        setMyQuestions(data.myQuestions || []);
        setMyAnswers(data.myAnswers || []);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">دیدگاه‌ها و پرسش‌ها</h2>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeFilter === f.id
                ? "border-green-800 text-green-800"
                : "border-transparent text-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
      ) : (
        <>
          {activeFilter === "reviews" &&
            (myReviews.length === 0 ? (
              <p className="text-gray-500 text-sm">هنوز دیدگاهی ثبت نکرده‌اید.</p>
            ) : (
              <div className="space-y-3">
                {myReviews.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                    <Link
                      href={`/shop/${r.product_slug}`}
                      className="text-sm font-medium text-green-800 hover:underline"
                    >
                      {r.product_slug}
                    </Link>
                    <p className="text-yellow-500 text-sm mt-1">{"★".repeat(r.rating)}</p>
                    {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ))}

          {activeFilter === "questions" &&
            (myQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm">هنوز پرسشی ثبت نکرده‌اید.</p>
            ) : (
              <div className="space-y-3">
                {myQuestions.map((q) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                    <Link
                      href={`/shop/${q.product_slug}`}
                      className="text-sm font-medium text-green-800 hover:underline"
                    >
                      {q.product_slug}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{q.question_text}</p>
                  </div>
                ))}
              </div>
            ))}

          {activeFilter === "answers" &&
            (myAnswers.length === 0 ? (
              <p className="text-gray-500 text-sm">هنوز پاسخی ثبت نکرده‌اید.</p>
            ) : (
              <div className="space-y-3">
                {myAnswers.map((a) => (
                  <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{a.answer_text}</p>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}