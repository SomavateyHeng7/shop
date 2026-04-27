import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  imageUrl: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(5),
  preOrder: z.boolean().default(false),
});

async function isWritesEnabled() {
  const s = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
  return s?.adminWritesEnabled ?? true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;

  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(products.map((p) => ({ ...p, price: Number(p.price) })));
}

export async function POST(request: NextRequest) {
  if (!(await isWritesEnabled())) {
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
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugify(name)}-${counter++}`;
  }

  const product = await prisma.product.create({
    data: {
      name, slug, description, price,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
      stock, lowStockAt,
    },
    include: { category: { select: { name: true, slug: true } } },
  });

  return Response.json({ ...product, price: Number(product.price) }, { status: 201 });
}
