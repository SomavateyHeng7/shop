"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function CategoriesDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer transition-colors hover:text-accent-700"
      >
        Categories
      </button>

      {open && (
        <div className="absolute left-0 top-8 w-64 rounded-xl border border-sand-200 bg-white p-3 text-sm shadow-xl">
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="block rounded-md px-2 py-1.5 text-ink-700 hover:bg-sand-100 hover:text-accent-800"
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="mt-2 border-t border-sand-200 pt-2">
            <Link
              href="/products"
              className="block rounded-md px-2 py-1.5 font-semibold text-accent-700 hover:bg-sand-100 hover:text-accent-800"
              onClick={() => setOpen(false)}
            >
              View all categories
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
