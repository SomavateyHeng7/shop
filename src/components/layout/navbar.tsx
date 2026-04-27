import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/catalog";
import { auth } from "@/lib/auth";

interface Props {
  searchValue?: string;
}

export async function Navbar({ searchValue = "" }: Props) {
  const [categories, session] = await Promise.all([getAllCategories(), auth()]);

  return (
    <header className="sticky top-0 z-20 border-b border-sand-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Image src="/st-shop.png" alt="ST Shop" width={120} height={40} style={{ height: 40, width: "auto" }} className="object-contain" priority />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-ink-700 md:flex">
          <Link className="transition-colors hover:text-accent-700" href="/products">
            All Products
          </Link>

          <details className="group relative">
            <summary className="cursor-pointer list-none transition-colors hover:text-accent-700">
              Categories
            </summary>
            <div className="absolute left-0 top-8 w-64 rounded-xl border border-sand-200 bg-white p-3 text-sm shadow-xl">
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    className="block rounded-md px-2 py-1.5 text-ink-700 hover:bg-sand-100 hover:text-accent-800"
                    href={`/categories/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-sand-200 pt-2">
                <Link
                  className="block rounded-md px-2 py-1.5 font-semibold text-accent-700 hover:bg-sand-100 hover:text-accent-800"
                  href="/products"
                >
                  View all categories
                </Link>
              </div>
            </div>
          </details>

          {session ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-full border border-[#d4c4e8] bg-[#f5f0fb] px-3 py-1.5 text-sm font-medium text-[#4a3860] transition hover:bg-[#ede5f7]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9b7fb8] text-[10px] font-bold text-white">
                {(session.user?.name ?? session.user?.email ?? "A").charAt(0).toUpperCase()}
              </span>
              <span>{session.user?.name ?? "Admin"}</span>
            </Link>
          ) : (
            <Link
              className="rounded-full border border-accent-600 px-4 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-50"
              href="/auth/login"
            >
              Login
            </Link>
          )}
        </nav>

        <form action="/products" className="hidden w-72 items-center gap-2 md:flex">
          <input
            type="search"
            name="search"
            defaultValue={searchValue}
            placeholder="Search products"
            className="w-full rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-sm text-ink-900 outline-none ring-accent-500 transition focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full bg-[#9b7fb8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7a5fa0]"
          >
            Search
          </button>
        </form>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-sand-300 px-4 py-2 text-sm font-semibold text-ink-900">
            Menu
          </summary>

          <div className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-sand-200 bg-white p-4 shadow-xl">
            <form action="/products" className="flex items-center gap-2">
              <input
                type="search"
                name="search"
                defaultValue={searchValue}
                placeholder="Search products"
                className="w-full rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-sm text-ink-900 outline-none ring-accent-500 transition focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
              >
                Search
              </button>
            </form>

            <nav className="mt-4 space-y-1 text-sm font-medium">
              <Link
                className="block rounded-lg px-3 py-2 text-ink-800 transition hover:bg-sand-100"
                href="/products"
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  className="block rounded-lg px-3 py-2 text-ink-800 transition hover:bg-sand-100"
                  href={`/categories/${category.slug}`}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                className="block rounded-lg px-3 py-2 font-semibold text-accent-700 transition hover:bg-sand-100"
                href="/products"
              >
                View all categories
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
