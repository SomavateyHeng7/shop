import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.order.delete({ where: { id } }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    ),
    ...order.items.map((item) =>
      prisma.stockLog.create({
        data: {
          productId: item.productId,
          change: item.quantity,
          note: `Order ${order.orderId} deleted`,
        },
      })
    ),
  ]);

  return new Response(null, { status: 204 });
}
