// Path: /app/account
// File: AccountTabs.tsx
// Version: 1.2.0
//
// v1.2.0: خروج از حساب and آدرس‌ها now show their real components
// instead of placeholders. Only سفارش‌ها and دیدگاه‌ها و پرسش‌ها
// remain placeholders.

"use client";

import { useState } from "react";
import SettingsTab from "./SettingsTab";
import AddressesTab from "./AddressesTab";
import LogoutTab from "./LogoutTab";

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
        {activeTab === "addresses" && <AddressesTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "logout" && <LogoutTab />}
      </div>
    </div>
  );
}