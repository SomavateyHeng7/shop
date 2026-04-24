import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = mockStore.products.findById(id);
  if (!product) notFound();

  const categories = mockStore.categories.findMany().map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Edit Product</h1>
      <ProductForm mode="edit" categories={categories} product={product} />
    </div>
  );
}
