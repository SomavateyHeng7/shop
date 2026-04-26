import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
  if (settings?.catalogPublic === false) {
    return Response.json([], { status: 200 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
      ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(products.map((p) => ({ ...p, price: Number(p.price) })));
}
