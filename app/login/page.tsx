// Path: /app/login
// File: page.tsx
// Version: 1.0.0
//
// Standalone sign-in page — same phone/OTP flow as checkout, reached
// by clicking the account icon while signed out. Once verified,
// redirects straight to /account.

"use client";

import { useRouter } from "next/navigation";
import PhoneOtpFlow from "../components/PhoneOtpFlow";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <PhoneOtpFlow onVerified={() => router.push("/account")} />
    </main>
  );
}