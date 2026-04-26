import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getFeaturedProducts } from "@/lib/catalog";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSystemSettings();
  if (settings?.maintenanceMode) redirect("/maintenance");

  const featuredProducts = await getFeaturedProducts(8);

  return (
    <StorefrontShell>
      <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-8 text-white sm:p-12">
        <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-sand-300/20 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-accent-100">PIC Product Catalog</p>
          <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">
            Modern catalog browsing with live stock signals.
          </h1>
          <p className="mt-5 max-w-xl text-base text-sand-100 sm:text-lg">
            Browse products and pricing instantly. Admins can manage categories, products, and
            inventory through a protected dashboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-400"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              Featured
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink-900">Latest inventory highlights</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-accent-700 hover:text-accent-800">
            View all products
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>
    </StorefrontShell>
  );
}
