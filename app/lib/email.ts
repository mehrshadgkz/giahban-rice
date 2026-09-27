// Path: /app/lib
// File: email.ts
// Version: 1.0.0
//
// Thin wrapper around Resend's API, plus one function per notification
// type. Every function is safe to call even if the recipient has no
// email (customer emails are optional) — callers should check for a
// non-empty email before calling, but this file itself won't throw if
// somehow called with an empty string; it just skips sending.

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const OWNER_EMAIL = process.env.OWNER_EMAIL!;
const FROM_EMAIL = "onboarding@resend.dev"; // Resend's test sender — swap once your own domain is verified

async function sendEmail(to: string, subject: string, html: string) {
  if (!to) return; // silently skip if there's no address to send to

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
  } catch (err) {
    // Email failures should never break the actual feature (an order,
    // a review, etc.) — just log it.
    console.error("Failed to send email:", err);
  }
}

// ---------- Owner notifications ----------

export async function notifyOwnerNewOrder(orderNumber: number, totalPrice: number) {
  await sendEmail(
    OWNER_EMAIL,
    `سفارش جدید #${orderNumber}`,
    `<p>یک سفارش جدید به مبلغ ${totalPrice.toLocaleString("en-US")} تومان ثبت شد.</p>`
  );
}

export async function notifyOwnerCancellationRequested(orderNumber: number) {
  await sendEmail(
    OWNER_EMAIL,
    `درخواست لغو سفارش #${orderNumber}`,
    `<p>مشتری درخواست لغو سفارش شماره ${orderNumber} را ثبت کرده است.</p>`
  );
}

export async function notifyOwnerNewQuestion(productName: string, questionText: string) {
  await sendEmail(
    OWNER_EMAIL,
    `پرسش جدید درباره ${productName}`,
    `<p>${questionText}</p>`
  );
}

export async function notifyOwnerNewReview(productName: string, rating: number) {
  await sendEmail(
    OWNER_EMAIL,
    `دیدگاه جدید برای ${productName}`,
    `<p>امتیاز ثبت شده: ${rating} از ۵</p>`
  );
}

// ---------- Customer notifications ----------

export async function notifyCustomerOrderConfirmed(email: string, orderNumber: number) {
  await sendEmail(
    email,
    `سفارش شما ثبت شد — #${orderNumber}`,
    `<p>سفارش شما با موفقیت ثبت شد. به زودی برای هماهنگی ارسال با شما تماس گرفته می‌شود.</p>`
  );
}

const statusMessages: Record<string, string> = {
  confirming: "سفارش شما در حال بررسی و تایید توسط فروشگاه است.",
  shipping: "سفارش شما ارسال شد و در راه است.",
  delivered: "سفارش شما با موفقیت تحویل داده شد.",
  cancelled: "سفارش شما لغو شد.",
  returned: "سفارش شما به‌عنوان مرجوعی ثبت شد.",
};

export async function notifyCustomerStatusChanged(
  email: string,
  orderNumber: number,
  newStatus: string
) {
  const message = statusMessages[newStatus];
  if (!message) return; // no email needed for intermediate/unmapped statuses

  await sendEmail(email, `به‌روزرسانی سفارش #${orderNumber}`, `<p>${message}</p>`);
}

export async function notifyCustomerAnswered(
  email: string,
  productName: string,
  questionText: string,
  answerText: string
) {
  await sendEmail(
    email,
    `پاسخ به پرسش شما درباره ${productName}`,
    `<p>پرسش شما: ${questionText}</p><p>پاسخ: ${answerText}</p>`
  );
}