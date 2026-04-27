import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

<<<<<<< HEAD
  const header = "ID,Name,Category,Price,Stock,Low Stock At,Active,Created At\n";
  const rows = products
    .map((p) =>
      [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category?.name ?? "",
        Number(p.price),
        p.stock,
        p.lowStockAt,
        p.isActive,
        p.createdAt.toISOString(),
      ].join(",")
    )
    .join("\n");
=======
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
>>>>>>> feat/finance

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
