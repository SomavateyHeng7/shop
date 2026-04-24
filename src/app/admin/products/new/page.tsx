import { ProductForm } from "@/components/admin/product-form";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = mockStore.categories.findMany().map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Add Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
