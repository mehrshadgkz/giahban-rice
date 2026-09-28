// Path: /app/account
// File: SettingsTab.tsx
// Version: 1.1.0
//
// v1.1.0: نام and نام خانوادگی now live here as separate fields.
// Phone (read-only), email, شماره شبا and display-name preference are
// all shown together. Loading failures now show a real error message
// with a retry button instead of loading forever.

"use client";

import { useState, useEffect } from "react";

type Settings = {
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  iban: string;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Draft fields: only committed to `settings` after a successful save.
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [lastNameDraft, setLastNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [ibanDraft, setIbanDraft] = useState("");
  const [displayNameDraft, setDisplayNameDraft] = useState("first_name");

  function applySettings(data: Settings) {
    setSettings(data);
    setFirstNameDraft(data.first_name || "");
    setLastNameDraft(data.last_name || "");
    setEmailDraft(data.email || "");
    setIbanDraft(data.iban || "");
    setDisplayNameDraft(data.display_name_preference || "first_name");
  }

  async function loadSettings() {
    setLoadError(null);
    try {
      const res = await fetch("/api/account/settings");
      const data = await res.json();

      if (!res.ok) {
        setLoadError(data.error || "خطا در دریافت اطلاعات حساب.");
        return;
      }

      applySettings(data);
    } catch {
      setLoadError("خطا در برقراری ارتباط. اتصال اینترنت را بررسی کنید.");
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function startEditing() {
    setError(null);
    setSaved(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    if (settings) applySettings(settings); // discard unsaved changes
    setIsEditing(false);
    setError(null);
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstNameDraft,
          last_name: lastNameDraft,
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
              first_name: firstNameDraft,
              last_name: lastNameDraft,
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

  if (loadError) {
    return (
      <div className="max-w-lg">
        <p className="text-red-600 text-sm mb-3">{loadError}</p>
        <button onClick={loadSettings} className="text-sm text-green-800 underline">
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-gray-500">در حال بارگذاری...</p>;
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500";

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">نام</label>
            <input
              type="text"
              value={firstNameDraft}
              onChange={(e) => setFirstNameDraft(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">نام خانوادگی</label>
            <input
              type="text"
              value={lastNameDraft}
              onChange={(e) => setLastNameDraft(e.target.value)}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">ایمیل</label>
          <input
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            disabled={!isEditing}
            dir="ltr"
            className={inputClass}
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
            className={inputClass}
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
            className={`${inputClass} bg-white`}
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
          <button onClick={cancelEditing} className="text-sm text-gray-500 underline">
            انصراف
          </button>
        </div>
      )}
    </div>
  );
}