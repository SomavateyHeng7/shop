import { mockStore } from "@/lib/mock-data";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  lowStockAt: number;
  preOrder?: boolean;
  category: { name: string; slug: string } | null;
};

interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getAllCategories() {
  return mockStore.categories.findMany().map((cat) => ({
    ...cat,
    _count: {
      products: mockStore.products.findMany({ activeOnly: true })
        .filter((p) => p.categoryId === cat.id).length,
    },
  }));
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductCardData[]> {
  return mockStore.products.findMany({ ...filters, activeOnly: true });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  return mockStore.products.findMany({ activeOnly: true }).slice(0, limit);
}
