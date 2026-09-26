// Path: /app/login
// File: page.tsx
// Version: 1.0.1
//
// v1.0.1: switched from router.push to a full page navigation
// (window.location.href) after verification. router.push was
// occasionally reusing a stale cached version of /account rendered
// from before sign-in (still showing "not signed in"), sending the
// customer back to /login in a loop. A full navigation guarantees the
// browser sends the freshly-set session cookie on a brand new request.

"use client";

import PhoneOtpFlow from "../components/PhoneOtpFlow";

export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <PhoneOtpFlow onVerified={() => (window.location.href = "/account")} />
    </main>
  );
}