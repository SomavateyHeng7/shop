"use client";

import { useState } from "react";

interface Variant {
  id: string;
  label: string;
  imageUrl: string | null;
  stock: number;
}

interface Props {
  variants: Variant[];
  defaultImage: string | null;
  productName: string;
  productStock: number;
}

export function ProductVariantSelector({ variants, defaultImage, productName, productStock }: Props) {
  const [selected, setSelected] = useState<Variant | null>(null);

  const hasVariants = variants.length > 0;
  const displayImage = selected?.imageUrl ?? defaultImage;
  const displayLabel = selected?.label ?? null;

  // When variants exist: use selected variant's stock, or total if none selected
  const effectiveStock = hasVariants
    ? (selected ? selected.stock : productStock)
    : productStock;

  const isOutOfStock = effectiveStock === 0;

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand-100">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={displayLabel ? `${productName} — ${displayLabel}` : productName}
            className="h-full w-full object-cover transition-opacity duration-200"
            style={isOutOfStock ? { filter: "grayscale(100%)", opacity: 0.5 } : undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sand-500">No Image</div>
        )}

        {/* Out of stock overlay on main image */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30">
            <span
              style={{ transform: "rotate(-20deg)" }}
              className="rounded-md border-2 border-red-500 bg-white/80 px-4 py-1.5 text-base font-bold uppercase tracking-widest text-red-500"
            >
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Variant swatches */}
      {hasVariants && (
        <div className="mt-4 flex flex-wrap gap-2">
          {/* "Default" swatch */}
          {defaultImage && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              title="Default"
              className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition focus:outline-none
                ${selected === null ? "border-accent-600 ring-2 ring-accent-300" : "border-slate-200 hover:border-slate-400"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={defaultImage} alt="Default" className="h-full w-full object-cover" />
            </button>
          )}

          {variants.map((v) => {
            const variantOos = v.stock === 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v)}
                title={variantOos ? `${v.label} — Out of Stock` : v.label}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition focus:outline-none
                  ${selected?.id === v.id ? "border-accent-600 ring-2 ring-accent-300" : "border-slate-300 hover:border-slate-400"}`}
              >
                {v.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.imageUrl}
                    alt={v.label}
                    className="h-full w-full object-cover"
                    style={variantOos ? { filter: "grayscale(80%)", opacity: 0.7 } : undefined}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-sand-100 text-[10px] text-ink-500 px-0.5 text-center leading-tight">
                    {v.label}
                  </span>
                )}

                {/* Diagonal strikethrough for out-of-stock swatch */}
                {variantOos && (
                  <span className="absolute inset-0 pointer-events-none" aria-label="Out of stock">
                    <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden="true">
                      <line x1="2" y1="54" x2="54" y2="2" stroke="#6b7280" strokeWidth="2" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected label + stock hint */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {displayLabel && (
          <p className="text-sm font-medium text-ink-700">
            Selected: <span className="text-accent-700">{displayLabel}</span>
          </p>
        )}
        {hasVariants && selected && selected.stock === 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            Out of Stock
          </span>
        )}
        {hasVariants && selected && selected.stock > 0 && selected.stock <= 5 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Only {selected.stock} left
          </span>
        )}
      </div>
    </>
  );
}
