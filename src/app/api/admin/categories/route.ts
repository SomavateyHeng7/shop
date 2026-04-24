import { mockStore } from "@/lib/mock-data";
import { NextRequest } from "next/server";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const categories = mockStore.categories.findMany().map((cat) => ({
    ...cat,
    _count: {
      products: mockStore.products.findMany({ includeInactive: true })
        .filter((p) => p.categoryId === cat.id).length,
    },
  }));
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  if (!mockStore.system.getSettings().adminWritesEnabled) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const category = mockStore.categories.create(parsed.data.name);
  return Response.json(category, { status: 201 });
}
