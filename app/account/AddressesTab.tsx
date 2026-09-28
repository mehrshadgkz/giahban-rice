// Path: /app/account
// File: AddressesTab.tsx
// Version: 1.1.0
//
// v1.1.0: نام and نام خانوادگی removed from saved addresses, since
// they now live in حساب کاربری. The /api/account/addresses route needs
// no change: it simply won't receive those two fields from this form.

"use client";

import { useState, useEffect } from "react";
import { iranLocations, iranProvinces } from "../data/iranLocations";

type Address = {
  slot: number;
  country: string;
  province: string;
  city: string;
  street_address: string;
  postal_code: string;
  unit_number: string;
  floor: string;
};

const slotLabels = ["آدرس اول", "آدرس دوم", "آدرس سوم"];

export default function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [draft, setDraft] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) setAddresses(data.addresses);
        else setLoadError(data.error || "خطا در دریافت آدرس‌ها.");
      })
      .catch(() => setLoadError("خطا در برقراری ارتباط."));
  }, []);

  function summaryFor(address: Address) {
    if (address.province && address.city) {
      return `${slotLabels[address.slot - 1]} (${address.province}، ${address.city})`;
    }
    return `${slotLabels[address.slot - 1]} (خالی)`;
  }

  function toggleExpand(slot: number) {
    if (expandedSlot === slot) {
      setExpandedSlot(null);
      setEditingSlot(null);
    } else {
      setExpandedSlot(slot);
      setEditingSlot(null);
    }
  }

  function startEditing(address: Address) {
    setError(null);
    setDraft({ ...address });
    setEditingSlot(address.slot);
  }

  async function handleSave() {
    if (!draft) return;
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ذخیره آدرس با خطا مواجه شد.");
        return;
      }

      setAddresses((prev) => prev.map((a) => (a.slot === draft.slot ? draft : a)));
      setEditingSlot(null);
    } catch {
      setError("خطا در برقراری ارتباط.");
    } finally {
      setIsSaving(false);
    }
  }

  const availableCities = draft?.province ? iranLocations[draft.province] || [] : [];

  if (loadError) {
    return <p className="text-red-600 text-sm">{loadError}</p>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-6">آدرس‌ها</h2>

      <div className="space-y-3">
        {addresses.map((address) => (
          <div key={address.slot} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleExpand(address.slot)}
              className="w-full text-right px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
            >
              {summaryFor(address)}
            </button>

            {expandedSlot === address.slot && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                {editingSlot !== address.slot ? (
                  <div>
                    {address.province ? (
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>{address.province}، {address.city}</p>
                        <p>{address.street_address}</p>
                        <p>
                          کدپستی: {address.postal_code} — پلاک: {address.unit_number} — طبقه: {address.floor}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-4">این آدرس هنوز خالی است.</p>
                    )}
                    <button
                      onClick={() => startEditing(address)}
                      className="text-sm text-green-800 underline"
                    >
                      ویرایش
                    </button>
                  </div>
                ) : (
                  draft &&
                  draft.slot === address.slot && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">استان</label>
                          <select
                            value={draft.province}
                            onChange={(e) =>
                              setDraft({ ...draft, province: e.target.value, city: "" })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                          >
                            <option value="">انتخاب کنید</option>
                            {iranProvinces.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">شهرستان</label>
                          <select
                            value={draft.city}
                            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                            disabled={!draft.province}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100"
                          >
                            <option value="">انتخاب کنید</option>
                            {availableCities.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">آدرس</label>
                        <textarea
                          value={draft.street_address}
                          onChange={(e) => setDraft({ ...draft, street_address: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">کدپستی</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={draft.postal_code}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                postal_code: e.target.value.replace(/\D/g, "").slice(0, 10),
                              })
                            }
                            dir="ltr"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">پلاک</label>
                          <input
                            type="text"
                            value={draft.unit_number}
                            onChange={(e) => setDraft({ ...draft, unit_number: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">طبقه</label>
                          <input
                            type="text"
                            value={draft.floor}
                            onChange={(e) => setDraft({ ...draft, floor: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {error && <p className="text-red-600 text-sm">{error}</p>}

                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 transition text-white text-sm font-medium px-5 py-2 rounded-lg"
                        >
                          {isSaving ? "در حال ذخیره..." : "ذخیره"}
                        </button>
                        <button
                          onClick={() => setEditingSlot(null)}
                          className="text-sm text-gray-500 underline"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}