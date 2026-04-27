export function formatPrice(price: number | string | { toString(): string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStockStatus(
  stock: number,
  lowStockAt: number,
  preOrder = false
): "in_stock" | "low_stock" | "out_of_stock" | "pre_order" {
  if (preOrder) return "pre_order";
  if (stock === 0) return "out_of_stock";
  if (stock <= lowStockAt) return "low_stock";
  return "in_stock";
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}
