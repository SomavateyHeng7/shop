# ST Shop — Project Overview

## Project Type

Full-stack e-commerce product catalog and admin inventory management system built with Next.js App Router.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | NextAuth.js v5 (credentials + JWT) |
| Database | PostgreSQL (port 5433) |
| ORM | Prisma 6.19.3 |
| Validation | Zod 4.3.6 |
| Forms | React Hook Form 7.73.1 |
| Password | bcryptjs (cost factor 12) |

---

## Environment Variables

```
DATABASE_URL          PostgreSQL connection string
NEXTAUTH_SECRET       JWT signing secret
ADMIN_EMAIL           Seed default admin email
ADMIN_PASSWORD        Seed default admin password
ADMIN_NAME            Seed default admin name
```

---

## Project Structure

```
src/
├── app/
│   ├── (public)/           Public storefront pages
│   ├── admin/
│   │   ├── login/          Admin login page
│   │   └── (auth)/         Auth-protected admin pages
│   └── api/                API routes
├── components/
│   ├── admin/              Admin UI components
│   ├── layout/             Shared layout components
│   └── ui/                 shadcn/ui components
├── lib/
│   ├── auth.ts             NextAuth configuration
│   ├── prisma.ts           Prisma client singleton
│   ├── utils.ts            Utilities (price format, slug, stock status)
│   ├── catalog.ts          DB queries for products/categories
│   └── config.ts           Site config (Messenger URL)
└── generated/prisma/       Generated Prisma client
prisma/
├── schema.prisma           Database schema
├── seed.ts                 Seed script
└── migrations/             6 migration files
```

---

## Features

### Public Storefront (Customer-Facing)

- Product catalog grid with images, names, prices, stock status badges
- Product detail pages with variants, descriptions, category info
- Featured products on homepage hero
- Search by name/description with URL params (shareable)
- Filter by category with live product counts
- Price range filtering (min/max)
- Stock status badges: **In Stock**, **Low Stock**, **Out of Stock**, **Pre-Order**
- Facebook Messenger integration for product inquiries (no checkout)
- Responsive, mobile-first design

### Admin Dashboard (Auth-Protected)

**Authentication**
- Email + password login at `/admin/login`
- JWT sessions via NextAuth v5
- Password change with current password verification
- Admin profile management page

**Product Management**
- List all products with search
- Create / edit / soft-delete products (via `isActive` flag)
- Fields: name, slug, description, price, stock, low-stock threshold, category, image, pre-order toggle
- Image upload → saved to `/public/uploads/` with UUID filenames

**Product Variants**
- Multiple variants per product (e.g. color, size)
- Variant-specific images and independent stock tracking
- Variant sorting/reordering

**Stock Management**
- Inline stock editor with +/- buttons
- Detailed stock update form with notes
- Unit cost tracking for weighted average cost calculation
- Full stock audit log (StockLog table)

**Category Management**
- Create, edit, delete categories
- Auto slug generation
- Product count per category

**Finance Tracking**
- Bought price (cost price) and delivery cost per product
- Discount percentage (0–100%)
- Profit margin calculations
- Investment budget and target goal settings

**Orders**
- Create orders with multiple line items
- Auto-deduct stock on order creation
- Order history with full pricing breakdown

**Dashboard Analytics**
- Total active products
- Total inventory value (stock × price)
- Low-stock alerts (configurable threshold)
- Out-of-stock count
- Total categories

**Data Export (CSV)**
- **Inventory Snapshot:** all products with pricing, costs, discount, profit/unit
- **Stock Movement Log:** date-range filtered audit trail with unit costs
- **Finance & Orders:** monthly filtered report with revenue, cost, profit totals

---

## Database Schema

| Model | Purpose |
|---|---|
| `Product` | Core product record |
| `ProductVariant` | Color/size variants with independent stock |
| `Category` | Product categories |
| `StockLog` | Full audit trail of stock changes |
| `AdminUser` | Admin credentials (email + bcrypt hash) |
| `ProductFinance` | Per-product cost/discount data |
| `FinanceSettings` | Global budget and goal settings |
| `Order` | Purchase orders |
| `OrderItem` | Line items (denormalized productName for history) |

Key design decisions:
- `Decimal(10,2)` for all prices
- Soft-delete via `isActive` (products never hard-deleted)
- `OrderItem.productName` denormalized to preserve order history after product edits

---

## API Routes

### Public
```
GET  /api/products              List active products (search support)
GET  /api/products/[id]         Single product
```

### Admin (auth-protected)
```
GET/POST/PUT/DELETE  /api/admin/products/[id]              Product CRUD
PATCH                /api/admin/products/[id]/stock         Update main stock
POST/GET/PATCH       /api/admin/products/[id]/variants      Variant management
PATCH                /api/admin/products/[id]/variants/[variantId]/stock
GET/POST/PUT         /api/admin/categories/[id]             Category CRUD
POST/GET/PUT         /api/admin/finance/orders/[id]         Orders
GET/PATCH            /api/admin/finance/products/[id]       Product finance data
PATCH                /api/admin/finance/settings            Budget/goal settings
PATCH                /api/admin/account/password            Change password
GET                  /api/admin/dashboard                   Stats
GET                  /api/admin/export                      Inventory CSV
GET                  /api/admin/export/stock-log            Stock log CSV
GET                  /api/admin/finance/export              Finance CSV
POST                 /api/upload                            Image upload
```

---

## Page Routes

### Public
```
/                    Homepage (hero + featured products)
/products            Catalog with search/filter
/products/[slug]     Product detail with variants
/categories/[slug]   Category-filtered listing
```

### Admin
```
/admin/login         Login page
/admin               Dashboard
/admin/products      Product list
/admin/products/new  Create product
/admin/products/[id] Edit product (variants + finance)
/admin/categories    Manage categories
/admin/orders        Orders management
/admin/finance       Finance dashboard
/admin/export        CSV export interface
/admin/profile       Admin profile + password change
```

---

## Auth Flow

1. POST credentials to NextAuth on `/admin/login`
2. Zod validation → query `AdminUser` → bcryptjs.compare()
3. On success: JWT stored in HTTP-only cookie
4. Protected layout at `/src/app/admin/(auth)/layout.tsx` gates all admin pages
5. Unauthenticated requests redirect to `/admin/login`

---

## Common Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Prisma
pnpm prisma migrate dev       # Run migrations
pnpm prisma db seed           # Seed admin user
pnpm prisma studio            # Visual DB browser
pnpm prisma generate          # Regenerate client
```

---

## Notes

- Most pages use `export const dynamic = "force-dynamic"` to disable static caching
- Color palette: purples (`#9b7fb8`), pinks, sand tones, slate grays
- Fonts: Fraunces (display) + Manrope (body) via `next/font`
- Path alias: `@/*` → `./src/*`
