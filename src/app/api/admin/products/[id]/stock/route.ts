import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const stockSchema = z.object({
  stock: z.number().int().min(0),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const current = await prisma.product.findUnique({ where: { id }, select: { stock: true } });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const change = parsed.data.stock - current.stock;

  const [product] = await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { stock: parsed.data.stock } }),
    prisma.stockLog.create({
      data: { productId: id, change, note: parsed.data.note },
    }),
  ]);

  return Response.json(product);
}
