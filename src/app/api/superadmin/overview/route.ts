import { mockStore } from "@/lib/mock-data";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = mockStore.products.findMany({ includeInactive: true });
  const settings = mockStore.system.getSettings();

  const response = {
    admins: {
      active: mockStore.adminUsers.activeCount(),
      total: mockStore.adminUsers.findMany().length,
      superadmins: mockStore.adminUsers.countByRole("superadmin"),
    },
    catalog: {
      totalProducts: products.length,
      archivedProducts: products.filter((p) => !p.isActive).length,
      totalCategories: mockStore.categories.count(),
    },
    stock: {
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      lowStockItems: products.filter((p) => p.stock <= settings.globalLowStockThreshold).length,
    },
    settings,
  };

  return Response.json(response);
}
