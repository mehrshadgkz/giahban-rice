// Path: /app/components
// File: PhoneOtpFlow.tsx
// Version: 1.0.0
//
// Shared phone number + OTP verification UI, used by both the checkout
// page and the standalone /login page. This is the same flow either
// way — checkout's OTP step also counts as "signing in" for future
// visits, per the account system spec, so there's no reason to build
// two separate versions of this.
//
// The parent decides what happens after successful verification via
// onVerified — checkout moves to the address form, /login just
// redirects to /account.

"use client";

import { useState, useEffect } from "react";
import PhoneInput from "./PhoneInput";
import OtpInput from "./OtpInput";

type PhoneOtpFlowProps = {
  onVerified: () => void;
  title?: string;
};

function isValidIranianMobile(digits: string) {
  return /^9\d{9}$/.test(digits);
}

export default function PhoneOtpFlow({ onVerified, title }: PhoneOtpFlowProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneDigits, setPhoneDigits] = useState("9");
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSendOtp() {
    setError(null);

    if (!isValidIranianMobile(phoneDigits)) {
      setError("شماره موبایل را کامل وارد کنید.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+98${phoneDigits}` }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ارسال کد با خطا مواجه شد. دوباره تلاش کنید.");
        return;
      }

      setStep("otp");
      setCooldown(120);
    } catch {
      setError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);

    if (otpCode.length < 6) {
      setError("کد ۶ رقمی را کامل وارد کنید.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+98${phoneDigits}`, code: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "کد وارد شده صحیح نیست.");
        return;
      }

      onVerified();
    } catch {
      setError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div>
      {step === "phone" && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-center">
            {title || "شماره موبایل"}
          </h2>
          <p className="text-sm text-gray-500 mb-5 text-center">
            کد تایید پیامکی برای این شماره ارسال می‌شود.
          </p>
          <PhoneInput
            value={phoneDigits.slice(1)}
            onChange={(nineDigits) => setPhoneDigits("9" + nineDigits)}
          />
          {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
          <button
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium py-3 rounded-lg mt-5"
          >
            {isSending ? "در حال ارسال..." : "ارسال کد تایید"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-center">کد تایید</h2>
          <p className="text-sm text-gray-500 mb-5 text-center">
            کد ارسال شده به +98{phoneDigits} را وارد کنید.
          </p>
          <OtpInput value={otpCode} onChange={setOtpCode} />
          {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
          <button
            onClick={handleVerifyOtp}
            disabled={isVerifying}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium py-3 rounded-lg mt-5 mb-3"
          >
            {isVerifying ? "در حال بررسی..." : "تایید کد"}
          </button>
          <div className="text-center text-sm">
            {cooldown > 0 ? (
              <span className="text-gray-400">
                ارسال مجدد کد تا {cooldown} ثانیه دیگر
              </span>
            ) : (
              <button onClick={handleSendOtp} className="text-green-800 underline">
                ارسال مجدد کد
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}