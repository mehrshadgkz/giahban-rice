<!-- Path: / (repo root) -->
<!-- File: AI_CONTEXT.md -->
<!-- Version: 1.0.0 -->

# AI Context: giahban-rice

Read this file first. Then ask the user to paste the CURRENT version of any file you need to change. Never rely on an old copy from a previous chat.

## 1. Project
- A website that sells rice (products, cart, checkout, blog, OTP phone login).
- Repo / folder name: `giahban-rice`

## 2. Stack
- Framework: Next.js (App Router, TypeScript)
- Accounts and orders: Supabase
- Hosting: Vercel
- Development: GitHub Codespaces in a browser, on a phone or tablet

## 3. About the user
- A mechanical engineer, NOT a programmer. Explain things in simple words.
- Works on a phone/tablet, so keep answers short and easy to read on a small screen.

## 4. Rules for every AI
1. Comment the code as much as possible, in plain English. Explain what each block does.
2. Keep code lightweight, fast, structured, short and safe.
3. Every complete file you send MUST start with these three lines (use `//` in code files):
   ```
   // Path: app/checkout
   // File: page.tsx
   // Version: 1.0.0
   ```
   - The file name must match exactly (Next.js needs lowercase `page.tsx`).
   - When you change a file, raise the version (1.0.0 to 1.0.1 for a small fix, 1.1.0 for a new feature).
4. Always send the COMPLETE file, not just a piece, unless the user asks otherwise.
5. Never ask for or show secret keys. `.env.local` must never be pasted anywhere or pushed to GitHub.
6. After changing a file, add one row to the Change Log below.

## 5. Folder map
```
app/
  layout.tsx, page.tsx          main layout and home page
  api/otp/send/route.ts         sends the OTP code
  api/otp/verify/route.ts       checks the OTP code
  checkout/page.tsx             checkout page
  shop/page.tsx                 shop list
  shop/[slug]/page.tsx          single product page
  components/                   BlogPreview, CategoryBanner, Footer, Header,
                                Hero, OtpInput, PhoneInput, ProductCard, Ticker
  context/CartContext.tsx       shopping cart state
  data/iranLocation.ts          location data
  data/products.ts              product list
  lib/supabase.ts               Supabase connection
public/                         images (about, blog, categories, homepage, products)
.env.local                      secret keys (NOT in git, never share)
```

## 6. Change Log
Newest row on top.

| Date | File | Version | What changed | Which AI |
|------|------|---------|--------------|----------|
| 2026-09-22 | all files | 1.0.0 | First saved state of the project | (none) |
