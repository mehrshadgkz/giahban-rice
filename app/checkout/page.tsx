// Path: /app/checkout
// File: page.tsx
// Version: 1.2.0
//
// v1.2.0:
// - Checks for an existing login session first. A signed-in customer
//   skips the phone/OTP step and goes straight to the address form,
//   pre-filled with their name and email from their account.
// - A signed-out customer verifies through the shared PhoneOtpFlow
//   component (the same one used by /login), replacing this file's old
//   duplicated phone/OTP code.
// - New orders now record customer_id, so they show up in
//   حساب کاربری > سفارش‌ها. Status starts as "awaiting_payment",
//   one of the real statuses the orders list understands.
//
// Flow: (session check) → phone/OTP if signed out → address form →
// shipping method → confirmed. Payment (PayPing) is still deferred.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import PhoneOtpFlow from "../components/PhoneOtpFlow";
import { iranLocations, iranProvinces } from "../data/iranLocations";
import { getAvailableShippingOptions, ShippingOption } from "../lib/shipping";

type CheckoutStep = "loading" | "phone" | "details" | "shipping" | "confirmed";

type AccountInfo = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

const countries = [
  { label: "ایران", value: "ایران", active: true },
  { label: "روسیه", value: "روسیه", active: false },
  { label: "امارات متحده عربی", value: "امارات متحده عربی", active: false },
  { label: "قطر", value: "قطر", active: false },
];

function formatToman(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function CheckoutPage() {
  const { items, cartTotal, cartTotalWeightKg, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("loading");
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

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

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const availableCities = province ? iranLocations[province] || [] : [];
  const selectedShipping = shippingOptions.find((o) => o.companyId === selectedShippingId);

  // Stores the signed-in customer and pre-fills the form with their
  // account details, without overwriting anything already typed.
  function applyAccount(data: AccountInfo) {
    setAccount(data);
    setFirstName((prev) => prev || data.firstName || "");
    setLastName((prev) => prev || data.lastName || "");
    setEmail((prev) => prev || data.email || "");
  }

  // On page load: already signed in? Skip straight to the address form.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.signedIn) {
          applyAccount(data);
          setStep("details");
        } else {
          setStep("phone");
        }
      })
      .catch(() => setStep("phone"));
  }, []);

  // Called by PhoneOtpFlow after a successful code check. The server
  // has just set the session cookie, so we read the account back.
  async function handleVerified() {
    setVerifyError(null);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.signedIn) {
        applyAccount(data);
        setStep("details");
        return;
      }
    } catch {
      // handled below
    }
    setVerifyError("تایید شماره انجام شد اما ورود به حساب ناموفق بود. صفحه را دوباره بارگذاری کنید.");
  }

  function handleProvinceChange(newProvince: string) {
    setProvince(newProvince);
    setCity("");
    setCustomCity("");
  }

  function fieldErrorClass(isEmpty: boolean) {
    return showValidation && isEmpty ? "border-red-500" : "border-gray-300";
  }

  function requiredMark(isEmpty: boolean) {
    return showValidation && isEmpty ? <span className="text-red-500"> *</span> : null;
  }

  async function handleContinueToShipping() {
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

    setIsLoadingShipping(true);
    setShippingError(null);
    try {
      const options = await getAvailableShippingOptions(cartTotalWeightKg, province, finalCity);
      if (options.length === 0) {
        setShippingError("متأسفانه روش ارسالی برای این مقصد یافت نشد.");
      }
      setShippingOptions(options);
      setSelectedShippingId(null);
      setStep("shipping");
    } catch (err) {
      console.error("Failed to fetch shipping options:", err);
      setShippingError("خطا در دریافت روش‌های ارسال. دوباره تلاش کنید.");
    } finally {
      setIsLoadingShipping(false);
    }
  }

  async function handleConfirmOrder() {
    setOrderError(null);

    if (!account) {
      setOrderError("ابتدا وارد حساب کاربری خود شوید.");
      return;
    }

    if (!selectedShipping) {
      setOrderError("لطفاً یک روش ارسال انتخاب کنید.");
      return;
    }

    const finalCity = city === "__other__" ? customCity.trim() : city;

    setIsSubmittingOrder(true);
    try {
      const { error: insertError } = await supabase.from("orders").insert({
        customer_phone: account.phone,
        customer_id: account.id,
        items: items.map((item) => ({
          slug: item.slug,
          name: item.name,
          variant: item.variantLabel,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: cartTotal + selectedShipping.cost,
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
        status: "awaiting_payment",
        shipping_company: selectedShipping.name,
        shipping_cost: selectedShipping.cost,
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
        <div className="flex justify-center gap-4">
          <Link
            href="/account"
            className="inline-block border border-green-700 text-green-800 hover:bg-green-50 transition font-medium px-8 py-3 rounded-lg"
          >
            مشاهده سفارش‌ها
          </Link>
          <Link
            href="/shop"
            className="inline-block bg-green-700 hover:bg-green-800 transition text-white font-medium px-8 py-3 rounded-lg"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
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

  if (step === "loading") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-500">
        در حال بارگذاری...
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
                <span>{formatToman(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-gray-500 pt-1">
              <span>جمع محصولات</span>
              <span>{formatToman(cartTotal)} تومان</span>
            </div>
            {selectedShipping && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>هزینه ارسال</span>
                <span>{formatToman(selectedShipping.cost)} تومان</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
              <span>مجموع</span>
              <span>{formatToman(cartTotal + (selectedShipping?.cost ?? 0))} تومان</span>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {step === "phone" && (
            <div>
              <PhoneOtpFlow onVerified={handleVerified} />
              {verifyError && (
                <p className="text-red-600 text-sm mt-4 text-center">{verifyError}</p>
              )}
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
                onClick={handleContinueToShipping}
                disabled={isLoadingShipping}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium py-3 rounded-lg mt-5"
              >
                {isLoadingShipping ? "در حال بررسی روش‌های ارسال..." : "ادامه به روش ارسال"}
              </button>
            </div>
          )}

          {step === "shipping" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">روش ارسال</h2>
              <p className="text-sm text-gray-500 mb-4">
                یکی از روش‌های زیر را برای ارسال سفارش خود انتخاب کنید.
              </p>

              {shippingError && <p className="text-red-600 text-sm mb-4">{shippingError}</p>}

              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <label
                    key={option.companyId}
                    className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition ${
                      selectedShippingId === option.companyId
                        ? "border-green-700 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShippingId === option.companyId}
                        onChange={() => setSelectedShippingId(option.companyId)}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{option.name}</p>
                        {option.deliveryDaysMin && option.deliveryDaysMax && (
                          <p className="text-xs text-gray-500">
                            تحویل طی {option.deliveryDaysMin} تا {option.deliveryDaysMax} روز کاری
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-800">
                      {formatToman(option.cost)} تومان
                    </span>
                  </label>
                ))}
              </div>

              {orderError && <p className="text-red-600 text-sm mt-4">{orderError}</p>}

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmittingOrder || !selectedShippingId}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium py-3 rounded-lg mt-5"
              >
                {isSubmittingOrder ? "در حال ثبت سفارش..." : "تایید نهایی سفارش"}
              </button>

              <button
                onClick={() => setStep("details")}
                className="w-full text-sm text-gray-500 underline mt-3"
              >
                بازگشت به اطلاعات ارسال
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}