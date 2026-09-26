// Path: /app/api/auth/logout
// File: route.ts
// Version: 1.0.0
//
// Signs the customer out: deletes their session row in Supabase and
// clears the cookie. Both steps matter — deleting only the cookie
// would leave a still-valid session token that could theoretically be
// reused if somehow recovered.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE_NAME } from "../../../lib/session";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}