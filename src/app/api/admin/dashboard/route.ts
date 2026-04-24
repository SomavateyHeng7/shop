import { mockStore } from "@/lib/mock-data";

export async function GET() {
  const products = mockStore.products.findMany({ activeOnly: true });
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockAt).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalCategories = mockStore.categories.count();

  return Response.json({ totalProducts, totalStockValue, lowStockCount, outOfStockCount, totalCategories });
}
