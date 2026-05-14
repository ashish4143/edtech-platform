# EdTech Assessment & Coaching Platform

A production-grade, highly scalable EdTech platform designed specifically for coaching institutes. This platform transitions traditional, offline coaching operations into a robust digital ecosystem, emphasizing administrative control, automated test dispatch, and batch-level performance analytics.

## 🏢 Designed for Coaching Institutes

Unlike typical B2C platforms where users self-register, this platform is tailored to the operational realities of a coaching institute:

1. **Admin-Provisioned Accounts**: To prevent unauthorized access to proprietary test materials, student accounts are exclusively created by institute administrators. Students are enrolled physically, and admins provision their digital accounts via a single-entry form or bulk CSV upload.
2. **Secure First-Time Access**: Upon account creation, the system auto-generates secure, temporary credentials and dispatches a welcome email. Upon first login, students hit a strict "Force Password Change" gate, ensuring immediate account security.
3. **Batch Management Pipeline**: Coaching institutes group students into batches (e.g., "12th CBSE Morning", "Foundation 8th"). The platform allows admins to create batches, assign students, and perform **one-click bulk test dispatches** to an entire batch simultaneously.
4. **Automated Magic Links**: When a test is dispatched to a batch, the system queues and sends secure "Magic Links" via email to all enrolled students, bypassing login friction while maintaining security.

## 🚀 Key Features

### For Administrators & Instructors
- **Comprehensive Dashboard**: High-level metrics on total students, tests, questions, and active assignments.
- **Bulk Onboarding**: Upload a CSV to instantly provision hundreds of student accounts and assign them to specific grades and boards.
- **Batch-Level Analytics**: View performance distribution charts, top-performer leaderboards, and test-wise completion rates per batch to identify areas needing instructional focus.
- **Test Generation Wizard**: Create custom assessments from a centralized Question Bank with adjustable durations, passing marks, and strict scheduled availability windows.

### For Students
- **Distraction-Free Test Interface**: Full-screen, responsive assessment environment with real-time countdowns, question navigation palettes, and progress tracking.
- **Practice & Revision Hub**: A dedicated space where students can replay incorrectly answered questions (Mistakes) or review saved questions (Bookmarks) without affecting their official scores.
- **Performance Reports**: Individualized dashboards displaying chronological score trends, chapter-wise mastery heatmaps, and peer percentile rankings.

## 🏗️ Technical Architecture

The platform is built using a modern, scalable web stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on Neon)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Styling**: Tailwind CSS & [Lucide React](https://lucide.dev/) for iconography
- **Charts**: [Recharts](https://recharts.org/) for analytics visualization
- **Email Dispatch**: Nodemailer with a custom rate-limited Queueing System to prevent SMTP timeouts during batch dispatches.

### High-Performance Database Design
The Prisma schema features `Batch`, `BatchEnrollment`, and `BatchTestDispatch` models to support the institute hierarchy. Critical tables (`Attempt`, `AttemptAnswer`, `TestAssignment`) utilize **compound indexes** to ensure analytics queries execute in milliseconds, even under high traffic loads.

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashish4143/edtech-platform.git
   cd edtech-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file with the following:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_SECRET="your_secure_random_string"
   NEXTAUTH_URL="http://localhost:3000"
   
   # SMTP Configuration for Email Dispatch
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 📜 Seeded Data & Roles
The database seed script automatically generates 10 pre-configured tests across various grades (7th to 12th) and seeds default admin accounts and demo students to test the workflow immediately.

- **Admin Login**: `ashish@admin.com` / `admin123`
- **Student Login**: `student1@edtech.com` / `student123`

---
*Built to scale education and streamline coaching operations.*
