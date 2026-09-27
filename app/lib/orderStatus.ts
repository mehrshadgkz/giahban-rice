// Path: /app/lib
// File: orderStatus.ts
// Version: 1.0.0
//
// Central place mapping raw database status values to what customers
// see. The four top-level groups (جاری/تحویل‌شده/مرجوع‌شده/لغو‌شده)
// are derived here from the more specific underlying status — so
// "جاری" isn't its own database value, it's just "any of these four
// specific sub-statuses."

export type OrderStatus =
  | "awaiting_details"
  | "awaiting_payment"
  | "confirming"
  | "shipping"
  | "delivered"
  | "returned"
  | "cancelled";

export type OrderGroup = "current" | "delivered" | "returned" | "cancelled";

const currentStatuses: OrderStatus[] = [
  "awaiting_details",
  "awaiting_payment",
  "confirming",
  "shipping",
];

export function getOrderGroup(status: OrderStatus): OrderGroup {
  if (status === "delivered") return "delivered";
  if (status === "returned") return "returned";
  if (status === "cancelled") return "cancelled";
  return "current";
}

export const statusLabels: Record<OrderStatus, string> = {
  awaiting_details: "منتظر تکمیل مشخصات",
  awaiting_payment: "منتظر پرداخت",
  confirming: "در حال تایید از طرف فروشگاه",
  shipping: "در حال ارسال به مقصد",
  delivered: "تحویل شده",
  returned: "مرجوع شده",
  cancelled: "لغو شده",
};

export const groupLabels: Record<OrderGroup, string> = {
  current: "جاری",
  delivered: "تحویل شده",
  returned: "مرجوع شده",
  cancelled: "لغو شده",
};

// A customer can only request cancellation while the order hasn't
// started shipping yet — matches your earlier decision that once
// you've marked it "در حال ارسال", only a return applies afterward.
export function canCustomerCancel(status: OrderStatus): boolean {
  return currentStatuses.includes(status) && status !== "shipping";
}