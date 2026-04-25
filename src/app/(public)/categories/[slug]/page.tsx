import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    notFound();
  }

  const products = await getProducts({ categorySlug: slug });

  return (
    <StorefrontShell>
      <section className="mb-8 rounded-3xl bg-accent-700 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-100">Category</p>
        <h1 className="mt-2 font-display text-4xl">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-accent-100">
          Showing products currently available in this category.
        </p>
      </section>

      <ProductGrid
        products={products}
        emptyMessage={`No active products are available in ${category.name}.`}
      />
    </StorefrontShell>
  );
}
