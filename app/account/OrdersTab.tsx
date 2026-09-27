// Path: /app/account
// File: OrdersTab.tsx
// Version: 1.0.0
//
// Order list with the 4 group tabs (جاری/تحویل‌شده/مرجوع‌شده/لغو‌شده).
// Clicking an order opens its detail view (built next) — for now this
// links to /account/orders/[id], a separate page.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrderGroup, groupLabels, statusLabels, OrderStatus } from "../lib/orderStatus";

type OrderListItem = {
  id: string;
  order_number: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  group: OrderGroup;
};

const groupOrder: OrderGroup[] = ["current", "delivered", "returned", "cancelled"];

function formatToman(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [activeGroup, setActiveGroup] = useState<OrderGroup>("current");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setIsLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((o) => o.group === activeGroup);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">سفارش‌ها</h2>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {groupOrder.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeGroup === group
                ? "border-green-800 text-green-800"
                : "border-transparent text-gray-500"
            }`}
          >
            {groupLabels[group]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-sm">سفارشی در این بخش وجود ندارد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">شماره سفارش</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاریخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">مبلغ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">#{order.order_number}</td>
                  <td className="px-4 py-3">
                    {new Date(order.created_at).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-4 py-3">{statusLabels[order.status]}</td>
                  <td className="px-4 py-3">{formatToman(order.total_price)} تومان</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-green-800 underline"
                    >
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}