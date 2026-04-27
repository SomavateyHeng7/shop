import { mockStore } from "@/lib/mock-data";
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
  const product = mockStore.products.findById(id);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mockStore.system.getSettings().adminWritesEnabled) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageUrl, categoryId, ...rest } = parsed.data;
  const product = mockStore.products.update(id, {
    ...rest,
    ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
    ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
  });

  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mockStore.system.getSettings().adminWritesEnabled) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  mockStore.products.update(id, { isActive: false });
  return Response.json({ success: true });
}
