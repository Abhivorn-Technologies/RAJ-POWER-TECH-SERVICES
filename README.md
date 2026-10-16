# RPS E-Commerce - RAJ POWER TECH SERVICES

A high-performance, modern power backup and energy storage e-commerce platform built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and **MongoDB**.

Specializing in **Pure Sine Wave Inverters**, **Tall Tubular Batteries**, and **Enterprise Online/Line-Interactive UPS Systems** with doorstep delivery serviceability checks, guest checkout, multi-vendor portal, and quotation consultation.

---

## 🚀 Features

- **Storefront & Product Catalog**: Dedicated browsing for Inverters, High-Cycle Batteries, and UPS systems with quick specifications and WhatsApp direct consultation.
- **Serviceability Checker**: Real-time 6-digit Indian PIN code delivery validation and dynamic regional logistics calculation.
- **Guest Checkout**: Frictionless order placement with no mandatory account creation.
- **Multi-Vendor Portal**: Secure vendor dashboards for product catalog management, order fulfillment, and quotation response.
- **Role-Based Admin Panel**: Comprehensive platform management for admins, categories, certifications, orders, vendors, and platform settings.
- **Security**: JWT-based session security, bcrypt password hashing, and zero client-side credential exposure.
- **Design & Performance**: Built with rich glassmorphism aesthetics, responsive layouts, Tailwind CSS v4, and framer-motion micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering)
- **UI & State**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), Framer Motion, Lucide Icons
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver with SRV/Standard Atlas URI fallback resolver)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Linting & Types**: TypeScript 5, ESLint 9

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/rps-ecommerce.git
cd rps-ecommerce
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=rps_ecommerce

# Authentication Secret
JWT_SECRET=your_secure_random_jwt_secret_key

# Public Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WHATSAPP_PHONE=919346021289
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📦 Building for Production

To create an optimized production build:
```bash
npm run build
npm run start
```

---

## 🛡️ License

Private & Proprietary © RAJ POWER TECH SERVICES (RPS). All rights reserved.
