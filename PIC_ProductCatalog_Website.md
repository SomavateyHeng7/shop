

---

## 1. Executive Summary

A full-stack web application with a **public-facing storefront** for customers to browse products and prices, and a **password-protected admin dashboard** for inventory management. The system is designed to be cost-effective, performant, and deployable on Vercel's free/hobby tier with zero DevOps overhead.

---

## 2. Goals & Success Criteria

| Goal | Success Metric |
|------|---------------|
| Customers can browse products & prices | Page load < 2s, mobile-responsive |
| Admin can manage stock levels | CRUD operations with real-time updates |
| Easy to maintain | Non-technical admin can update inventory via UI |
| Hosted on Vercel | Full deployment on Vercel (frontend + API) |
| Low/no infrastructure cost | Free-tier compatible stack |

---

## 3. User Personas

### 3.1 Customer (Public User)
- **Who:** End consumers visiting the website
- **Goals:** Browse products, check prices, check availability
- **Access:** No login required
- **Devices:** Mobile & Desktop

### 3.2 Admin (Store Owner/Staff)
- **Who:** Business owner or staff managing inventory
- **Goals:** Add/edit/delete products, update stock quantities, track low-stock items upload image of the product as well
- **Access:** Protected by username + password login
- **Devices:** Primarily desktop

---

## 4. Feature Scope

### 4.1 Public Storefront (Customer View)
| Feature | Priority | Description |
|---------|----------|-------------|
| Product Catalog Grid | P0 | Display all products with image, name, price |
| Product Detail Page | P0 | Full product info, description, stock status |
| Search & Filter | P1 | Search by name, filter by category/price range |
| Stock Badge | P0 | "In Stock", "Low Stock", "Out of Stock" badges |
| Responsive Design | P0 | Mobile-first, works on all screen sizes |
| Category Navigation | P1 | Browse products by category |

### 4.2 Admin Dashboard (Protected)
| Feature | Priority | Description |
|---------|----------|-------------|
| Admin Login | P0 | Secure authentication with JWT |
| Product List View | P0 | Tabular view of all products with stock levels |
| Add Product | P0 | Form to add new products with image upload |
| Edit Product | P0 | Update name, price, description, category |
| Update Stock | P0 | Quick stock quantity update per product |
| Delete Product | P0 | Soft-delete products from catalog |
| Low Stock Alerts | P1 | Visual flag when stock < threshold (e.g., 5 units) |
| Dashboard Summary | P1 | Total products, total stock value, low-stock count |
| CSV Export | P2 | Export inventory to CSV for reporting |

---

## 5. Recommended Tech Stack

### Why This Stack?
Optimized for **Vercel deployment**, **developer speed**, **free-tier cost**, and **long-term maintainability**.

```
┌─────────────────────────────────────────────┐
│              VERCEL HOSTING                  │
├─────────────────┬───────────────────────────┤
│   FRONTEND      │        BACKEND (API)       │
│   Next.js 14    │   Next.js API Routes       │
│   (App Router)  │   (Serverless Functions)   │
│   Tailwind CSS  │                           │
│   shadcn/ui     │   NextAuth.js (Auth)       │
├─────────────────┴───────────────────────────┤
│              DATABASE                        │
│   Neon (PostgreSQL) — free tier             │
│   Prisma ORM                                │
├─────────────────────────────────────────────┤
│           IMAGE STORAGE                      │
│   Cloudinary or Vercel Blob Storage         │
└─────────────────────────────────────────────┘
```

### Stack Breakdown

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | **Next.js 14** (App Router) | SSR/SSG, API routes, Vercel-native |
| Styling | **Tailwind CSS** + **shadcn/ui** | Fast, consistent, beautiful UI |
| Database | **Neon PostgreSQL** (free tier) | Serverless Postgres, integrates seamlessly with Vercel |
| ORM | **Prisma** | Type-safe DB queries, easy migrations |
| Auth | **NextAuth.js v5** | Secure session management, supports credentials |
| Image Hosting | **Cloudinary** (free) or **Vercel Blob** | CDN-backed image delivery |
| Language | **TypeScript** | Type safety, fewer bugs, better DX |

---

## 6. System Architecture

```
                        ┌──────────────┐
                        │   User/Admin │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │   Browser    │
                        └──────┬───────┘
                               │ HTTPS
                   ┌───────────▼────────────┐
                   │     VERCEL CDN/Edge     │
                   └─────────┬──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌─────▼────────┐ ┌──▼──────────────┐
     │  Static Pages │ │  API Routes  │ │  Admin Pages     │
     │  /            │ │  /api/*      │ │  /admin/*        │
     │  /products    │ │  (Serverless)│ │  (Auth-gated)    │
     │  /products/id │ └──────┬───────┘ └─────────────────┘
     └───────────────┘        │
                       ┌──────▼──────────┐
                       │  Prisma ORM     │
                       └──────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Neon PostgreSQL     │
                   │  (Serverless DB)     │
                   └─────────────────────┘
```

---

## 7. Data Model

### 7.1 Database Schema (Prisma)

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?
  categoryId  String?
  stock       Int      @default(0)
  lowStockAt  Int      @default(5)   // threshold for "low stock" alert
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category    Category? @relation(fields: [categoryId], references: [id])
  stockLogs   StockLog[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  products  Product[]
}

model StockLog {
  id         String   @id @default(cuid())
  productId  String
  change     Int      // positive = restock, negative = adjustment
  note       String?
  createdAt  DateTime @default(now())

  product    Product  @relation(fields: [productId], references: [id])
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
}
```

---

## 8. URL Structure & Pages

### Public Routes
```
/                        → Homepage (featured products, hero section)
/products                → Full product catalog with search/filter
/products/[slug]         → Product detail page
/categories/[slug]       → Products filtered by category
```

### Admin Routes (Auth-protected)
```
/admin/login             → Admin login page
/admin                   → Dashboard overview (stats, alerts)
/admin/products          → Product list with stock levels
/admin/products/new      → Add new product form
/admin/products/[id]     → Edit product
/admin/categories        → Manage categories
```

### API Routes (Serverless Functions)
```
GET    /api/products          → List all active products
GET    /api/products/[id]     → Get single product
POST   /api/admin/products    → Create product (auth required)
PUT    /api/admin/products/[id]  → Update product (auth required)
DELETE /api/admin/products/[id]  → Soft delete (auth required)
PATCH  /api/admin/products/[id]/stock  → Update stock quantity (auth required)
GET    /api/admin/dashboard   → Dashboard stats (auth required)
GET    /api/admin/export      → CSV export (auth required)
```

---

## 9. UI/UX Design Direction

### Public Storefront
- **Aesthetic:** Clean, modern e-commerce feel — think refined minimalism
- **Product Cards:** Image, name, price, stock badge, hover effect
- **Color scheme:** White/light gray background, strong brand accent color
- **Typography:** Distinctive serif for headings, clean sans-serif for body
- **Mobile:** Card grid collapses from 4 → 2 → 1 column

### Admin Dashboard
- **Aesthetic:** Utilitarian, data-dense, clear hierarchy
- **Stock Table:** Color-coded rows (red = out of stock, orange = low stock, green = good)
- **Quick Actions:** Inline stock edit without page navigation
- **Summary Cards:** Total SKUs, total inventory value, # of low-stock items

---

## 10. Security Considerations

| Risk | Mitigation |
|------|-----------|
| Unauthorized admin access | NextAuth.js sessions + middleware route protection |
| SQL injection | Prisma ORM parameterized queries |
| XSS attacks | Next.js built-in output escaping |
| Exposed secrets | Environment variables via Vercel dashboard (never in code) |
| Password storage | bcrypt hashing (cost factor 12) |
| API abuse | Rate limiting on API routes (Vercel Edge middleware) |

---

## 11. Environment Variables

```env
# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."     # for Prisma migrations

# Auth (NextAuth)
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Image Storage (choose one)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
# OR
BLOB_READ_WRITE_TOKEN="..."       # Vercel Blob

# App Config
NEXT_PUBLIC_APP_NAME="Your Store Name"
LOW_STOCK_THRESHOLD=5
```

---

## 12. Development Phases & Timeline

### Phase 1 — Foundation (Week 1–2)
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] Set up Neon database + Prisma schema + migrations
- [ ] Build seed script with sample products/categories
- [ ] Set up NextAuth with credentials provider
- [ ] Deploy skeleton to Vercel (CI/CD pipeline from GitHub)

### Phase 2 — Public Storefront (Week 2–3)
- [ ] Homepage with hero + featured products
- [ ] Product catalog page with grid layout
- [ ] Product detail page
- [ ] Search + filter functionality
- [ ] Category navigation
- [ ] Mobile responsive design

### Phase 3 — Admin Dashboard (Week 3–4)
- [ ] Login page + session management
- [ ] Dashboard overview page (stats cards)
- [ ] Product management table (list, add, edit, delete)
- [ ] Stock update flow (inline + dedicated form)
- [ ] Low-stock alert system
- [ ] Image upload integration

### Phase 4 — Polish & Launch (Week 5)
- [ ] CSV export feature
- [ ] SEO meta tags (Next.js Metadata API)
- [ ] Performance audit (Lighthouse > 90)
- [ ] Error handling & loading states
- [ ] Final Vercel production deployment
- [ ] Admin user setup script

---

## 13. Deployment Guide (Vercel)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/youruser/your-repo.git
git push -u origin main

# 2. Connect to Vercel
# → Go to vercel.com → Import Git Repository → Select your repo

# 3. Add environment variables in Vercel dashboard
# → Settings → Environment Variables → Add all from Section 11

# 4. Run database migrations (one-time)
npx prisma migrate deploy

# 5. Seed initial admin user
npx ts-node scripts/seed-admin.ts
```

Every `git push` to `main` triggers automatic deployment on Vercel.

---

## 14. Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby (free) | $0 |
| Neon PostgreSQL | Free tier (0.5GB) | $0 |
| Cloudinary | Free tier (25GB) | $0 |
| Domain (optional) | Custom domain | ~$12/year |
| **Total** | | **$0/month** |

> Upgrade to Vercel Pro ($20/mo) if you need team collaboration, password-protected deployments, or higher bandwidth limits.

---

## 15. Recommended Folder Structure

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              ← Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          ← Product catalog
│   │   │   └── [slug]/page.tsx   ← Product detail
│   │   └── categories/
│   │       └── [slug]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx              ← Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── categories/page.tsx
│   └── api/
│       ├── products/route.ts
│       ├── products/[id]/route.ts
│       └── admin/
│           ├── products/route.ts
│           ├── products/[id]/route.ts
│           ├── products/[id]/stock/route.ts
│           └── dashboard/route.ts
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── stock-badge.tsx
│   ├── admin/
│   │   ├── product-table.tsx
│   │   ├── stock-editor.tsx
│   │   └── dashboard-stats.tsx
│   └── layout/
│       ├── navbar.tsx
│       └── admin-sidebar.tsx
├── lib/
│   ├── prisma.ts                 ← Prisma client singleton
│   ├── auth.ts                   ← NextAuth config
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── .env.local
├── next.config.ts
└── package.json
```

---

## 16. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "@prisma/client": "^5.14.0",
    "next-auth": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "latest",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "cloudinary": "^2.2.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

---

## 17. Out of Scope (v1.0)

The following features are **not** in scope for the initial release but can be added in future versions:

- Shopping cart / checkout / payments
- Customer accounts / order history
- Email notifications (low stock alerts)
- Multi-language / multi-currency
- Barcode scanning
- Supplier management
- Bulk CSV import of products
- Analytics dashboard (sales trends)

---

## 18. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Vercel free tier limits hit | Low | Medium | Monitor usage; upgrade to Pro if needed |
| Neon DB size exceeded | Low | High | Compress images externally; archive old stock logs |
| Admin credentials compromised | Low | High | Strong password policy + bcrypt |
| Image upload failures | Medium | Low | Fallback to placeholder; retry logic |

---

*Document prepared for development kickoff. All scope decisions subject to stakeholder review before sprint planning.*
