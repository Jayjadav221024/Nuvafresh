# Nuva Fresh Architecture & State

Full-stack MERN organic/ozone-washed grocery storefront with live Wix-style CMS Studio and admin panel.

## Architecture & Ports
- **Frontend**: Vite + React 18 + TailwindCSS on `http://localhost:5173` (`/client`)
- **Backend**: Express + Node.js (ESM) + MongoDB on `http://localhost:5000` (`/server`)
- **Proxy**: `/api` routes proxied to port 5000 via `vite.config.js`

## Auth & Access
- Header: `Authorization: Bearer <jwt_token>` (stored in `localStorage.getItem('nuva_token')`)
- Default Admin: `admin@thenuva.com` / `admin123` (or any email with "admin")
- Default User: `priya@example.com` / `user123`

## Key Modules & Routes
1. **Storefront Pages**:
   - `/` — Homepage with dynamic bestsellers, ozone wash purity pillars, showcase video, Instagram feed
   - `/shop` — Catalog with category filters, ozone tags, price sorting
   - `/products/:id` — Product detail with instant buy QR modal & batch info
   - `/our-story` — Founder narrative, Vadodara ozone facility, sustainable packaging, farmer support
   - `/b2b` & `/b2c` — Commercial kitchen supply, product offerings, certifications, location hubs
   - `/csr-initiatives` — ₹1 Agri-Tech fund pledge, 4 pillars, tractor meadow banner
   - `/ozone-shield` — Machinery schematic diagram, Ozone cure table, pesticide metrics
   - `/contact-us` — Inquiry form, Vadodara/Anand processing units
   - `/blogs` — Health & nutrition articles
2. **Admin Studio (`/admin`)**:
   - `/admin/editor` — Wix-style live click-to-edit CMS with device toggles (desktop/tablet/mobile)
   - `/admin/products` — 335 CSV products catalog with stock & price management
   - `/admin/coupons` — Create & manage coupons (`WELCOME10`, `OZONEPURITY`) with backend validation
   - `/admin/orders` — Live order statuses and payment verification
   - `/admin/analytics`, `/admin/inquiries`, `/admin/reviews`, `/admin/inventory`

## Database Models (`server/models`)
- `User`, `Product` (335 items), `Order`, `Category`, `Coupon`, `Review`, `Inquiry`, `Newsletter`, `SectionContent` (24 live CMS sections), `AuditLog`

## Rules
- All DB queries fall back gracefully to in-memory mocks when MongoDB is offline.
- Public CMS endpoints (`/api/admin/content/sections`) and coupon validation (`/api/admin/coupons/validate`) remain publicly accessible for storefront performance.
