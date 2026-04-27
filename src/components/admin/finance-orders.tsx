"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductRow, OrderRow, OrderItemRow } from "./finance-manager";

interface Props {
  orders: OrderRow[];   // all orders — month filtering is handled internally
  products: ProductRow[];
}

interface DraftItem {
  productId: string;
  productName: string;
  quantity: string;
  boughtPrice: string;
  deliveryPrice: string;
  sellPrice: string;
  discountPct: string;
}

function emptyItem(): DraftItem {
  return {
    productId: "",
    productName: "",
    quantity: "1",
    boughtPrice: "0",
    deliveryPrice: "0",
    sellPrice: "0",
    discountPct: "0",
  };
}

function orderTotals(items: OrderItemRow[]) {
  let revenue = 0;
  let cost = 0;
  for (const item of items) {
    const disc = Number(item.sellPrice) * (1 - Number(item.discountPct) / 100);
    revenue += disc * item.quantity;
    cost += (Number(item.boughtPrice) + Number(item.deliveryPrice)) * item.quantity;
  }
  return { revenue, cost, profit: revenue - cost };
}

function todayMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function nextOrderId(orders: OrderRow[]): string {
  const nums = orders
    .map((o) => o.orderId.match(/^ORD-(\d+)$/i))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `ORD-${String(next).padStart(3, "0")}`;
}

export function FinanceOrders({ orders, products }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(todayMonth);

  const [addOpen, setAddOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<OrderRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Derive filtered orders from internal month state
  const filteredOrders = orders.filter((o) => o.createdAt.slice(0, 7) === selectedMonth);

  // Month label for headings
  const monthLabel = new Date(
    Number(selectedMonth.slice(0, 4)),
    Number(selectedMonth.slice(5, 7)) - 1,
    1
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Stats for the selected month
  const allTotals = filteredOrders.reduce(
    (acc, o) => {
      const t = orderTotals(o.items);
      return { revenue: acc.revenue + t.revenue, cost: acc.cost + t.cost, profit: acc.profit + t.profit };
    },
    { revenue: 0, cost: 0, profit: 0 }
  );

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: product.id,
              productName: product.name,
              boughtPrice: product.financeData?.boughtPrice ?? "0",
              deliveryPrice: product.financeData?.deliveryPrice ?? "0",
              sellPrice: product.price,
              discountPct: product.financeData?.discountPct ?? "0",
            }
          : item
      )
    );
    setFormErrors((prev) => ({ ...prev, [`item_${index}_product`]: "" }));
  }

  function updateItem<K extends keyof DraftItem>(index: number, key: K, value: DraftItem[K]) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!orderId.trim()) errs.orderId = "Order ID is required";
    if (items.length === 0) errs.items = "Add at least one item";
    items.forEach((item, i) => {
      if (!item.productId) errs[`item_${i}_product`] = "Select a product";
      if (!item.quantity || Number(item.quantity) < 1) errs[`item_${i}_qty`] = "Min 1";
      if (isNaN(Number(item.sellPrice)) || Number(item.sellPrice) < 0)
        errs[`item_${i}_sell`] = "Must be ≥ 0";
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openAdd() {
    setOrderId(nextOrderId(orders));
    setNote("");
    setItems([emptyItem()]);
    setFormErrors({});
    setAddOpen(true);
  }

  function createOrder() {
    if (!validateForm()) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/finance/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          note: note.trim() || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity),
            boughtPrice: Number(item.boughtPrice),
            deliveryPrice: Number(item.deliveryPrice),
            sellPrice: Number(item.sellPrice),
            discountPct: Number(item.discountPct),
          })),
        }),
      });
      if (res.status === 409) {
        setFormErrors((prev) => ({ ...prev, orderId: "Order ID already exists" }));
        return;
      }
      if (!res.ok) {
        showToast({ title: "Failed to create order", variant: "error" });
        return;
      }
      showToast({ title: "Order added", variant: "success" });
      setAddOpen(false);
      router.refresh();
    });
  }

  function deleteOrder(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/finance/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast({ title: "Failed to delete order", variant: "error" });
        return;
      }
      showToast({ title: "Order deleted", variant: "success" });
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Summary stats for selected month */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={`Orders · ${monthLabel}`} value={String(filteredOrders.length)} />
        <StatCard label="Revenue" value={formatPrice(allTotals.revenue)} />
        <StatCard label="Cost" value={formatPrice(allTotals.cost)} />
        <StatCard
          label="Profit"
          value={formatPrice(allTotals.profit)}
          highlight={filteredOrders.length === 0 ? undefined : allTotals.profit >= 0 ? "green" : "red"}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Orders · {monthLabel}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {orders.length} orders total across all months
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            title="Filter by month"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-accent-600"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/admin/finance/export?month=${selectedMonth}`, "_blank")}
          >
            Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            + New Order
          </Button>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No orders for {monthLabel}. Switch month or add a new order.
          </div>
        ) : (
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                {[
                  { label: "Order ID", align: "left" },
                  { label: "Date", align: "left" },
                  { label: "Items", align: "left" },
                  { label: "Revenue", align: "right" },
                  { label: "Cost", align: "right" },
                  { label: "Profit", align: "right" },
                  { label: "Actions", align: "right" },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const t = orderTotals(order.items);
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.orderId}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.note && (
                        <span className="ml-2 text-xs text-slate-400" title={order.note}>
                          · {order.note.length > 24 ? order.note.slice(0, 24) + "…" : order.note}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(t.revenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(t.cost)}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold",
                        t.profit >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {formatPrice(t.profit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReceiptOrder(order)}
                        >
                          Receipt
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteId(order.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Order dialog */}
      <Modal
        open={addOpen}
        title="New Order"
        description="Record a new order and track its revenue, cost, and profit."
        onClose={() => setAddOpen(false)}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createOrder} disabled={pending}>
              {pending ? "Adding…" : "Add Order"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Order ID <span className="text-red-500">*</span>
              </label>
              <Input
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setFormErrors((prev) => ({ ...prev, orderId: "" }));
                }}
                placeholder="e.g. ORD-001"
              />
              {formErrors.orderId && (
                <p className="mt-1 text-xs text-red-600">{formErrors.orderId}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Note</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                Order Items <span className="text-red-500">*</span>
              </p>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setItems((prev) => [...prev, emptyItem()])}
              >
                + Add Item
              </Button>
            </div>
            {formErrors.items && (
              <p className="mb-2 text-xs text-red-600">{formErrors.items}</p>
            )}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const discountedSell =
                  Number(item.sellPrice) * (1 - Number(item.discountPct) / 100);
                const profitPerUnit =
                  discountedSell - Number(item.boughtPrice) - Number(item.deliveryPrice);
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Item {idx + 1}
                      </p>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Product *
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => selectProduct(idx, e.target.value)}
                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-accent-600"
                        >
                          <option value="">Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {formErrors[`item_${idx}_product`] && (
                          <p className="mt-0.5 text-xs text-red-600">
                            {formErrors[`item_${idx}_product`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="h-9"
                        />
                        {formErrors[`item_${idx}_qty`] && (
                          <p className="mt-0.5 text-xs text-red-600">
                            {formErrors[`item_${idx}_qty`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Sell Price ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.sellPrice}
                          onChange={(e) => updateItem(idx, "sellPrice", e.target.value)}
                          className="h-9"
                        />
                        {formErrors[`item_${idx}_sell`] && (
                          <p className="mt-0.5 text-xs text-red-600">
                            {formErrors[`item_${idx}_sell`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discountPct}
                          onChange={(e) => updateItem(idx, "discountPct", e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {item.productId && (
                      <div className="mt-3 flex gap-4 rounded-md bg-white px-3 py-2 text-xs text-slate-600 border border-slate-200">
                        <span>
                          Disc. price:{" "}
                          <strong>{formatPrice(discountedSell)}</strong>
                        </span>
                        <span>
                          Profit/unit:{" "}
                          <strong
                            className={
                              profitPerUnit >= 0 ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            {formatPrice(profitPerUnit)}
                          </strong>
                        </span>
                        <span>
                          Total profit:{" "}
                          <strong
                            className={
                              profitPerUnit * Number(item.quantity) >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {formatPrice(profitPerUnit * Number(item.quantity))}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Receipt dialog */}
      <Modal
        open={!!receiptOrder}
        title={`Receipt — ${receiptOrder?.orderId}`}
        description={
          receiptOrder
            ? [
                new Date(receiptOrder.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                receiptOrder.note,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        onClose={() => setReceiptOrder(null)}
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        footer={
          <Button variant="outline" onClick={() => setReceiptOrder(null)}>
            Close
          </Button>
        }
      >
        {receiptOrder && <Receipt order={receiptOrder} />}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete order?"
        description="This will permanently remove the order record and all its items."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteOrder(deleteId);
        }}
      />
    </div>
  );
}

function Receipt({ order }: { order: OrderRow }) {
  const total = order.items.reduce((sum, item) => {
    const finalPrice = Number(item.sellPrice) * (1 - Number(item.discountPct) / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {[
              { label: "Product", align: "left" },
              { label: "Unit Price", align: "right" },
              { label: "Discount", align: "right" },
              { label: "Final Price", align: "right" },
              { label: "Qty", align: "right" },
              { label: "Subtotal", align: "right" },
            ].map((col) => (
              <th
                key={col.label}
                className={cn(
                  "px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.items.map((item) => {
            const finalPrice = Number(item.sellPrice) * (1 - Number(item.discountPct) / 100);
            const subtotal = finalPrice * item.quantity;
            return (
              <tr key={item.id}>
                <td className="px-3 py-2.5 font-medium text-slate-900">{item.productName}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">{formatPrice(item.sellPrice)}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">
                  {Number(item.discountPct) > 0 ? `${item.discountPct}%` : "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">{formatPrice(finalPrice)}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">{item.quantity}</td>
                <td className="px-3 py-2.5 text-right font-medium text-slate-900">{formatPrice(subtotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t-2 border-slate-300 bg-slate-50">
          <tr>
            <td colSpan={5} className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total
            </td>
            <td className="px-3 py-2.5 text-right font-bold text-slate-900">
              {formatPrice(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold",
          highlight === "green"
            ? "text-emerald-600"
            : highlight === "red"
              ? "text-red-600"
              : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}
