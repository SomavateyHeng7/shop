import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  change: z.number().int(),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { change, note } = parsed.data;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true, label: true, product: { select: { stock: true } } },
  });
  if (!variant) return Response.json({ error: "Not found" }, { status: 404 });

  const newVariantStock = variant.stock + change;
  if (newVariantStock < 0) return Response.json({ error: "Stock cannot go below 0" }, { status: 400 });

  const newProductStock = variant.product.stock + change;
  if (newProductStock < 0) return Response.json({ error: "Stock cannot go below 0" }, { status: 400 });

  const updated = await prisma.$transaction(async (tx) => {
    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: newVariantStock },
    });

    await tx.product.update({
      where: { id },
      data: { stock: newProductStock },
    });

    await tx.stockLog.create({
      data: {
        productId: id,
        change,
        note: note ?? `${change > 0 ? "Restock" : "Adjustment"} — ${variant.label}`,
      },
    });

    return updatedVariant;
  });

  return Response.json(updated);
}
