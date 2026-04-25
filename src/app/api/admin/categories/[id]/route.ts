import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({ name: z.string().min(1) });

async function isWritesEnabled() {
  const s = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
  return s?.adminWritesEnabled ?? true;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isWritesEnabled())) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return Response.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isWritesEnabled())) {
    return Response.json({ error: "Admin writes are currently disabled by superadmin." }, { status: 423 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name, slug: slugify(parsed.data.name) },
    });
    return Response.json(category);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
