// Path: /app/shop/[slug]
// File: ProductReviewsAndQuestions.tsx
// Version: 1.0.0
//
// The submission + display UI for a product's reviews and Q&A,
// rendered inside the existing "reviews" tab on the product detail
// page. Handles three cases per action:
// - Signed out: shows a prompt to sign in first.
// - Signed in but hasn't purchased: review/answer forms are hidden
//   (or show why), but questions can still be asked by anyone.
// - Signed in and purchased: full access to review, ask, and answer.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StarRatingInput from "../../components/StarRatingInput";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewerName: string;
};

type Answer = {
  id: string;
  answerText: string;
  createdAt: string;
  answererName: string;
};

type Question = {
  id: string;
  questionText: string;
  createdAt: string;
  askerName: string;
  answers: Answer[];
};

export default function ProductReviewsAndQuestions({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Question form state
  const [questionText, setQuestionText] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Which question's answer box is open, and its draft text
  const [openAnswerFor, setOpenAnswerFor] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setIsSignedIn(data.signedIn));

    fetchReviews();
    fetchQuestions();
  }, [productSlug]);

  function fetchReviews() {
    fetch(`/api/products/${productSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []));
  }

  function fetchQuestions() {
    fetch(`/api/products/${productSlug}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []));
  }

  async function handleSubmitReview() {
    setReviewError(null);

    if (reviewRating < 1) {
      setReviewError("لطفاً یک امتیاز انتخاب کنید.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim() || null,
          productName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReviewError(data.error || "ثبت دیدگاه با خطا مواجه شد.");
        return;
      }

      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewComment("");
      fetchReviews();
    } catch {
      setReviewError("خطا در برقراری ارتباط.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleSubmitQuestion() {
    setQuestionError(null);

    if (!questionText.trim()) {
      setQuestionError("متن پرسش نمی‌تواند خالی باشد.");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: questionText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setQuestionError(data.error || "ثبت پرسش با خطا مواجه شد.");
        return;
      }

      setQuestionText("");
      fetchQuestions();
    } catch {
      setQuestionError("خطا در برقراری ارتباط.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  }

  async function handleSubmitAnswer(questionId: string) {
    setAnswerError(null);

    if (!answerDraft.trim()) {
      setAnswerError("متن پاسخ نمی‌تواند خالی باشد.");
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const res = await fetch(
        `/api/products/${productSlug}/questions/${questionId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: answerDraft.trim(), productName }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setAnswerError(data.error || "ثبت پاسخ با خطا مواجه شد.");
        return;
      }

      setAnswerDraft("");
      setOpenAnswerFor(null);
      fetchQuestions();
    } catch {
      setAnswerError("خطا در برقراری ارتباط.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-10">
      {/* Reviews section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold">دیدگاه‌ها</h3>
          {averageRating && (
            <span className="text-sm text-yellow-600">
              ★ {averageRating} از {reviews.length} دیدگاه
            </span>
          )}
        </div>

        {isSignedIn === false && (
          <p className="text-sm text-gray-500 mb-4">
            برای ثبت دیدگاه، ابتدا{" "}
            <Link href="/login" className="text-green-800 underline">
              وارد حساب کاربری
            </Link>{" "}
            شوید.
          </p>
        )}

        {isSignedIn === true && !reviewSubmitted && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">امتیاز شما به این محصول:</p>
            <StarRatingInput value={reviewRating} onChange={setReviewRating} />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              placeholder="نظر شما درباره این محصول (اختیاری)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3 resize-none"
            />
            {reviewError && <p className="text-red-600 text-sm mt-2">{reviewError}</p>}
            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white text-sm font-medium px-5 py-2 rounded-lg mt-3"
            >
              {isSubmittingReview ? "در حال ثبت..." : "ثبت دیدگاه"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              فقط خریداران این محصول می‌توانند دیدگاه ثبت کنند.
            </p>
          </div>
        )}

        {reviewSubmitted && (
          <p className="text-green-700 text-sm mb-4">دیدگاه شما با موفقیت ثبت شد.</p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">هنوز دیدگاهی برای این محصول ثبت نشده است.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">{r.reviewerName}</span>
                  <span className="text-yellow-500 text-sm">{"★".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions section */}
      <div>
        <h3 className="font-semibold mb-4">پرسش و پاسخ</h3>

        {isSignedIn === false && (
          <p className="text-sm text-gray-500 mb-4">
            برای پرسیدن سوال، ابتدا{" "}
            <Link href="/login" className="text-green-800 underline">
              وارد حساب کاربری
            </Link>{" "}
            شوید.
          </p>
        )}

        {isSignedIn === true && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={2}
              placeholder="سوال خود را درباره این محصول بنویسید"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
            {questionError && <p className="text-red-600 text-sm mt-2">{questionError}</p>}
            <button
              onClick={handleSubmitQuestion}
              disabled={isSubmittingQuestion}
              className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white text-sm font-medium px-5 py-2 rounded-lg mt-3"
            >
              {isSubmittingQuestion ? "در حال ثبت..." : "ثبت پرسش"}
            </button>
          </div>
        )}

        {questions.length === 0 ? (
          <p className="text-sm text-gray-400">هنوز پرسشی برای این محصول ثبت نشده است.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border-b border-gray-100 pb-4">
                <p className="text-sm font-medium text-gray-800">
                  {q.askerName}: <span className="font-normal">{q.questionText}</span>
                </p>

                {q.answers.map((a) => (
                  <p key={a.id} className="text-sm text-gray-600 mt-2 pr-4">
                    ↳ {a.answererName}: {a.answerText}
                  </p>
                ))}

                {isSignedIn === true && (
                  <>
                    {openAnswerFor === q.id ? (
                      <div className="mt-3 pr-4">
                        <textarea
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          rows={2}
                          placeholder="پاسخ شما"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                        />
                        {answerError && (
                          <p className="text-red-600 text-sm mt-1">{answerError}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitAnswer(q.id)}
                            disabled={isSubmittingAnswer}
                            className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white text-xs font-medium px-4 py-1.5 rounded-lg"
                          >
                            {isSubmittingAnswer ? "در حال ثبت..." : "ثبت پاسخ"}
                          </button>
                          <button
                            onClick={() => {
                              setOpenAnswerFor(null);
                              setAnswerError(null);
                            }}
                            className="text-xs text-gray-500 underline"
                          >
                            انصراف
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          فقط خریداران این محصول می‌توانند پاسخ ثبت کنند.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setOpenAnswerFor(q.id);
                          setAnswerError(null);
                        }}
                        className="text-xs text-green-800 underline mt-2"
                      >
                        پاسخ دادن
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}