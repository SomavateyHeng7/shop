import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      financeData: true,
    },
    orderBy: { name: "asc" },
  });

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
    const bought = Number(p.financeData?.boughtPrice ?? 0);
    const delivery = Number(p.financeData?.deliveryPrice ?? 0);
    const discount = Number(p.financeData?.discountPct ?? 0);
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
