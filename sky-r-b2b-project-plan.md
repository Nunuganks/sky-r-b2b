# 🧠 SKY-R B2B Website — Technical Project Plan

## 📌 Project Overview

Build a professional, cloud-hosted B2B portal for sky-r.com to manage 5000+ products, client orders, custom branding, print workflows, and stock synchronizations — with support for multilingual frontend (BG/EN) and robust APIs for partners.

---

## 🏗️ Tech Stack

| Layer        | Technology             | Hosting                        |
| ------------ | ---------------------- | ------------------------------ |
| Frontend     | Next.js                | Vercel                         |
| Backend/CMS  | Payload CMS            | Render or Payload Cloud        |
| Database     | PostgreSQL             | Railway or Supabase            |
| File Storage | Cloudinary + S3        | CDN-backed                     |
| Emails       | Nodemailer + SMTP      | DKIM via SuperHosting          |
| Search       | Algolia or Meilisearch | Algolia (cloud) or self-hosted |

---

## 📦 Product Model Schema

```ts
Product {
  sku: string
  name: { en: string; bg: string }
  description: { en: string; bg: string }
  price: number
  ownStock: number
  deliveryStock: number
  deliveryTime: string
  supplierName: string
  categories: Category[]
  imageGallery: Image[]
  brandingOptions: BrandingOption[]
  syncUpdatedAt: datetime
}
```

---

## 📤 File Management

- **Product images** → Cloudinary (CDN optimized)
- **Print files from clients** → Amazon S3
- **Generated PDFs (invoices, proofs)** → S3 or local + backed up

---

## 🔁 Stock Synchronization

### A. Own Warehouse Stock (from Microinvest / MSSQL)

- Microinvest is installed locally with MSSQL Server
- We connect via Node.js using the `mssql` package
- Query `SKU` and `QuantityAvailable` from a stock table or view
- Update `ownStock` in CMS without touching `deliveryStock`

```sql
SELECT SKU, QuantityAvailable FROM StockView
```

- Node.js script runs every X minutes using `node-cron` or Task Scheduler

### B. Supplier Delivery Stock

- External XML/JSON feeds (e.g., Midocean)
- Only updates `deliveryStock`
- Keeps `ownStock` untouched

---

## 🔧 Node.js Sync Script Concept

1. Connect to MSSQL with credentials
2. Run SQL query to get stock data
3. Match by SKU
4. Call Payload API to update `ownStock`
5. Log sync status/errors

---

## 🔗 Client API / XML Export

Expose product data to clients via:

- `GET /api/stock.json` (authenticated)
- `GET /feeds/products.xml` (token protected)

Includes: SKU, name, stock, image, price, last updated

---

## 🌐 Multi-language Support

- Payload CMS uses field-level i18n (`name.en`, `name.bg`)
- Next.js i18n routing:
  - `/en/products/metal-pen`
  - `/bg/produkti/metalna-himikalka`
- Uses `next-intl` or `next-i18next` for translations
- Language switcher in UI

---

## ✉️ Email Notifications

- Triggered on order status changes (e.g., new, awaiting approval, shipped)
- Send from authenticated SMTP (DKIM-enabled)
- Attachments: PDF invoices, print files
- Templated emails (per status)

---

## 🧾 Orders & Branding Flow

- Client places order with product + branding details
- Upload print file (PDF, EPS, etc.)
- Order status progresses: draft → pending approval → approved → in production
- Admin can link to external print system (already implemented)

---

## 🔐 Admin Roles in CMS

- Admin: full access
- Sales: products, orders, clients
- Accounting: invoices, PDF generation
- Designer: uploads, print file management

---

## 🧪 Deployment Strategy

- Frontend (Next.js): Vercel with environment configs
- Backend (Payload): Render or Payload Cloud (auto-deploy from GitHub)
- Database: PostgreSQL (cloud-managed)
- File storage: Cloudinary (images), S3 (uploads)
- Sync jobs: cron jobs via server or GitHub Actions

---

## ✅ Immediate Next Steps

1. Initialize Git repo with Payload CMS + PostgreSQL
2. Create product schema (as above)
3. Set up Cloudinary + S3 credentials
4. Build cron script for supplier feed parsing (XML/JSON)
5. Build MSSQL sync script for Microinvest (`ownStock` only)
6. Add search integration (Algolia or Meilisearch)
7. Set up Next.js frontend with i18n and product pages

---

*This file can be copied directly into Cursor for reference throughout development.*