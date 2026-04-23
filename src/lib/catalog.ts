import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  imageUrl: true,
  stock: true,
  lowStockAt: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function buildProductWhere(filters: ProductFilters = {}) {
  const { search, categorySlug, minPrice, maxPrice } = filters;

  return {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };
}

export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProducts(filters: ProductFilters = {}) {
  return prisma.product.findMany({
    where: buildProductWhere(filters),
    select: productCardSelect,
    orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    select: productCardSelect,
    orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
    take: limit,
  });
}
