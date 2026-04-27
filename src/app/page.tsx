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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#b8b0e8] to-[#d9a8c8] p-8 text-white sm:p-12">
        <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[#e8c4dc]/40 blur-3xl" />
        <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-[#c5bae8]/30 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">ST-Shop Product Catalog</p>
          <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">
            Modern catalog browsing with live stock signals.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Browse products and pricing instantly. Admins can manage categories, products, and
            inventory through a protected dashboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-white/20 backdrop-blur-sm border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b7fb8]">
              Featured
            </p>
            <h2 className="mt-2 font-display text-3xl text-[#4a3860]">Latest inventory highlights</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-[#9b7fb8] hover:text-[#7a5fa0]">
            View all products
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>
    </StorefrontShell>
  );
}