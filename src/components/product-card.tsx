import Image from "next/image";
import Link from "next/link";
import { StockBadge } from "@/components/stock-badge";
import { ProductCardData } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-square bg-zinc-50">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 5H4v14l9.29-9.29a1 1 0 011.42 0L20 15.01V5zM2 3a1 1 0 011-1h18a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm12 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          {product.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {product.category.name}
            </p>
          )}
          <h3 className="mb-2 font-semibold text-zinc-900 line-clamp-2 group-hover:text-zinc-600">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-zinc-900">
              {formatPrice(product.price)}
            </span>
            <StockBadge stock={product.stock} lowStockAt={product.lowStockAt} />
          </div>
        </div>
      </div>
    </Link>
  );
}
