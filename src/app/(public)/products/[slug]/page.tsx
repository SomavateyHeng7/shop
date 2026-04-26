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
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:text-accent-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
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

          <div className="mt-8 rounded-2xl border border-sand-200 bg-sand-50 p-5">
            <p className="text-sm font-semibold text-ink-900">Interested? Contact us to order</p>
            <p className="mt-0.5 text-xs text-ink-500">We&apos;ll get back to you as soon as possible.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {settings?.messengerUrl ? (
                <a
                  href={settings.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.84 1.26 5.387 3.27 7.14V22l2.98-1.638a10.3 10.3 0 002.75.377c5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.006 12.466l-2.548-2.718-4.97 2.718 5.473-5.81 2.609 2.718 4.91-2.718-5.474 5.81z" />
                  </svg>
                  Messenger
                </a>
              ) : null}
              {settings?.telegramUrl ? (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.01c-.12.57-.46.71-.93.44l-2.57-1.89-1.24 1.19c-.14.14-.25.25-.51.25l.18-2.6 4.74-4.28c.21-.18-.04-.28-.32-.1L7.54 14.6l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.65.6z" />
                  </svg>
                  Telegram
                </a>
              ) : null}
              {!settings?.messengerUrl && !settings?.telegramUrl && (
                <p className="text-sm text-ink-400">Contact links not set up yet.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </StorefrontShell>
  );
}
