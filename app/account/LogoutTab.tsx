// Path: /app/account
// File: LogoutTab.tsx
// Version: 1.0.0
//
// Simple confirm-and-sign-out screen. A full page navigation
// (window.location.href) is used after logout, same reasoning as the
// login page fix — guarantees the browser sends the freshly-cleared
// cookie state on a real new request rather than a stale cached page.

"use client";

import { useState } from "react";

export default function LogoutTab() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-3">خروج از حساب</h2>
      <p className="text-sm text-gray-600 mb-6">
        با خروج از حساب، برای دسترسی مجدد به این بخش نیاز به تایید شماره موبایل خواهید داشت.
      </p>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 transition text-white font-medium px-6 py-2.5 rounded-lg text-sm"
      >
        {isLoggingOut ? "در حال خروج..." : "خروج از حساب"}
      </button>
    </div>
  );
}