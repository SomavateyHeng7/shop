import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rawProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true, slug: true } },
      stockLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!rawProduct) notFound();
  const product = { ...rawProduct, price: Number(rawProduct.price) };

  const rawCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const categories = rawCategories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Edit Product</h1>
      <ProductForm mode="edit" categories={categories} product={product} />
    </div>
  );
}
