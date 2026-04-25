import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  const s = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
  if (!(s?.adminWritesEnabled ?? true)) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: parsed.data.name, slug: slugify(parsed.data.name) },
  });
  return Response.json(category, { status: 201 });
}
