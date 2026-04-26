import Link from "next/link";
import { ProductTable } from "@/components/admin/product-table";
import { ProductFilters } from "@/components/admin/product-filters";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/utils";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  category?: string;
  status?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const search = resolved.search?.trim() || undefined;
  const categoryId = resolved.category?.trim() || undefined;
  const status = resolved.status?.trim() || undefined;

  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
        ...(categoryId ? { categoryId } : {}),
        // active/inactive filter — if no status filter, show all
        ...(status === "inactive" ? { isActive: false } : {}),
        ...(status && status !== "inactive" ? { isActive: true } : {}),
      },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  let products = rawProducts.map((p) => ({ ...p, price: Number(p.price) }));

  // Stock-based status filtering (done in JS — field-to-field comparison)
  if (status === "in_stock") {
    products = products.filter((p) => getStockStatus(p.stock, p.lowStockAt) === "in_stock");
  } else if (status === "low_stock") {
    products = products.filter((p) => getStockStatus(p.stock, p.lowStockAt) === "low_stock");
  } else if (status === "out_of_stock") {
    products = products.filter((p) => getStockStatus(p.stock, p.lowStockAt) === "out_of_stock");
  }

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

      <Suspense>
        <ProductFilters
          categories={categories}
          currentSearch={resolved.search ?? ""}
          currentCategory={resolved.category ?? ""}
          currentStatus={resolved.status ?? ""}
        />
      </Suspense>

      <ProductTable products={products} />
    </div>
  );
}
