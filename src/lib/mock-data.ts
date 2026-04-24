import { slugify } from "@/lib/utils";

export type MockCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MockProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockStockLog = {
  id: string;
  productId: string;
  change: number;
  note: string | null;
  createdAt: Date;
};

export type MockAdminRole = "admin" | "superadmin";

export type MockAdminUser = {
  id: string;
  email: string;
  name: string;
  role: MockAdminRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export type MockSystemSettings = {
  maintenanceMode: boolean;
  catalogPublic: boolean;
  adminWritesEnabled: boolean;
  allowNewAdminInvites: boolean;
  globalLowStockThreshold: number;
  updatedAt: Date;
};

export type MockAuditLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  createdAt: Date;
};

const categories: MockCategory[] = [
  { id: "cat-1", name: "Electronics", slug: "electronics", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-2", name: "Clothing", slug: "clothing", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-3", name: "Home & Garden", slug: "home-garden", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-4", name: "Sports", slug: "sports", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
];

const products: MockProduct[] = [
  {
    id: "prod-1", slug: "wireless-headphones", name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
    price: 129.99, imageUrl: null, stock: 42, lowStockAt: 5, isActive: true,
    categoryId: "cat-1", createdAt: new Date("2024-01-10"), updatedAt: new Date("2024-01-10"),
  },
  {
    id: "prod-2", slug: "mechanical-keyboard", name: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with RGB backlighting and USB-C connection.",
    price: 89.99, imageUrl: null, stock: 3, lowStockAt: 5, isActive: true,
    categoryId: "cat-1", createdAt: new Date("2024-01-12"), updatedAt: new Date("2024-01-12"),
  },
  {
    id: "prod-3", slug: "running-shoes", name: "Running Shoes",
    description: "Lightweight and breathable running shoes for everyday training.",
    price: 74.99, imageUrl: null, stock: 0, lowStockAt: 10, isActive: true,
    categoryId: "cat-4", createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-01-15"),
  },
  {
    id: "prod-4", slug: "cotton-t-shirt", name: "Cotton T-Shirt",
    description: "Comfortable 100% organic cotton t-shirt available in multiple colors.",
    price: 24.99, imageUrl: null, stock: 120, lowStockAt: 20, isActive: true,
    categoryId: "cat-2", createdAt: new Date("2024-01-18"), updatedAt: new Date("2024-01-18"),
  },
  {
    id: "prod-5", slug: "garden-hose", name: "Garden Hose",
    description: "50ft expandable garden hose with 8-pattern spray nozzle.",
    price: 34.99, imageUrl: null, stock: 18, lowStockAt: 5, isActive: true,
    categoryId: "cat-3", createdAt: new Date("2024-01-20"), updatedAt: new Date("2024-01-20"),
  },
  {
    id: "prod-6", slug: "usb-c-hub", name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, SD card reader, and 100W pass-through charging.",
    price: 49.99, imageUrl: null, stock: 4, lowStockAt: 5, isActive: true,
    categoryId: "cat-1", createdAt: new Date("2024-01-22"), updatedAt: new Date("2024-01-22"),
  },
  {
    id: "prod-7", slug: "yoga-mat", name: "Yoga Mat",
    description: "Non-slip 6mm thick yoga mat with alignment lines.",
    price: 39.99, imageUrl: null, stock: 55, lowStockAt: 10, isActive: true,
    categoryId: "cat-4", createdAt: new Date("2024-01-25"), updatedAt: new Date("2024-01-25"),
  },
  {
    id: "prod-8", slug: "desk-lamp", name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with 5 brightness levels and USB charging port.",
    price: 44.99, imageUrl: null, stock: 0, lowStockAt: 5, isActive: true,
    categoryId: "cat-3", createdAt: new Date("2024-01-28"), updatedAt: new Date("2024-01-28"),
  },
];

const stockLogs: MockStockLog[] = [];
const adminUsers: MockAdminUser[] = [
  {
    id: "admin-user-1",
    email: "admin@example.com",
    name: "Store Admin",
    role: "admin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date("2026-04-22T12:30:00Z"),
  },
  {
    id: "admin-user-2",
    email: "superadmin@example.com",
    name: "System Owner",
    role: "superadmin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date("2026-04-23T08:10:00Z"),
  },
];

const systemSettings: MockSystemSettings = {
  maintenanceMode: false,
  catalogPublic: true,
  adminWritesEnabled: true,
  allowNewAdminInvites: true,
  globalLowStockThreshold: 5,
  updatedAt: new Date("2026-04-23T08:10:00Z"),
};

const auditLogs: MockAuditLog[] = [
  {
    id: "audit-1",
    actor: "System",
    action: "Boot",
    target: "Platform",
    details: "Mock store initialized",
    createdAt: new Date("2026-04-23T08:00:00Z"),
  },
  {
    id: "audit-2",
    actor: "System Owner",
    action: "Review",
    target: "Admin Access",
    details: "Validated admin permissions and session controls",
    createdAt: new Date("2026-04-23T08:15:00Z"),
  },
];
let idCounter = 100;

function nextId() {
  return `mock-${++idCounter}`;
}

export const mockStore = {
  categories: {
    findMany(): MockCategory[] {
      return [...categories];
    },
    findUnique(id: string): MockCategory | null {
      return categories.find((c) => c.id === id) ?? null;
    },
    findBySlug(slug: string): MockCategory | null {
      return categories.find((c) => c.slug === slug) ?? null;
    },
    create(name: string): MockCategory {
      const cat: MockCategory = {
        id: nextId(), name, slug: slugify(name),
        createdAt: new Date(), updatedAt: new Date(),
      };
      categories.push(cat);
      return cat;
    },
    update(id: string, name: string): MockCategory | null {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return null;
      cat.name = name;
      cat.slug = slugify(name);
      cat.updatedAt = new Date();
      return cat;
    },
    delete(id: string): boolean {
      const idx = categories.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      categories.splice(idx, 1);
      return true;
    },
    count(): number {
      return categories.length;
    },
  },

  products: {
    findMany(opts: {
      search?: string;
      categorySlug?: string;
      minPrice?: number;
      maxPrice?: number;
      activeOnly?: boolean;
      includeInactive?: boolean;
    } = {}): (MockProduct & { category: { name: string; slug: string } | null })[] {
      let result = products.filter((p) => {
        if (opts.activeOnly && !p.isActive) return false;
        if (!opts.includeInactive && opts.activeOnly !== false && !p.isActive) return false;
        if (opts.search) {
          const s = opts.search.toLowerCase();
          if (!p.name.toLowerCase().includes(s) && !(p.description ?? "").toLowerCase().includes(s)) return false;
        }
        if (opts.categorySlug) {
          const cat = categories.find((c) => c.slug === opts.categorySlug);
          if (!cat || p.categoryId !== cat.id) return false;
        }
        if (opts.minPrice !== undefined && p.price < opts.minPrice) return false;
        if (opts.maxPrice !== undefined && p.price > opts.maxPrice) return false;
        return true;
      });

      return result.map((p) => ({
        ...p,
        category: p.categoryId ? (categories.find((c) => c.id === p.categoryId) ?? null) : null,
      }));
    },

    findById(id: string): (MockProduct & { category: { name: string; slug: string } | null; stockLogs: MockStockLog[] }) | null {
      const p = products.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        category: p.categoryId ? (categories.find((c) => c.id === p.categoryId) ?? null) : null,
        stockLogs: stockLogs.filter((l) => l.productId === id).slice(-10).reverse(),
      };
    },

    findBySlugOrId(slugOrId: string, activeOnly = true): (MockProduct & { category: MockCategory | null }) | null {
      const p = products.find((x) => (x.id === slugOrId || x.slug === slugOrId) && (!activeOnly || x.isActive));
      if (!p) return null;
      return {
        ...p,
        category: p.categoryId ? (categories.find((c) => c.id === p.categoryId) ?? null) : null,
      };
    },

    create(data: {
      name: string; slug: string; description?: string; price: number;
      imageUrl?: string | null; categoryId?: string | null; stock: number; lowStockAt: number;
    }): MockProduct {
      const p: MockProduct = {
        id: nextId(), isActive: true,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        categoryId: data.categoryId ?? null,
        createdAt: new Date(), updatedAt: new Date(),
        ...data,
      };
      products.push(p);
      return p;
    },

    update(id: string, data: Partial<Pick<MockProduct, "name" | "description" | "price" | "imageUrl" | "categoryId" | "stock" | "lowStockAt" | "isActive">>): MockProduct | null {
      const p = products.find((x) => x.id === id);
      if (!p) return null;
      Object.assign(p, data, { updatedAt: new Date() });
      return p;
    },

    slugExists(slug: string): boolean {
      return products.some((p) => p.slug === slug);
    },
  },

  stockLogs: {
    create(productId: string, change: number, note?: string): MockStockLog {
      const log: MockStockLog = {
        id: nextId(), productId, change, note: note ?? null, createdAt: new Date(),
      };
      stockLogs.push(log);
      return log;
    },
  },

  adminUsers: {
    findMany(): MockAdminUser[] {
      return [...adminUsers].sort((a, b) => a.email.localeCompare(b.email));
    },
    create(data: { email: string; name: string; role: MockAdminRole }): MockAdminUser {
      const user: MockAdminUser = {
        id: nextId(),
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: null,
      };
      adminUsers.push(user);
      return user;
    },
    toggleActive(id: string): MockAdminUser | null {
      const user = adminUsers.find((entry) => entry.id === id);
      if (!user) return null;
      user.isActive = !user.isActive;
      return user;
    },
    setRole(id: string, role: MockAdminRole): MockAdminUser | null {
      const user = adminUsers.find((entry) => entry.id === id);
      if (!user) return null;
      user.role = role;
      return user;
    },
    countByRole(role: MockAdminRole): number {
      return adminUsers.filter((user) => user.role === role).length;
    },
    activeCount(): number {
      return adminUsers.filter((user) => user.isActive).length;
    },
  },

  system: {
    getSettings(): MockSystemSettings {
      return { ...systemSettings };
    },
    updateSettings(data: Partial<Omit<MockSystemSettings, "updatedAt">>): MockSystemSettings {
      Object.assign(systemSettings, data, { updatedAt: new Date() });
      return { ...systemSettings };
    },
  },

  audit: {
    list(limit = 40): MockAuditLog[] {
      return [...auditLogs]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    create(data: Omit<MockAuditLog, "id" | "createdAt">): MockAuditLog {
      const log: MockAuditLog = {
        id: nextId(),
        createdAt: new Date(),
        ...data,
      };
      auditLogs.push(log);
      return log;
    },
  },
};
