import { prisma } from "@/lib/prisma";

export async function GET() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { stock: true, price: true, lowStockAt: true },
    }),
    prisma.category.count(),
  ]);

  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.price) * p.stock,
    0
  );
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockAt
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return Response.json({
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    totalCategories: categories,
  });
}
