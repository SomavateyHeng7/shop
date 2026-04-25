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
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              className="transition-colors hover:text-accent-700"
              href={`/categories/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
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
              className="rounded-lg border border-sand-300 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-sand-100"
              href="/admin/login"
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
      </div>
    </header>
  );
}
