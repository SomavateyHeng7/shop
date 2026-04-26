"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "inactive", label: "Inactive" },
];

export function ProductFilters({ categories, currentSearch, currentCategory, currentStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const hasFilters = currentSearch || currentCategory || currentStatus;

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
      {/* Search */}
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
        <input
          defaultValue={currentSearch}
          placeholder="Search products…"
          onChange={(e) => update("search", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Category */}
      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
        <select
          value={currentCategory}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
        <select
          value={currentStatus}
          onChange={(e) => update("status", e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
