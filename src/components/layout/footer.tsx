export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-sand-100/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-ink-600 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ST Shop</p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
}
