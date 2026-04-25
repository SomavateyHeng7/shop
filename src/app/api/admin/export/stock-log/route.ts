import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lt: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {};

  const logs = await prisma.stockLog.findMany({
    where,
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const header = ["Date", "Product", "Type", "Change", "Unit Cost ($)", "Note"].join(",");

  const rows = logs.map((log) => {
    const type = log.note?.startsWith("Order")
      ? "Sale"
      : log.change > 0
        ? "Restock"
        : "Adjustment";

    return [
      log.createdAt.toISOString().split("T")[0],
      `"${log.product.name.replace(/"/g, '""')}"`,
      type,
      log.change > 0 ? `+${log.change}` : String(log.change),
      log.unitCost !== null ? Number(log.unitCost).toFixed(2) : "",
      log.note ? `"${log.note.replace(/"/g, '""')}"` : "",
    ].join(",");
  });

  const suffix = from && to ? `${from}_${to}` : from ? `from-${from}` : to ? `to-${to}` : "all";

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="stock-log-${suffix}.csv"`,
    },
  });
}
