import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ errors: parsed.error.flatten() }, { status: 400 });

  const variant = await prisma.productVariant.create({
    data: {
      productId: id,
      label: parsed.data.label,
      imageUrl: parsed.data.imageUrl ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  return Response.json(variant, { status: 201 });
}
