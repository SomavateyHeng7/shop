import { mockStore } from "@/lib/mock-data";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  change: z.number().int(),
  note: z.string().optional(),
  unitCost: z.number().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mockStore.system.getSettings().adminWritesEnabled) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { change, note } = parsed.data;

  const current = mockStore.products.findById(id);
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const newStock = current.stock + change;
  if (newStock < 0) {
    return Response.json({ error: "Stock cannot go below 0" }, { status: 400 });
  }

  const updated = mockStore.products.update(id, { stock: newStock });
  mockStore.stockLogs.create(id, change, note);

  return Response.json(updated);
}
