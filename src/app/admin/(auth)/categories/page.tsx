import { CategoryManager } from "@/components/admin/category-manager";
import { getAllCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-4">
      <CategoryManager categories={categories} />
    </div>
  );
}
