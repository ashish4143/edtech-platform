# Premium Test Creation & Management Platform MVP

An advanced, end-to-end fullstack platform designed specifically for coaching institutes. Built using Next.js App Router, PostgreSQL (Neon DB), Prisma ORM, Tailwind CSS, shadcn/ui layout principles, and NextAuth.js role-based security.

## Features at a Glance
- **Intelligent Test Generation Engine**: Specify objective counts, difficulty blends, and topic strings to automatically compile assessments instantly from dynamic un-exhausted question bank pools.
- **Role-Based Control Simulator**: Instantly switch testing simulations between **Admin**, **Teacher**, **Student**, and **Parent** views to evaluate full product flows natively.
- **Distraction-Free Student Assessment Delivery**: Split-screen live exam execution dashboard with continuous low-time sticky countdown alerts and zero-loss answers array submissions.
- **Granular Question Banks**: Full multi-tier categorization across standards (grades) 7 through 12 mapped specifically for Maths and Science tracks.

---

## 🚀 Setup & Installation Reference

### 1. Configure Connection Credentials
Place your raw connection string inside a `.env` file at the root of the project directory. Remove any single quotes or terminal command prefixes like `psql`.

```env
DATABASE_URL="postgresql://neondb_owner:npg_cEwv4Bie3GZO@ep-icy-snow-apb0jrxn-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="secure_super_secret_key_for_edtech_mvp_platform_testing_123"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Synchronize Prisma Database Schema
Push the normalized database definitions directly to your remote Neon PostgreSQL pooled connection:

```bash
npx prisma db push
```

### 3. Seed Target Initial Admins & High-Volume Question Pools
Per instructions, no random mock attempts are pre-seeded. The database seeder securely provisions the requested specific Admin accounts alongside custom MCQs across grades 7 to 12 for Maths and Science:

```bash
npx prisma db seed
```

#### Pre-seeded Account Roles:
- **Ashish Shaw** (Role: `Admin` | Login Email: `ashish@admin.com` | Password: `admin123`)
- **Dilip Shah** (Role: `Admin` | Login Email: `dilip@admin.com` | Password: `admin123`)

---

## 🌐 Continuous Deployment to Vercel

1. Push your repository to a public or private GitHub repository.
2. Log into the [Vercel Dashboard](https://vercel.com) and import your target project repository.
3. Under **Environment Variables** in the project settings, add:
   - `DATABASE_URL` (Set to your exact pooled Neon DB string).
   - `NEXTAUTH_SECRET` (A strong randomly generated hash string).
4. Click **Deploy**. Vercel will automatically run standard Next.js optimized compilation checks and publish the production build.

---

## 📂 Backend Architecture Maps
- `POST /api/tests/generate`: Assembles dynamic un-exhausted matching pools based on runtime criteria.
- `GET /api/tests/:id/export`: Compiles lightweight structural JSON models optimized for fast offline printable paper exports.
- `POST /api/attempts/submit`: Automatically computes objective marking totals while flagging subjective inputs for dashboard scoring.
