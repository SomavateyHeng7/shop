import { AddProductDialog } from "@/components/admin/add-product-dialog";
import { ProductTable } from "@/components/admin/product-table";
import { productCardSelect } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const search = resolved.search?.trim();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      select: productCardSelect,
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
        <AddProductDialog categories={categories} />
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4">
        <input
          name="search"
          defaultValue={resolved.search ?? ""}
          placeholder="Search products"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </form>

      <ProductTable products={products.map((p) => ({ ...p, price: p.price.toNumber() }))} />
    </div>
  );
}
