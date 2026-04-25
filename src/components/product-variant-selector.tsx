"use client";

import { useState } from "react";

interface Variant {
  id: string;
  label: string;
  imageUrl: string | null;
}

interface Props {
  variants: Variant[];
  defaultImage: string | null;
  productName: string;
}

export function ProductVariantSelector({ variants, defaultImage, productName }: Props) {
  const [selected, setSelected] = useState<Variant | null>(null);

  const displayImage = selected?.imageUrl ?? defaultImage;
  const displayLabel = selected?.label ?? null;

  return (
    <>
      {/* Main image — controlled by selection */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand-100">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={displayLabel ? `${productName} — ${displayLabel}` : productName}
            className="h-full w-full object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sand-500">No Image</div>
        )}
      </div>

      {/* Variant swatches */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* "Default" swatch — shows the main product image */}
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

        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelected(v)}
            title={v.label}
            className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition focus:outline-none
              ${selected?.id === v.id ? "border-accent-600 ring-2 ring-accent-300" : "border-slate-200 hover:border-slate-400"}`}
          >
            {v.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.imageUrl} alt={v.label} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-sand-100 text-[10px] text-ink-500 px-0.5 text-center leading-tight">
                {v.label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected label */}
      {displayLabel && (
        <p className="mt-2 text-sm font-medium text-ink-700">
          Selected: <span className="text-accent-700">{displayLabel}</span>
        </p>
      )}
    </>
  );
}
