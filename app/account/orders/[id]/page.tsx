// Path: /app/account/orders/[id]
// File: page.tsx
// Version: 1.0.0
//
// Order detail view: order number/date, items with prices, shipping
// method/cost, delivery address, a simple status display, and a
// cancel button that only appears while canCustomerCancel(status) is
// true — matches the decision that cancellation is only possible
// before the order starts shipping.

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { statusLabels, canCustomerCancel, OrderStatus } from "../../../lib/orderStatus";

type OrderItem = {
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

type OrderDetail = {
  id: string;
  order_number: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  items: OrderItem[];
  first_name: string;
  last_name: string;
  province: string;
  city: string;
  street_address: string;
  postal_code: string;
  unit_number: string;
  floor: string;
  shipping_company: string | null;
  shipping_cost: number | null;
};

function formatToman(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || "سفارش یافت نشد.");
        }
        setIsLoading(false);
      });
  }, [id]);

  async function handleCancel() {
    setCancelError(null);
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/account/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "لغو سفارش با خطا مواجه شد.");
        return;
      }

      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    } catch {
      setCancelError("خطا در برقراری ارتباط.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <main className="max-w-3xl mx-auto px-6 py-12 text-gray-500">در حال بارگذاری...</main>;
  }

  if (error || !order) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-red-600 mb-4">{error || "سفارش یافت نشد."}</p>
        <Link href="/account" className="text-green-800 underline">
          بازگشت به حساب کاربری
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/account" className="text-sm text-gray-500 hover:text-green-800">
        ← بازگشت به سفارش‌ها
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold mb-1">سفارش #{order.order_number}</h1>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString("fa-IR")}
        </p>
        <p className="text-sm mt-2">
          وضعیت:{" "}
          <span className="font-medium text-green-800">{statusLabels[order.status]}</span>
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-4">اقلام سفارش</h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.name} ({item.variant}) × {item.quantity}
              </span>
              <span>{formatToman(item.price * item.quantity)} تومان</span>
            </div>
          ))}
        </div>

        {order.shipping_company && (
          <div className="flex justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span>هزینه ارسال ({order.shipping_company})</span>
            <span>{formatToman(order.shipping_cost || 0)} تومان</span>
          </div>
        )}

        <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-gray-200">
          <span>مجموع</span>
          <span>{formatToman(order.total_price)} تومان</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-3">آدرس تحویل</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{order.first_name} {order.last_name}</p>
          <p>{order.province}، {order.city}</p>
          <p>{order.street_address}</p>
          <p>
            کدپستی: {order.postal_code} — پلاک: {order.unit_number} — طبقه: {order.floor}
          </p>
        </div>
      </div>

      {canCustomerCancel(order.status) && (
        <div>
          {cancelError && <p className="text-red-600 text-sm mb-3">{cancelError}</p>}
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 transition text-white text-sm font-medium px-6 py-2.5 rounded-lg"
          >
            {isCancelling ? "در حال لغو..." : "درخواست لغو سفارش"}
          </button>
        </div>
      )}
    </main>
  );
}