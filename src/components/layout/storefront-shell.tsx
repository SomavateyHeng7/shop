import { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

interface Props {
  children: ReactNode;
  searchValue?: string;
}

export async function StorefrontShell({ children, searchValue }: Props) {
  return (
    <div className="min-h-screen bg-sand-100 text-ink-900">
      <Navbar searchValue={searchValue} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
