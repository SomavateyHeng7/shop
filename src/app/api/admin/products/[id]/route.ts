import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().nullable().optional(),
  categoryId: z.string().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  lowStockAt: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  preOrder: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, stockLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageUrl, categoryId, ...rest } = parsed.data;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
    },
  });

  return Response.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return Response.json({ success: true });
}
