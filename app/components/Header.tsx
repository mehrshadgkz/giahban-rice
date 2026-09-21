"use client";
// "use client" is required here because this component uses interactivity
// (useState, onClick, scroll listeners, useCart) — Next.js needs to know
// this runs in the browser, not just on the server.

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBasket, User, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";

// Temporary placeholder nav structure — later this could come from your
// admin panel or a config file instead of being hardcoded here.
const navLinks = [
  { label: "فروشگاه", href: "/shop" },
  { label: "بلاگ", href: "/blog" },
  {
    label: "راهنما",
    href: "#",
    children: [
      { label: "سوالات متداول", href: "/faq" },
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
];

export default function Header() {
  const [isStuck, setIsStuck] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  // Real cart data from CartContext — this is what was missing before.
  // Any component that calls useCart() shares the exact same state, so
  // adding a product anywhere in the app updates this badge instantly.
  const { items, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    function handleScroll() {
      setIsStuck(window.scrollY > 4);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow ${
          isStuck ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto h-[76px] px-6 flex items-center justify-between gap-6">
          <a href="/" className="text-2xl font-bold text-green-800">
            گیاه‌بان
          </a>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <a
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-800 hover:bg-green-50 hover:text-green-800 transition"
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </a>

                {link.children && (
                  <ul className="absolute top-full right-0 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          className="block px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-green-50 hover:text-green-800"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              aria-label="سبد خرید"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-50 transition"
            >
              <ShoppingBasket size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-green-800 text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="/account"
              aria-label="حساب کاربری"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-50 transition"
            >
              <User size={22} />
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="باز کردن منو"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-50 transition"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden absolute top-full right-3 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-40">
            {navLinks.map((link) => (
              <div key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    if (link.children) {
                      e.preventDefault();
                      setMobileSubmenuOpen(!mobileSubmenuOpen);
                    }
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-gray-800 hover:bg-green-50"
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </a>
                {link.children && mobileSubmenuOpen && (
                  <div className="pr-4">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-green-50"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Cart drawer — now shows real items instead of a hardcoded empty state */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/35 z-40"
            onClick={() => setCartOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">سبد خرید</h2>
              <button onClick={() => setCartOpen(false)} aria-label="بستن">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-6">
                <div>
                  <p>سبد خرید شما خالی است</p>
                  <a href="/shop" className="text-green-800 underline mt-3 inline-block">
                    مشاهده فروشگاه
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.slug}-${item.variantLabel}`}
                      className="flex gap-3 border-b border-gray-100 pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 mb-2">{item.variantLabel}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.slug, item.variantLabel, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                          >
                            −
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.slug, item.variantLabel, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-green-800">
                          {(item.price * item.quantity).toLocaleString("en-US")}
                        </p>
                        <button
                          onClick={() => removeItem(item.slug, item.variantLabel)}
                          className="text-xs text-gray-400 hover:text-red-600 mt-1"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 px-5 py-4">
                  <div className="flex justify-between mb-4 font-semibold">
                    <span>مجموع</span>
                    <span>{cartTotal.toLocaleString("en-US")} تومان</span>
                  </div>
                  <a
                    href="/checkout"
                    className="block text-center bg-green-700 hover:bg-green-800 transition text-white font-medium py-3 rounded-lg"
                  >
                    ادامه فرآیند خرید
                  </a>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </>
  );
}