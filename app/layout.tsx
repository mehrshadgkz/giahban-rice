// Path: /app
// File: layout.tsx
// Version: 1.0.0

import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";

export const metadata = {
  title: "گیاه‌بان | برنج اصیل فریدونکنار",
  description: "برنج اصیل فریدونکنار، مستقیم به خانه شما",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}