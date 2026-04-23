import Link from "next/link";
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

  const products = await prisma.product.findMany({
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
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Add Product
        </Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4">
        <input
          name="search"
          defaultValue={resolved.search ?? ""}
          placeholder="Search products"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </form>

      <ProductTable products={products} />
    </div>
  );
}
