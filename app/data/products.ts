// Path: /app/data
// File: products.ts
// Version: 1.0.0
//
// Central product data. Adding fields here (like `specs` or `fullDescription`)
// makes them available on the product detail page automatically — nothing
// in the page.tsx needs to change per-product, only this data file does.
//
// Image paths follow the real /public/products/[category]/[slug]/[slug].png
// structure — each product's main image is named exactly after its folder.
//
// Prices and stock status below are taken directly from the live WordPress
// site's screenshots (Sep 2026). "کهنه اعلا", "طارم", and "طارم هاشمی" were
// the only three in-stock items at that time — the rest are marked soldOut
// to match. Double-check against your actual current stock before launch,
// since this may have changed.
//
// rice-products and northern-condiments categories have no real products/
// images yet (public/products/rice-products/ is still empty) — add them
// here once photos exist.

export type ProductVariant = {
  label: string;
  price: number;
  brokenRicePercent?: number;
  suitability?: string;
  availability?: "موجود" | "ناموجود";
};

export type ProductSpecs = {
  weightLabel?: string;
  dimensions?: string;
  riceType?: string;
  grade?: string;
  gradeStars?: number;
  cultivationStatus?: string;
  originLocation?: string;
  harvestTime?: string;
  grainSizing?: string;
};

export type Product = {
  slug: string;
  name: string;
  image: string;
  weightKg: number;
  category: "rice" | "rice-products" | "northern-condiments";
  sku?: string;
  brand?: string;
  shortDescription?: string;
  fullDescription?: string;
  specs?: ProductSpecs;
  variants: ProductVariant[];
  soldOut?: boolean;
};

export const products: Product[] = [
  {
    slug: "tarom-hashemi-rice",
    name: "برنج طارم هاشمی فریدونکنار — ۵ کیلوگرم",
    image: "/products/rice/tarom-hashemi-rice/tarom-hashemi-rice.png",
    weightKg: 5,
    category: "rice",
    brand: "گیاهبان",
    shortDescription:
      "برنج طارم هاشمی اصیل فریدونکنار، برداشت تازه، با عطر و طعم بی‌نظیر.",
    specs: {
      weightLabel: "5 کیلوگرم",
      riceType: "طارم هاشمی",
      originLocation: "فریدونکنار، مازندران",
    },
    variants: [
      { label: "الک نشده", price: 2250000 },
      { label: "الک شده", price: 2400000, availability: "موجود" },
    ],
  },
  {
    slug: "rice-tarom-superior",
    name: "برنج طارم فریدونکنار — ۵ کیلوگرم",
    image: "/products/rice/rice-tarom-superior/rice-tarom-superior.png",
    weightKg: 5,
    category: "rice",
    sku: "R01",
    brand: "گیاهبان",
    shortDescription:
      "برنج طارم فریدونکنار با عطر و طعم طبیعی، تهیه شده مستقیم از کشاورز، ارسال سریع به سراسر کشور",
    fullDescription: `برنج طارم محلی فریدونکنار (کشت اول – برداشت تازه ۱۴۰۵) یکی از مرغوب‌ترین و خوش‌عطرترین برنج‌های اصیل ایرانی است که در شالیزارهای حاصلخیز فریدونکنار کشت می‌شود. این محصول از رده کیفی اعلا بوده و پس از پخت، دانه‌هایی بلند، خوش‌عطر، ریزدار و کاملاً نرم دارد؛ انتخابی ایده‌آل برای مصرف روزانه، مهمانی‌ها و مجالس شما.

در گیاهبان، این برنج به‌صورت مستقیم از کشاورزان خطه فریدونکنار تهیه می‌شود تا علاوه بر حفظ کیفیت عالی، بدون واسطه و با قیمتی منصفانه، پس از کنترل کیفیت، تمامی محصولات بسته‌بندی شده و آماده ارسال هستند.

توضیح در مورد برنج الک‌شده و نشده:
ما با استفاده از دستگاه پیشرفته سورتینگ و الک برنج، علاوه بر پاک‌سازی برنج از ناخالصی‌ها، دانه‌های شکسته و نیم‌دانه را نیز جدا کرده‌ایم. در بخش خرید، امکان انتخاب هر دو نمونه (الک‌شده و الک‌نشده) برای شما فراهم است. لازم به ذکر است که از نظر عطر، طعم و کیفیت پخت، هیچ تفاوتی میان این دو وجود ندارد و صرفاً میزان یکدست بودن دانه‌ها متفاوت است.

شرایط نگهداری:
نگهداری این برنج کاملاً مشابه سایر گونه‌هاست؛ کافی است آن را در محلی خنک، خشک، تاریک و دور از تابش مستقیم آفتاب قرار دهید.

اگر به‌دنبال برنجی با عطر طبیعی، طعم اصیل شمال و کیفیت تضمین‌شده هستید، برنج طارم فریدونکنار گیاهبان انتخابی مطمئن برای سفره شما خواهد بود.`,
    specs: {
      weightLabel: "5 کیلوگرم",
      dimensions: "20 × 15 × 30 سانتی‌متر",
      riceType: "طارم",
      grade: "اعلا",
      gradeStars: 5,
      cultivationStatus: "کشت اول",
      originLocation: "فریدونکنار، مازندران",
      harvestTime: "تیر و مرداد 1405",
      grainSizing: "دانه کامل",
    },
    variants: [
      { label: "الک نشده", price: 2225000 },
      {
        label: "الک شده",
        price: 2375000,
        brokenRicePercent: 0,
        suitability: "مناسب مصرف رستوران و مجالس",
        availability: "موجود",
      },
    ],
  },
  {
    slug: "aged-rice-fereydunkenar",
    name: "برنج کهنه اعلا فریدونکنار — ۵ کیلوگرم",
    image: "/products/rice/aged-rice-fereydunkenar/aged-rice-fereydunkenar.png",
    weightKg: 5,
    category: "rice",
    brand: "گیاهبان",
    shortDescription: "برنج کهنه اعلا، خشک شده به روش سنتی، مناسب برای پخت مجلسی.",
    variants: [{ label: "الک شده", price: 2350000, availability: "موجود" }],
  },
  {
    slug: "tarom-broken-rice",
    name: "برنج طارم شکسته فریدونکنار — ۵ کیلوگرم",
    image: "/products/rice/tarom-broken-rice/tarom-broken-rice.png",
    weightKg: 5,
    soldOut: true,
    category: "rice",
    shortDescription: "برنج طارم شکسته، اقتصادی، مناسب پخت روزانه.",
    variants: [
      { label: "نیم دانه", price: 1500000 },
      { label: "لاشه", price: 1650000 },
      { label: "سرلاشه", price: 1850000 },
    ],
  },
  {
    slug: "premium-shiroodi-rice",
    name: "برنج شیرودی استخوانی — ۵ کیلوگرم",
    image: "/products/rice/premium-shiroodi-rice/premium-shiroodi-rice.png",
    weightKg: 5,
    soldOut: true,
    category: "rice",
    shortDescription: "برنج شیرودی استخوانی، دانه بلند و مقاوم در پخت.",
    variants: [{ label: "الک شده", price: 1800000 }],
  },
  {
    slug: "ratoon-rice-fereydunkenar",
    name: "برنج راتون فریدونکنار — ۵ کیلوگرم",
    image: "/products/rice/ratoon-rice-fereydunkenar/ratoon-rice-fereydunkenar.png",
    weightKg: 5,
    soldOut: true,
    category: "rice",
    shortDescription: "برنج کشت راتون فریدونکنار، معطر و باکیفیت.",
    variants: [{ label: "الک شده", price: 2400000 }],
  },
  {
    slug: "rice-tarom-second-crop-fereydunkenar",
    name: "برنج کشت دوم فریدونکنار — ۵ کیلوگرم",
    image:
      "/products/rice/rice-tarom-second-crop-fereydunkenar/rice-tarom-second-crop-fereydunkenar.png",
    weightKg: 5,
    soldOut: true,
    category: "rice",
    shortDescription: "برنج کشت دوم، اقتصادی و مناسب مصرف روزانه خانواده.",
    variants: [{ label: "الک شده", price: 2500000 }],
  },
  {
    slug: "needle-fajr-rice",
    name: "برنج فجر سوزنی — ۵ کیلوگرم",
    image: "/products/rice/needle-fajr-rice/needle-fajr-rice.png",
    weightKg: 5,
    soldOut: true,
    category: "rice",
    shortDescription: "برنج فجر سوزنی، دانه بلند و معطر.",
    variants: [{ label: "الک شده", price: 1800000 }],
  },
];

export const featuredProducts = products.filter(
  (p) => !p.soldOut && p.category === "rice"
);