import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ errors: parsed.error.flatten() }, { status: 400 });

  const initialStock = parsed.data.stock ?? 0;

  const variant = await prisma.$transaction(async (tx) => {
    const created = await tx.productVariant.create({
      data: {
        productId: id,
        label: parsed.data.label,
        imageUrl: parsed.data.imageUrl ?? null,
        stock: initialStock,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });

    if (initialStock > 0) {
      await tx.product.update({
        where: { id },
        data: { stock: { increment: initialStock } },
      });
      await tx.stockLog.create({
        data: {
          productId: id,
          change: initialStock,
          note: `Initial stock — ${parsed.data.label}`,
        },
      });
    }

    return created;
  });

  return Response.json(variant, { status: 201 });
}
