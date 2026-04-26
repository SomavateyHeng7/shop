import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { financeData: true },
    orderBy: { name: "asc" },
  });

  const header = [
    "Product",
    "Stock",
    "Cost / Unit ($)",
    "Delivery Cost ($)",
    "Total Cost / Unit ($)",
    "Sell Price ($)",
    "Discount (%)",
    "Final Price ($)",
    "Profit / Unit ($)",
    "Margin (%)",
    "Total Invested ($)",
    "Potential Revenue ($)",
    "Potential Profit ($)",
  ].join(",");

  let sumInvested = 0;
  let sumRevenue = 0;
  let sumProfit = 0;

  const rows = products.map((p) => {
    const bought = Number(p.financeData?.boughtPrice ?? 0);
    const delivery = Number(p.financeData?.deliveryPrice ?? 0);
    const sell = Number(p.price);
    const discountPct = Number(p.financeData?.discountPct ?? 0);
    const totalCost = bought + delivery;
    const finalPrice = sell * (1 - discountPct / 100);
    const profitPerUnit = finalPrice - totalCost;
    const margin = finalPrice > 0 ? (profitPerUnit / finalPrice) * 100 : 0;
    const invested = totalCost * p.stock;
    const revenue = finalPrice * p.stock;
    const profit = profitPerUnit * p.stock;

    sumInvested += invested;
    sumRevenue += revenue;
    sumProfit += profit;

    return [
      `"${p.name.replace(/"/g, '""')}"`,
      p.stock,
      bought.toFixed(2),
      delivery.toFixed(2),
      totalCost.toFixed(2),
      sell.toFixed(2),
      discountPct.toFixed(2),
      finalPrice.toFixed(2),
      profitPerUnit.toFixed(2),
      margin.toFixed(2),
      invested.toFixed(2),
      revenue.toFixed(2),
      profit.toFixed(2),
    ].join(",");
  });

  const totalRow = [
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    sumInvested.toFixed(2),
    sumRevenue.toFixed(2),
    sumProfit.toFixed(2),
  ].join(",");

  const csv = [header, ...rows, totalRow].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="finance-${date}.csv"`,
    },
  });
}
