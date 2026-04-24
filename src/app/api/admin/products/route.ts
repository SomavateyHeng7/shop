import { mockStore } from "@/lib/mock-data";
import { NextRequest } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(5),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const products = mockStore.products.findMany({ search, includeInactive: true });
  return Response.json(products);
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

  const { name, description, price, imageUrl, categoryId, stock, lowStockAt } = parsed.data;

  let slug = slugify(name);
  let counter = 1;
  while (mockStore.products.slugExists(slug)) {
    slug = `${slugify(name)}-${counter++}`;
  }

  const product = mockStore.products.create({
    name, slug, description, price,
    imageUrl: imageUrl || null,
    categoryId: categoryId || null,
    stock, lowStockAt,
  });

  return Response.json(product, { status: 201 });
}
