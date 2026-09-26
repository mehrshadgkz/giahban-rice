// Path: /app/account
// File: AccountTabs.tsx
// Version: 1.1.0
//
// v1.1.0: حساب کاربری tab now shows the real SettingsTab component
// instead of a placeholder. The other four tabs are still placeholders.

"use client";

import { useState } from "react";
import SettingsTab from "./SettingsTab";

type Tab = "orders" | "reviews" | "addresses" | "settings" | "logout";

const tabs: { id: Tab; label: string }[] = [
  { id: "orders", label: "سفارش‌ها" },
  { id: "reviews", label: "دیدگاه‌ها و پرسش‌ها" },
  { id: "addresses", label: "آدرس‌ها" },
  { id: "settings", label: "حساب کاربری" },
  { id: "logout", label: "خروج از حساب" },
];

export default function AccountTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  return (
    <div className="grid md:grid-cols-4 gap-8">
      <nav className="md:col-span-1">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-right px-4 py-2.5 rounded-lg text-sm transition ${
                  activeTab === tab.id
                    ? "bg-green-800 text-white"
                    : "text-gray-700 hover:bg-green-50"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="md:col-span-3">
        {activeTab === "orders" && <p className="text-gray-500">سفارش‌ها — به زودی</p>}
        {activeTab === "reviews" && <p className="text-gray-500">دیدگاه‌ها و پرسش‌ها — به زودی</p>}
        {activeTab === "addresses" && <p className="text-gray-500">آدرس‌ها — به زودی</p>}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "logout" && <p className="text-gray-500">خروج از حساب — به زودی</p>}
      </div>
    </div>
  );
}