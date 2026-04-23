import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(product);
}
