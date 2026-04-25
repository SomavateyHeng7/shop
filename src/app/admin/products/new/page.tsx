import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const rawCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const categories = rawCategories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Add Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
