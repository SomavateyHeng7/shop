import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  change: z.number().int(),
  note: z.string().optional(),
  unitCost: z.number().min(0).optional(), // cost per unit for this restock batch
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { change, note, unitCost } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { stock: true, financeData: { select: { boughtPrice: true } } },
  });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const newStock = product.stock + change;
  if (newStock < 0) {
    return Response.json({ error: "Stock cannot go below 0" }, { status: 400 });
  }

  // Weighted average cost — only recalculate when restocking with a known cost
  const ops: Parameters<typeof prisma.$transaction>[0] = [
    prisma.product.update({ where: { id }, data: { stock: newStock } }),
    prisma.stockLog.create({
      data: { productId: id, change, note: note ?? null, unitCost: unitCost ?? null },
    }),
  ];

  if (change > 0 && unitCost !== undefined) {
    const currentStock = product.stock;
    const currentAvg = Number(product.financeData?.boughtPrice ?? 0);
    // (existing units × old avg) + (new units × new cost) / total units
    const weightedAvg =
      currentStock === 0
        ? unitCost
        : (currentStock * currentAvg + change * unitCost) / newStock;

    ops.push(
      prisma.productFinance.upsert({
        where: { productId: id },
        create: { productId: id, boughtPrice: weightedAvg },
        update: { boughtPrice: weightedAvg },
      })
    );
  }

  const [updated] = await prisma.$transaction(ops);
  return Response.json(updated);
}
