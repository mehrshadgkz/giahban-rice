# AI Context: giahban-rice

Read this file first. Then ask the user to paste the CURRENT version of any file you need to change. Never rely on an old copy from a previous chat.

## 1. Project

- A website that sells Iranian rice (products, cart, checkout, blog, OTP phone login).
- Business name: گیاه‌بان (Giahban) — sells Tarom and other rice varieties, sourced directly from farmers in Fereydunkenar, Mazandaran.
- Repo / folder name: `giahban-rice`
- Live GitHub repo: https://github.com/mehrshadgkz/giahban-rice (public)
- Originally built on WordPress/WooCommerce; this repo is a full rebuild in Next.js.

## 2. Stack

- Framework: Next.js (App Router, TypeScript, Tailwind CSS)
- Accounts, orders, and pending OTP codes: Supabase (Postgres)
- SMS OTP delivery: Melipayamak (Iranian SMS provider)
- Hosting: Vercel
- Development: GitHub Codespaces, used entirely from a phone/tablet browser (Firefox or Chrome)

## 3. About the user

- Mehrshad — a mechanical engineer, NOT a programmer. Explain things in simple, plain words. No jargon without explanation.
- Works entirely on a phone/tablet browser — no desktop, no local dev environment. Keep answers short and easy to read on a small screen.
- Copies and pastes code manually between an AI chat and the Codespaces browser editor — cannot easily use terminal-based tools or automated file-sync methods.
- Prefers understanding the "why" behind a decision, not just the instruction — explain reasoning, not just steps.
- Wants every file traceable: path, filename, and version number in a header comment (see Rule 3 below).

## 4. Rules for every AI

1. Comment the code as much as possible, in plain English. Explain what each block does and why.
2. Keep code lightweight, fast, structured, short, and safe.
3. Every complete file you send MUST start with these three lines (as `//` in code files, or a `$comment` key for JSON):
- The file name must match exactly (Next.js needs lowercase `page.tsx`).
- When you change a file, raise the version (1.0.0 → 1.0.1 for a small fix, 1.1.0 for a new feature).
4. Always send the COMPLETE file, not just a fragment, unless the user explicitly asks for a partial edit.
5. Never ask for or display secret keys. `.env.local` must never be pasted into chat or pushed to GitHub (it's in `.gitignore`).
6. After changing a file, add one row to the Change Log below.
7. Before reconstructing any file from memory, ask the user to paste their actual current version if there's any doubt — mismatches between a remembered version and the real file have caused real bugs in this project before (see Ticker.tsx incident, Sep 2026).
8. This project is guest-checkout-first: buying never requires a separate "login" step. Entering a phone number at checkout either matches an existing customer or silently creates a new one — this is a firm product decision, not an implementation detail to reconsider.

## 5. Folder map
app/
layout.tsx, page.tsx              main layout and home page
globals.css                        Tailwind base styles (must live in /app, not root)
api/otp/send/route.ts             sends the OTP code via Melipayamak, stores pending code in Supabase
api/otp/verify/route.ts           checks the OTP code, creates/matches customer in Supabase
checkout/page.tsx                 checkout page (phone → OTP → address form → order)
shop/page.tsx                     shop list, filterable by category via URL
shop/[slug]/page.tsx              single product detail page
components/
BlogPreview.tsx                  homepage blog post previews (placeholder data)
CategoryBanner.tsx               homepage category links
Footer.tsx                       site footer, Enamad trust badge placeholder
Header.tsx                       nav, cart drawer, mobile menu
Hero.tsx                         homepage hero section
OtpInput.tsx                     6-box segmented OTP code entry
PhoneInput.tsx                   13-box segmented Iranian phone number entry
ProductCard.tsx                  product card used in grids across the site
Ticker.tsx                       scrolling announcement bar (custom drag/momentum logic)
context/CartContext.tsx           shopping cart state (localStorage-backed)
data/
iranLocations.ts                 all 31 provinces + major cities per province
products.ts                      product catalog (prices, stock, specs)
lib/supabase.ts                   Supabase client connection
public/                             images: about, blog, categories, homepage, products
.env.local                          secret keys (NOT in git, never share)
.gitignore                          excludes node_modules, .next, .env*, etc.
## 6. Database (Supabase) tables

- `customers` — id, phone, placeholder_email, name, created_at. Created automatically on first successful OTP verification (placeholder email format: `09XXXXXXXXX@giahban-customer.local`).
- `orders` — id, customer_phone, items (jsonb), total_price, first_name, last_name, country, province, city, street_address, postal_code, unit_number, floor, email, status, created_at.
- `otp_codes` — phone (primary key), code, sent_at, send_count, hour_window_start. Temporary storage for pending OTP codes, replacing an earlier in-memory approach that broke on server restarts and on serverless hosting.

## 7. Key product decisions already made (do not relitigate without reason)

- OTP: SMS only, 120-second cooldown between sends, max 3 sends/hour per phone number, 6-digit codes.
- Phone format: `+98 9XX XXX XXXX`.
- Guest checkout is the default. No account/login required to buy.
- Country field at checkout shows Iran, Russia, UAE, Qatar — only Iran is currently active/selectable.
- Province: dropdown (all 31, fixed list). City: dropdown of major cities per province, with a "شهرستان دیگر" (other) option that reveals a free-text fallback — deliberately not exhaustive, grows organically as real orders reveal gaps.
- Postal code: exactly 10 digits, numbers only, required.
- "پلاک" (house/unit number): required by default, but a "پلاک ندارم" checkbox lets a customer with a genuinely address-less home say so explicitly (stores "ندارد" rather than blocking the order).
- Checkout form validation: no red borders/asterisks on first visit — they only appear on fields still empty/invalid after a submit attempt, and clear immediately once filled in.
- Numbers displayed/entered throughout the site use standard English digits (0-9), not Persian digits — kept consistent for form validation and regex simplicity.
- Shipping method selection and payment (PayPing) integration are intentionally deferred — not yet built.

## 8. Current status (as of 2026-09-22)

**Working and deployed live on Vercel:**
- Homepage, shop listing (with category filter), individual product detail pages.
- Full cart system (add/remove/update quantity, persisted via localStorage).
- Full checkout flow: cart summary → phone entry → OTP send/verify (Supabase-backed, survives server restarts) → full address form → order saved to Supabase `orders` table.
- Customer accounts silently created on first successful OTP verification.

**Not yet built:**
- Payment integration (PayPing).
- Shipping method selection at checkout.
- Real blog system (currently placeholder posts in `BlogPreview.tsx`).
- `/account` page (Header links to it, but it 404s currently).
- Products for `rice-products` and `northern-condiments` categories (no real photos/data yet — only `rice` category is populated).

**Known project-history notes:**
- The project was migrated between two different GitHub accounts/Codespaces mid-development due to a Codespaces authentication permission issue (old Codespace's token couldn't push to a newly-created repo) and separately due to running out of free Codespaces quota. All files were manually recreated via copy-paste into a fresh Codespace — if anything seems inconsistent with an old conversation's description of a file, trust the live GitHub repo over chat history.
- `Ticker.tsx` and other components contain real custom logic (e.g. touch/drag momentum) that must be pasted from the user's actual saved copy, not reconstructed from memory — a past AI reconstruction attempt was inaccurate.

## 9. Change Log

Newest row on top.

| Date       | File          | Version | What changed                                       | Which AI |
| ---------- | ------------- | ------- | --------------------------------------------------- | -------- |
| 2026-09-22 | Footer.tsx    | 1.0.1   | Swapped removed Instagram icon for Camera icon (lucide-react dropped brand icons) | Claude |
| 2026-09-22 | all files     | 1.0.0   | First saved state of the project (post-migration)    | Claude |