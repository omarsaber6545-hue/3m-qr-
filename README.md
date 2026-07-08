# 3M QR Studio - Production Ready AI QR Generator Platform

**3M QR Studio** is a global, production-ready SaaS application that allows users to generate standard QR codes and style them using AI (Stable Diffusion XL + ControlNet QR) while keeping them fully scannable.

## 🚀 Key Features

1. **Robust QR Generator**: Supports URL, plain Text, Emails, Phones, WhatsApp chat links, WiFi access details, SMS messages, PDF documents, vCard contact cards, Calendar Events, and GPS Locations.
2. **AI QR Art Engine**: Integrates Stable Diffusion XL + ControlNet QR using ComfyUI API or Replicate API to overlay rich visuals matching design styles.
3. **Queue Processing**: Manages heavy GPU workloads using Redis and BullMQ background job queues to avoid server congestion.
4. **Real-time Notifications**: Updates the interactive creation studio in real-time with percentage progress markers using WebSockets (Socket.io).
5. **Dynamic QR Scans**: Tracks redirection paths to collect daily scan analytics for users.
6. **SaaS Billing & Subscriptions**: Integrates Stripe for starter, pro, and enterprise tiers, along with one-time credit top-ups.
7. **Simulated Fallbacks**: Automatically falls back to sandbox/mock modes if Stripe or AI API credentials are missing, allowing local development and testing out-of-the-box.
8. **Admin Control Center**: Monitor queue lists, database tables (payments, projects, logs), adjust user role privileges, add custom styles, and review active logs.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion.
- **Backend**: Node.js, NestJS, Prisma, PostgreSQL, Redis, BullMQ, Socket.io.
- **AI Integrations**: Stable Diffusion XL, ControlNet QR, ComfyUI API, Replicate API.
- **Storage**: Cloudinary, Supabase Storage.
- **Payments**: Stripe.
- **Deployment**: Docker, Docker Compose, Nginx (Gzip compression, reverse proxy).

---

## 🏗️ Architecture

```
                      +-------------------+
                      |   Client Browser  |
                      +---------+---------+
                                |
                                | (HTTPS / WebSockets)
                                v
                      +---------+---------+
                      |   Nginx Gateway   |
                      +----+-----------+--+
                           |           |
               (/*)        |           | (/api/*)
                           v           v
            +--------------+--+     +--+--------------+
            |  Next.js App    |     |  NestJS Server  |
            +-----------------+     +--+--------+-----+
                                               |
                                               v (ORM)
                                    +----------+----------+
                                    |     PostgreSQL      |
                                    +----------+----------+
                                               |
                                               v (Job Queues)
                                    +----------+----------+
                                    |  Redis & BullMQ     |
                                    +----------+----------+
                                               |
                                               v (Background worker)
                                    +----------+----------+
                                    |  AI Model / GPU Node|
                                    | (ComfyUI/Replicate) |
                                    +---------------------+
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` in the root folder to `.env`:
```bash
cp .env.example .env
```
Ensure you customize the keys inside `.env` before running in production.

---

## 📦 Quick Start with Docker Compose

Running the entire platform (PostgreSQL, Redis, NestJS, Next.js, and Nginx) is simplified with Docker Compose.

1. Build and start containers in detached mode:
   ```bash
   docker-compose up --build -d
   ```
2. Run database migrations inside the backend container:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```
3. Access the interfaces:
   - **Frontend Application**: `http://localhost` (or port 80/443 mapped through Nginx)
   - **Backend Server API**: `http://localhost/api`
   - **API Swagger Documentation**: `http://localhost/api/docs`

---

## 💻 Local Development Setup

To run NestJS and Next.js locally in development mode:

### 1. Prerequisites
Ensure you have Node.js (v18+) and Docker installed. Run Postgres and Redis locally or via Docker:
```bash
docker run -d --name local-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres_password -e POSTGRES_DB=qr_studio postgres:15-alpine
docker run -d --name local-redis -p 6379:6379 redis:7-alpine
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations and generate the client:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Start the NestJS development server:
   ```bash
   npm run start:dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🧪 Verification & Local Testing

- **Local Payment Sandbox**: In the billing dashboard, click the **Simulate** button next to any plan. This updates your plan and credits immediately in the database by calling the backend mock-upgrade bypass endpoints without needing Stripe webhooks.
- **Local AI QR Simulation**: Submitting an AI QR code generation without configuring Replicate/ComfyUI credentials will execute a local simulation pipeline. The worker delays for 4 seconds (simulating GPU inference) and completes successfully using the standard QR code as the output image.
- **WebSocket Verification**: During generation, watch the progress ring tick from 10% to 100% inside the Studio page. This confirms that connection rooms are working correctly.
