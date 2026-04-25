import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1),
  boughtPrice: z.number().min(0),
  deliveryPrice: z.number().min(0),
  sellPrice: z.number().min(0),
  discountPct: z.number().min(0).max(100),
});

const createSchema = z.object({
  orderId: z.string().min(1),
  note: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { orderId: parsed.data.orderId },
  });
  if (existing) {
    return Response.json({ error: "Order ID already exists" }, { status: 409 });
  }

  const { orderId, note, items } = parsed.data;

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        orderId,
        note: note ?? null,
        items: { create: items },
      },
      include: { items: true },
    }),
    ...items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    ),
    ...items.map((item) =>
      prisma.stockLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          note: `Order ${orderId}`,
        },
      })
    ),
  ]);

  return Response.json(order, { status: 201 });
}
