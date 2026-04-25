import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  label: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { variantId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ errors: parsed.error.flatten() }, { status: 400 });

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: parsed.data,
  });

  return Response.json(variant);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;

  await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true, label: true },
    });
    if (!variant) return;

    await tx.productVariant.delete({ where: { id: variantId } });

    if (variant.stock > 0) {
      await tx.product.update({
        where: { id },
        data: { stock: { decrement: variant.stock } },
      });
      await tx.stockLog.create({
        data: {
          productId: id,
          change: -variant.stock,
          note: `Variant removed — ${variant.label}`,
        },
      });
    }
  });

  return new Response(null, { status: 204 });
}
