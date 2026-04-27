import { mockStore } from "@/lib/mock-data";

export async function GET() {
  const products = mockStore.products.findMany({ includeInactive: true });

  const header = [
    "Name",
    "Category",
    "Stock",
    "Low Stock At",
    "Sell Price ($)",
    "Bought Price ($)",
    "Delivery ($)",
    "Discount (%)",
    "Final Price ($)",
    "Profit / Unit ($)",
    "Active",
  ].join(",");

  const rows = products.map((p) => {
    const sell = Number(p.price);
    const bought = 0;
    const delivery = 0;
    const discount = 0;
    const finalPrice = sell * (1 - discount / 100);
    const profit = finalPrice - bought - delivery;

    return [
      `"${p.name.replace(/"/g, '""')}"`,
      p.category?.name ?? "",
      p.stock,
      p.lowStockAt,
      sell.toFixed(2),
      bought.toFixed(2),
      delivery.toFixed(2),
      discount.toFixed(2),
      finalPrice.toFixed(2),
      profit.toFixed(2),
      p.isActive ? "Yes" : "No",
    ].join(",");
  });

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
