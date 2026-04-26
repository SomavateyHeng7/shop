import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  sellPrice: z.number().min(0),
  boughtPrice: z.number().min(0),
  deliveryPrice: z.number().min(0),
  discountPct: z.number().min(0).max(100),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sellPrice, ...financeFields } = parsed.data;

  const [financeData] = await prisma.$transaction([
    prisma.productFinance.upsert({
      where: { productId: id },
      create: { productId: id, ...financeFields },
      update: financeFields,
    }),
    prisma.product.update({
      where: { id },
      data: { price: sellPrice },
    }),
  ]);

  return Response.json(financeData);
}
