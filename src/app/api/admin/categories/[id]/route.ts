import { mockStore } from "@/lib/mock-data";
import { NextRequest } from "next/server";
import { z } from "zod";

const updateSchema = z.object({ name: z.string().min(1) });

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mockStore.system.getSettings().adminWritesEnabled) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  mockStore.categories.delete(id);
  return Response.json({ success: true });
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
  const category = mockStore.categories.update(id, parsed.data.name);
  if (!category) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(category);
}
