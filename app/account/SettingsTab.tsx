// Path: /app/account
// File: SettingsTab.tsx
// Version: 1.0.0
//
// حساب کاربری tab: name, email, شماره شبا, display-name preference
// (all editable via a single "ویرایش" toggle + one "ذخیره" button),
// plus the phone number shown read-only since it's the account's
// permanent identity tied to OTP verification.

"use client";

import { useState, useEffect } from "react";

type Settings = {
  phone: string;
  name: string | null;
  email: string | null;
  iban: string | null;
  display_name_preference: string;
};

const displayNameOptions = [
  { value: "first_name", label: "فقط نام" },
  { value: "last_name", label: "فقط نام خانوادگی" },
  { value: "full_name", label: "نام و نام خانوادگی" },
  { value: "masked_phone", label: "بخشی از شماره تماس" },
];

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Draft fields — only committed to `settings` after a successful save,
  // so clicking away from edit mode without saving doesn't lose the
  // last-saved values.
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [ibanDraft, setIbanDraft] = useState("");
  const [displayNameDraft, setDisplayNameDraft] = useState("first_name");

  useEffect(() => {
    fetch("/api/account/settings")
      .then((res) => res.json())
      .then((data: Settings) => {
        setSettings(data);
        setNameDraft(data.name || "");
        setEmailDraft(data.email || "");
        setIbanDraft(data.iban || "");
        setDisplayNameDraft(data.display_name_preference || "first_name");
      });
  }, []);

  function startEditing() {
    setError(null);
    setSaved(false);
    setIsEditing(true);
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameDraft,
          email: emailDraft,
          iban: ibanDraft,
          display_name_preference: displayNameDraft,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ذخیره اطلاعات با خطا مواجه شد.");
        return;
      }

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              name: nameDraft,
              email: emailDraft,
              iban: ibanDraft,
              display_name_preference: displayNameDraft,
            }
          : prev
      );
      setIsEditing(false);
      setSaved(true);
    } catch {
      setError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-gray-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">حساب کاربری</h2>
        {!isEditing && (
          <button onClick={startEditing} className="text-sm text-green-800 underline">
            ویرایش
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">شماره موبایل</label>
          <input
            type="text"
            value={settings.phone}
            disabled
            dir="ltr"
            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">نام و نام خانوادگی</label>
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            disabled={!isEditing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">ایمیل</label>
          <input
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            disabled={!isEditing}
            dir="ltr"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">شماره شبا</label>
          <input
            type="text"
            value={ibanDraft}
            onChange={(e) => setIbanDraft(e.target.value.toUpperCase())}
            disabled={!isEditing}
            dir="ltr"
            placeholder="IR000000000000000000000000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            در صورت مرجوعی یا لغو، مبلغ واریز شده به حساب شخص واریز کننده ارسال می‌شود.
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">نمایش نام</label>
          <select
            value={displayNameDraft}
            onChange={(e) => setDisplayNameDraft(e.target.value)}
            disabled={!isEditing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
          >
            {displayNameOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      {saved && !isEditing && (
        <p className="text-green-700 text-sm mt-4">تغییرات با موفقیت ذخیره شد.</p>
      )}

      {isEditing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white font-medium px-6 py-2.5 rounded-lg text-sm"
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-500 underline"
          >
            انصراف
          </button>
        </div>
      )}
    </div>
  );
}