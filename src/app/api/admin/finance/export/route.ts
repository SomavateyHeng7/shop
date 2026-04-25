import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month"); // "YYYY-MM"

  let where = {};
  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where = { createdAt: { gte: start, lt: end } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "Order ID",
    "Date",
    "Product",
    "Qty",
    "Bought Price",
    "Delivery Price",
    "Sell Price",
    "Discount %",
    "Discounted Price",
    "Revenue",
    "Cost",
    "Profit",
  ].join(",");

  const rows: string[] = [header];
  let sumRevenue = 0;
  let sumCost = 0;
  let sumProfit = 0;

  for (const order of orders) {
    for (const item of order.items) {
      const sell = Number(item.sellPrice);
      const disc = Number(item.discountPct);
      const bought = Number(item.boughtPrice);
      const delivery = Number(item.deliveryPrice);
      const qty = item.quantity;

      const discountedPrice = sell * (1 - disc / 100);
      const revenue = discountedPrice * qty;
      const cost = (bought + delivery) * qty;
      const profit = revenue - cost;

      sumRevenue += revenue;
      sumCost += cost;
      sumProfit += profit;

      rows.push(
        [
          order.orderId,
          order.createdAt.toISOString().split("T")[0],
          `"${item.productName.replace(/"/g, '""')}"`,
          qty,
          bought.toFixed(2),
          delivery.toFixed(2),
          sell.toFixed(2),
          disc.toFixed(2),
          discountedPrice.toFixed(2),
          revenue.toFixed(2),
          cost.toFixed(2),
          profit.toFixed(2),
        ].join(",")
      );
    }
  }

  rows.push(
    [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      sumRevenue.toFixed(2),
      sumCost.toFixed(2),
      sumProfit.toFixed(2),
    ].join(",")
  );

  const filename = month ? `finance-${month}.csv` : "finance-all.csv";

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
