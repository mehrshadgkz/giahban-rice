// Path: /app/account
// File: page.tsx
// Version: 1.0.0
//
// Account page shell — checks sign-in status server-side and redirects
// to /login if not signed in. The 5 tabs (سفارش‌ها، دیدگاه‌ها و
// پرسش‌ها، آدرس‌ها، حساب کاربری، خروج از حساب) are built next; this
// is just the frame and navigation between them.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCustomerIdFromSessionToken, SESSION_COOKIE_NAME } from "../lib/session";
import AccountTabs from "./AccountTabs";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const customerId = token ? await getCustomerIdFromSessionToken(token) : null;

  if (!customerId) {
    redirect("/login");
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">حساب کاربری</h1>
      <AccountTabs />
    </main>
  );
}