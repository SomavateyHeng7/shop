import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { StockBadge } from "@/components/stock-badge";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const settings = await getSystemSettings();
  if (settings?.catalogPublic === false) redirect("/");

  const { slug } = await params;
  const raw = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }], isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });
  const product = raw ? { ...raw, price: Number(raw.price) } : null;

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
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sand-500">No Image</div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl text-ink-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-semibold text-ink-900">{formatPrice(product.price)}</p>

          <div className="mt-4">
            <StockBadge stock={product.stock} lowStockAt={product.lowStockAt} />
          </div>

          <p className="mt-6 whitespace-pre-wrap text-ink-700">
            {product.description || "No product description available yet."}
          </p>
        </div>
      </article>
    </StorefrontShell>
  );
}
