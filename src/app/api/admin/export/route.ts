import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const header = "ID,Name,Category,Price,Stock,Low Stock At,Active,Created At\n";
  const rows = products
    .map((p) =>
      [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category?.name ?? "",
        p.price,
        p.stock,
        p.lowStockAt,
        p.isActive,
        p.createdAt.toISOString(),
      ].join(",")
    )
    .join("\n");

  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
