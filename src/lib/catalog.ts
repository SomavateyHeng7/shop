import { prisma } from "@/lib/prisma";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  lowStockAt: number;
  category: { name: string; slug: string } | null;
};

interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });
  return categories;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductCardData[]> {
  const { search, categorySlug, minPrice, maxPrice } = filters;

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

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));
}
