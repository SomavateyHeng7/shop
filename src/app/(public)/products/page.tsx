import { redirect } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getAllCategories, getProducts } from "@/lib/catalog";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const settings = await getSystemSettings();
  if (settings?.catalogPublic === false) redirect("/");

  const resolved = await searchParams;
  const search = resolved.search?.trim() || undefined;
  const category = resolved.category?.trim() || undefined;
  const minPrice = resolved.minPrice ? Number(resolved.minPrice) : undefined;
  const maxPrice = resolved.maxPrice ? Number(resolved.maxPrice) : undefined;

  const [products, categories] = await Promise.all([
    getProducts({ search, categorySlug: category, minPrice, maxPrice }),
    getAllCategories(),
  ]);

  return (
    <StorefrontShell searchValue={resolved.search ?? ""}>
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-accent-600 to-accent-800 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-100">Catalog</p>
        <h1 className="mt-2 font-display text-4xl">Explore Products</h1>
        <p className="mt-3 max-w-2xl text-accent-100">
          Browse by category, filter by price, and check live stock status before you buy.
        </p>
      </section>

      <form className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-sand-200 bg-white p-4 md:grid-cols-5">
        <input
          defaultValue={resolved.search ?? ""}
          name="search"
          placeholder="Search by name"
          className="rounded-lg border border-sand-300 px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={resolved.category ?? ""}
          className="rounded-lg border border-sand-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          name="minPrice"
          type="number"
          min={0}
          defaultValue={resolved.minPrice ?? ""}
          placeholder="Min price"
          className="rounded-lg border border-sand-300 px-3 py-2 text-sm"
        />
        <input
          name="maxPrice"
          type="number"
          min={0}
          defaultValue={resolved.maxPrice ?? ""}
          placeholder="Max price"
          className="rounded-lg border border-sand-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent-700 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-800"
        >
          Apply Filters
        </button>
      </form>

      <ProductGrid products={products} emptyMessage="No products matched your filters." />
    </StorefrontShell>
  );
}
