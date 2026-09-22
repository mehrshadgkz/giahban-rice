// Path: /app/checkout
// File: page.tsx
// Version: 1.0.0
//
// Checkout page. Flow:
// 1. Order summary from the cart.
// 2. Phone → OTP verification (guest checkout, no login required — buying
//    never requires a separate "login" step).
// 3. Full address form → confirm order, writing a row into `orders`
//    in Supabase with structured address fields.
//
// Validation behavior: on first visit, no field shows a red border or
// asterisk. Only after clicking "تایید نهایی سفارش" do empty required
// fields turn red AND show a "*" — filling a field clears both on the
// next render.
//
// "پلاک" (house/unit number) is required by default, but a "پلاک ندارم"
// checkbox lets a customer with a genuinely address-less home say so
// explicitly, storing "ندارد" instead of blocking the order.
//
// Shipping method selection and payment (PayPing) are still deferred —
// confirming an order just records it with status "pending" for now.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import PhoneInput from "../components/PhoneInput";
import OtpInput from "../components/OtpInput";
import { iranLocations, iranProvinces } from "../data/iranLocations";

type CheckoutStep = "phone" | "otp" | "details" | "confirmed";

function isValidIranianMobile(digits: string) {
  return /^9\d{9}$/.test(digits);
}

const countries = [
  { label: "ایران", value: "ایران", active: true },
  { label: "روسیه", value: "روسیه", active: false },
  { label: "امارات متحده عربی", value: "امارات متحده عربی", active: false },
  { label: "قطر", value: "قطر", active: false },
];

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("phone");
  const [phoneDigits, setPhoneDigits] = useState("9");
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("ایران");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [noUnitNumber, setNoUnitNumber] = useState(false);
  const [floor, setFloor] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [showValidation, setShowValidation] = useState(false);

  const availableCities = province ? iranLocations[province] || [] : [];

  function handleProvinceChange(newProvince: string) {
    setProvince(newProvince);
    setCity("");
    setCustomCity("");
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function fieldErrorClass(isEmpty: boolean) {
    return showValidation && isEmpty ? "border-red-500" : "border-gray-300";
  }

  function requiredMark(isEmpty: boolean) {
    return showValidation && isEmpty ? <span className="text-red-500"> *</span> : null;
  }

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

      setStep("details");
    } catch {
      setError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleConfirmOrder() {
    setOrderError(null);
    setShowValidation(true);

    const finalCity = city === "__other__" ? customCity.trim() : city;
    const isPostalValid = /^\d{10}$/.test(postalCode);
    const isUnitNumberValid = noUnitNumber || unitNumber.trim().length > 0;

    const missingGeneralFields =
      !firstName.trim() ||
      !lastName.trim() ||
      !province ||
      !finalCity ||
      !streetAddress.trim() ||
      !isUnitNumberValid;

    if (missingGeneralFields || !isPostalValid) {
      const messages: string[] = [];
      if (missingGeneralFields) {
        messages.push("لطفاً فیلدهای ستاره‌دار را تکمیل کنید.");
      }
      if (!isPostalValid) {
        messages.push("کدپستی باید دقیقاً ۱۰ رقم و فقط عدد باشد.");
      }
      setOrderError(messages.join("\n"));
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const { error: insertError } = await supabase.from("orders").insert({
        customer_phone: `+98${phoneDigits}`,
        items: items.map((item) => ({
          name: item.name,
          variant: item.variantLabel,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: cartTotal,
        first_name: firstName,
        last_name: lastName,
        country,
        province,
        city: finalCity,
        street_address: streetAddress,
        postal_code: postalCode,
        unit_number: noUnitNumber ? "ندارد" : unitNumber,
        floor: floor || null,
        email: email || null,
        status: "pending",
      });

      if (insertError) {
        console.error("Order insert error:", insertError);
        setOrderError("ثبت سفارش با خطا مواجه شد. دوباره تلاش کنید.");
        return;
      }

      clearCart();
      setStep("confirmed");
    } catch (err) {
      console.error("Order submission failed:", err);
      setOrderError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  if (step === "confirmed") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-3">سفارش شما ثبت شد</h1>
        <p className="text-gray-600 mb-8">
          سفارش شما با موفقیت ثبت شد. برای هماهنگی ارسال با شما تماس گرفته خواهد شد.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-green-700 hover:bg-green-800 transition text-white font-medium px-8 py-3 rounded-lg"
        >
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">سبد خرید شما خالی است.</p>
        <Link href="/shop" className="text-green-800 underline">
          مشاهده فروشگاه
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8 text-center">تکمیل خرید</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="order-2 md:order-1">
          <h2 className="text-lg font-semibold mb-4">خلاصه سفارش</h2>
          <div className="space-y-3 border border-gray-200 rounded-lg p-4">
            {items.map((item) => (
              <div
                key={`${item.slug}-${item.variantLabel}`}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} ({item.variantLabel}) × {item.quantity}
                </span>
                <span>{(item.price * item.quantity).toLocaleString("en-US")}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
              <span>مجموع</span>
              <span>{cartTotal.toLocaleString("en-US")} تومان</span>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {step === "phone" && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-center">شماره موبایل</h2>
              <p className="text-sm text-gray-500 mb-5 text-center">
                کد تایید پیامکی برای این شماره ارسال می‌شود. نیازی به ثبت‌نام یا ورود ندارید.
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

          {step === "details" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">اطلاعات ارسال</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      نام{requiredMark(!firstName.trim())}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm ${fieldErrorClass(
                        !firstName.trim()
                      )}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      نام خانوادگی{requiredMark(!lastName.trim())}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm ${fieldErrorClass(
                        !lastName.trim()
                      )}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">کشور</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
                  >
                    {countries.map((c) => (
                      <option key={c.value} value={c.value} disabled={!c.active}>
                        {c.label}
                        {!c.active ? " (به زودی)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      استان{requiredMark(!province)}
                    </label>
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white ${fieldErrorClass(
                        !province
                      )}`}
                    >
                      <option value="">انتخاب کنید</option>
                      {iranProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      شهرستان{requiredMark(!city && !!province)}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!province}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white disabled:bg-gray-100 ${fieldErrorClass(
                        !city && !!province
                      )}`}
                    >
                      <option value="">
                        {province ? "انتخاب کنید" : "ابتدا استان را انتخاب کنید"}
                      </option>
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {province && <option value="__other__">شهرستان دیگر</option>}
                    </select>
                  </div>
                </div>

                {city === "__other__" && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      نام شهرستان خود را وارد کنید{requiredMark(!customCity.trim())}
                    </label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm ${fieldErrorClass(
                        !customCity.trim()
                      )}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    آدرس{requiredMark(!streetAddress.trim())}
                  </label>
                  <textarea
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    rows={2}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none ${fieldErrorClass(
                      !streetAddress.trim()
                    )}`}
                    placeholder="شهر، روستا، خیابان، کوچه، ..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      کدپستی{requiredMark(!/^\d{10}$/.test(postalCode))}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={postalCode}
                      onChange={(e) =>
                        setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      maxLength={10}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm ${fieldErrorClass(
                        !/^\d{10}$/.test(postalCode)
                      )}`}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      پلاک{requiredMark(!noUnitNumber && !unitNumber.trim())}
                    </label>
                    <input
                      type="text"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      disabled={noUnitNumber}
                      placeholder="0"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-100 ${fieldErrorClass(
                        !noUnitNumber && !unitNumber.trim()
                      )}`}
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={noUnitNumber}
                        onChange={(e) => {
                          setNoUnitNumber(e.target.checked);
                          if (e.target.checked) setUnitNumber("");
                        }}
                        className="rounded"
                      />
                      پلاک ندارم
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">طبقه</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ایمیل (اختیاری)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              {orderError && (
                <div className="text-red-600 text-sm mt-4 space-y-1">
                  {orderError.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmittingOrder}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium py-3 rounded-lg mt-5"
              >
                {isSubmittingOrder ? "در حال ثبت سفارش..." : "تایید نهایی سفارش"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}