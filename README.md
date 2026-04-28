# NearByDress — Hyperlocal Multi-Vendor Fashion Marketplace

> **Phase 1 MVP** — A production-ready web platform where local shop owners list products, admins approve shops, and customers browse and contact shops via WhatsApp.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), TailwindCSS v4, GSAP, Context API |
| Backend | Node.js 20, Express.js 5 |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Cache | Redis (Upstash, via ioredis) |
| Media | Cloudinary |
| Validation | Joi |

---

## 📁 Project Structure

```
NearByDress/
├── backend/
│   ├── scripts/
│   │   └── createAdmin.js      # Admin seeder
│   ├── src/
│   │   ├── config/             # db, redis, cloudinary
│   │   ├── controllers/        # Thin request handlers
│   │   ├── middleware/         # auth, validate, upload, errorHandler
│   │   ├── models/             # User, Shop, Product
│   │   ├── routes/             # auth, shop, product, admin
│   │   ├── services/           # Business logic
│   │   └── utils/              # response, AppError, pagination
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Navbar, ProductCard, ShopCard, Pagination, etc.
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useFetch, useMutation
│   │   ├── pages/              # All page components
│   │   ├── services/           # API service layer (Axios)
│   │   └── App.jsx
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your secrets in .env
npm run dev
```

### 2. Create Admin User

```bash
cd backend
node scripts/createAdmin.js
```

Default admin credentials:
- Email: `admin@nearbydress.com`
- Password: `Admin@123456`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

---

## 🔐 Environment Variables

See `backend/.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLOUDINARY_*` | Cloudinary credentials |
| `REDIS_URL` | Upstash Redis URL |
| `CLIENT_URL` | Frontend origin for CORS |

---

## 📡 API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/me` | JWT | Current user |

### Shops
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/shops` | None | List approved shops (paginated) |
| GET | `/api/shops/:id` | None | Shop details |
| GET | `/api/shops/my` | shop_owner | Owner's shop |
| POST | `/api/shops` | shop_owner | Create shop |
| PUT | `/api/shops/:id` | shop_owner/admin | Update shop |
| GET | `/api/shops/:id/products` | None | Products by shop |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | None | List products (paginated) |
| GET | `/api/products/:id` | None | Product details |
| POST | `/api/products` | shop_owner/admin | Create product |
| PUT | `/api/products/:id` | shop_owner/admin | Update product |
| DELETE | `/api/products/:id` | shop_owner/admin | Delete product |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET | `/api/admin/shops` | admin | All shops |
| PATCH | `/api/admin/shops/:id/status` | admin | Approve/reject shop |
| GET | `/api/admin/products` | admin | All products |
| GET | `/api/admin/users` | admin | All users |

### Pagination (all list endpoints)
```
?page=1&limit=10
```
Response:
```json
{
  "success": true,
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10
}
```

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| `customer` | Browse products/shops, contact via WhatsApp |
| `shop_owner` | Create shop, add/edit/delete own products |
| `admin` | Approve/reject shops, manage all products, view all users |

---

## 🎨 Features

- **Glassmorphism UI** — Deep violet/amber dark-mode design
- **GSAP Animations** — Smooth hero entrance and card animations
- **WhatsApp Integration** — Direct deep links per product and shop
- **Cloudinary Upload** — Multi-image upload for products, logo + cover for shops
- **Redis Caching** — 5-min TTL on list endpoints, auto-invalidated on mutations
- **Paginated APIs** — All list endpoints are paginated (default 10/page)
- **Role-Based Access** — JWT + role guards on all protected routes
- **Mobile-First Design** — Fully responsive with mobile hamburger nav

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT with 7-day expiry
- Helmet for HTTP security headers
- Rate limiting: 200 req / 15 min per IP
- Input validation with Joi on all write endpoints
- CORS restricted to frontend origin

---

## 📦 Phase 1 Scope (Complete)

- [x] User auth (register, login, JWT)
- [x] Shop creation with Cloudinary upload
- [x] Admin shop approval workflow
- [x] Product CRUD with multi-image upload
- [x] Redis caching on list endpoints
- [x] Paginated APIs and UI
- [x] WhatsApp contact links
- [x] Admin dashboard (stats, shops, products, users)
- [x] Shop owner dashboard

**Phase 2 (Planned):** Orders, Reviews, Delivery, Payments
