import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { StockBadge } from "@/components/stock-badge";
import { ProductVariantSelector } from "@/components/product-variant-selector";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MESSENGER_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ slug }, { id: slug }],
    },
    include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    notFound();
  }

  return (
    <StorefrontShell>
      <div className="mb-4">
        <Link href="/products" className="text-sm font-medium text-accent-700 hover:text-accent-800">
          Back to products
        </Link>
      </div>

      <article className="grid grid-cols-1 gap-8 rounded-3xl border border-sand-200 bg-white p-6 lg:grid-cols-2 lg:p-8">
        <div>
          <ProductVariantSelector
            variants={product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              imageUrl: v.imageUrl,
              stock: v.stock,
            }))}
            defaultImage={product.imageUrl}
            productName={product.name}
            productStock={product.stock}
          />
        </div>

        <div>
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl text-ink-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-semibold text-ink-900">{formatPrice(Number(product.price))}</p>

          <div className="mt-4">
            <StockBadge stock={product.stock} lowStockAt={product.lowStockAt} preOrder={product.preOrder} />
          </div>

          <p className="mt-6 whitespace-pre-wrap text-ink-700">
            {product.description || "No product description available yet."}
          </p>

          {/* Order via Messenger */}
          <div className="mt-8 rounded-2xl border border-sand-200 bg-sand-50 p-5">
            <p className="text-sm font-semibold text-ink-900">Interested in this product?</p>
            <p className="mt-1 text-sm text-ink-600">
              We&apos;re not yet set up for online checkout — just send us a message on Messenger and we&apos;ll sort it out for you.
            </p>
            <a
              href={`${MESSENGER_URL}?ref=${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2.5 rounded-xl bg-[#0084FF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#006ed6] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.842 1.32 5.388 3.404 7.103v3.388l3.107-1.696A10.822 10.822 0 0 0 12 20.518c5.523 0 10-4.145 10-9.259S17.523 2 12 2Zm1.009 12.456-2.548-2.705-4.976 2.705 5.475-5.816 2.612 2.705 4.911-2.705-5.474 5.816Z" />
              </svg>
              Message us on Messenger
            </a>
          </div>
        </div>
      </article>
    </StorefrontShell>
  );
}
