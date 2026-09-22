// Path: /app/lib
// File: supabase.ts
// Version: 1.0.0
//
// Creates a single shared Supabase client, connected using the URL and
// key stored in .env.local. Any file that needs to read/write data
// (customers, orders, otp_codes, etc.) imports `supabase` from here
// instead of creating its own separate connection.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);