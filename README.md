# رفيق الصحة - Senior Care Companion

<div dir="rtl">

نظام متكامل لإدارة الرعاية الصحية لكبار السن — مصمم للعمل في المستشفيات الكبيرة والعيادات ومراكز الرعاية وكذلك للاستخدام الشخصي للعائلات.

A comprehensive elderly care health management system — built for large hospitals, clinics, care centers, and personal family use.

</div>

---

## 🌟 Features

### 🏥 Multi-Organization Support
- **4 organization types**: Hospital, Clinic, Care Center, Personal
- Multi-department & multi-staff management
- Scalable from a single family to a large hospital network
- Role-based access control (Senior, Caregiver, Doctor, Nurse, Admin)

### 👤 Senior Care Interface
- 🚨 **Emergency SOS button** — instant one-tap emergency calling
- 💊 **Medication reminders** — daily schedule with "take" tracking
- 👨‍👩‍👧 **Family contacts** — quick-call family members & doctors
- 📊 **Health summary** — heart rate, blood pressure, blood sugar, oxygen level
- 🏃 **Activity tracker** — steps, active minutes, calories
- 🎤 **Voice assistant** — AI-powered Arabic voice helper (z-ai-web-dev-sdk)

### 🏢 Hospital Dashboard
- Real-time statistics with trend indicators
- Patient distribution & status visualization
- Health trends charts (Recharts — area & bar charts)
- Today's appointments overview
- Recent alerts feed
- Quick actions for common tasks
- 5 tabs: Overview · Patients · Appointments · Alerts · Analytics

### 📋 Patient Management (Full CRUD)
- Add / edit / delete / search patients
- Patient types: **inpatient**, **outpatient**, **home care**
- Room & bed assignment
- Medical conditions, allergies, blood type, insurance info
- Medical record numbers (auto-generated)

### 📅 Appointment Scheduling
- 4 appointment types: consultation, followup, checkup, emergency
- Status tracking: scheduled → confirmed → in-progress → completed
- Doctor assignment & department linking
- Today's appointments view

### 🔔 Notification Center
- Severity levels: critical, high, medium, low
- Mark as read / mark all as read
- Filter by unread / critical
- Type-based icons (emergency, medication, appointment, health)

### ⚙️ Settings Panel
- Appearance (Arabic / English, light / dark / auto theme)
- Notifications (push, SMS, email)
- Voice & accessibility
- Data & privacy (auto-backup, data retention)
- Data export

### 🎙️ Onboarding Wizard
- Step-by-step setup for new users
- Visual organization-type selection
- Automatic demo-data seeding

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York) |
| **UI Library** | Radix UI primitives, Lucide icons |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Database** | Prisma ORM + SQLite |
| **State** | React hooks (client), REST API (server) |
| **AI** | z-ai-web-dev-sdk (LLM, voice, TTS, ASR) |
| **Forms** | React Hook Form + Zod |
| **Notifications** | Sonner toasts |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 18  or  [Bun](https://bun.sh/) ≥ 1.0
- A SQLite database (auto-created)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Koko7777949/senior-care-companion.git
cd senior-care-companion

# 2. Install dependencies
bun install        # or: npm install

# 3. Configure environment
cp .env.example .env   # then edit DATABASE_URL if needed

# 4. Set up the database
bun run db:generate    # generate Prisma client
bun run db:push        # create/sync tables

# 5. Start the dev server
bun run dev
```

Open <http://localhost:3000> — the onboarding wizard will appear on first run and seed demo data automatically.

### Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema → database |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate` | Create & run migration |
| `bun run db:seed` | Seed demo data |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main app entry (auth + onboarding + senior view)
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── api/
│       ├── init/                 # First-run initialization & demo seeding
│       ├── auth/                 # Login / signup / logout
│       ├── organization/         # Organization CRUD
│       ├── patients/             # Patient CRUD
│       ├── appointments/         # Appointment scheduling
│       ├── medications/          # Medication catalog + reminders
│       │   └── take/             # Mark medication as taken
│       ├── health/               # Health readings
│       ├── activity/             # Activity logs
│       ├── contacts/             # Emergency contacts
│       ├── reminders/            # General reminders
│       ├── alerts/               # Alerts / notifications
│       ├── emergency/            # Emergency call sessions
│       ├── calls/                # Call session history
│       ├── user/                 # User profile
│       └── assistant/            # AI voice assistant (server-side SDK)
├── components/
│   ├── senior/                   # Senior-facing widgets
│   │   ├── EmergencyButton.tsx
│   │   ├── MedicationReminder.tsx
│   │   ├── FamilyContact.tsx
│   │   ├── ActivityTracker.tsx
│   │   ├── VoiceAssistant.tsx
│   │   ├── HealthStatusCard.tsx
│   │   └── QuickActions.tsx
│   ├── hospital/
│   │   └── HospitalDashboard.tsx
│   ├── management/
│   │   ├── ManagementPanel.tsx   # Tabbed admin (patients, meds, contacts…)
│   │   ├── MedicationManager.tsx
│   │   ├── ContactManager.tsx
│   │   ├── ReminderManager.tsx
│   │   ├── HealthManager.tsx
│   │   └── SettingsPanel.tsx
│   ├── onboarding/
│   │   └── OnboardingWizard.tsx
│   └── ui/                       # shadcn/ui component library
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── patient.ts                # Default-patient resolver helper
│   ├── utils.ts                  # cn() and utilities
│   └── store.ts                  # Zustand store
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.ts
└── prisma/
    └── schema.prisma             # Full database schema (15+ models)
```

---

## 🗄️ Data Model

The Prisma schema includes 15+ models covering the full domain:

| Model | Purpose |
|---|---|
| `Organization` | Hospitals, clinics, care centers, personal |
| `Department` | Hospital departments (with capacity) |
| `User` | All users (seniors, caregivers, doctors, nurses, admins) |
| `Patient` | Elderly patients (inpatient / outpatient / home care) |
| `CaregiverRelation` | Caregiver ↔ senior relationships |
| `CaregiverAssignment` | Assign caregivers to patients |
| `Medication` | Global medication catalog |
| `MedicationReminderEntry` | Per-patient medication schedule & taken status |
| `HealthReading` | Vitals: heart rate, BP, blood sugar, oxygen |
| `ActivityLog` | Steps, movement, calories |
| `Appointment` | Scheduled visits |
| `Alert` | Notifications & emergency alerts |
| `Reminder` | General reminders |
| `EmergencyContact` | Family / doctor contacts |
| `VoiceCommand` | Voice assistant history |
| `CallSession` | Call logs |
| `AuditLog` | Compliance audit trail |
| `OrganizationSetting` | Per-org configuration |
| `OTPCode` | Phone/email verification |

---

## 🔌 API Reference

All endpoints are REST and return `{ success: boolean, ... }`.

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/init` | Check / run first-time initialization |
| `POST` | `/api/auth` | Login, signup, logout (`action` field) |
| `GET/POST/PUT/DELETE` | `/api/organization` | Organization management |
| `GET/POST/PUT/DELETE` | `/api/patients` | Patient CRUD |
| `GET/POST/PUT/DELETE` | `/api/appointments` | Appointment CRUD |
| `GET/POST/PUT/DELETE` | `/api/medications` | Medication CRUD |
| `POST/GET` | `/api/medications/take` | Mark medication as taken |
| `GET/POST` | `/api/health` | Health readings |
| `GET/POST` | `/api/activity` | Activity logs |
| `GET/POST/PUT/DELETE` | `/api/contacts` | Emergency contacts |
| `GET/POST/PUT/DELETE` | `/api/reminders` | General reminders |
| `GET/POST/PUT` | `/api/alerts` | Alerts management |
| `POST` | `/api/assistant` | AI voice/text assistant (server-side) |

---

## 🎨 Design System

- **RTL-first** Arabic interface (with English fallback)
- **shadcn/ui** New-York style components
- **Tailwind CSS 4** utility classes
- **Framer Motion** page & element transitions
- **Dark mode** support via `next-themes`
- **Mobile-first** responsive layout with sticky footer
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Color palette**: warm amber/orange for senior care, blue for hospital, purple for admin

---

## 🔐 Security Notes

- Passwords are hashed with **SHA-256** before storage
- The `.env` file is git-ignored — never commit secrets
- The SQLite database file (`db/*.db`) is git-ignored
- Server-side AI SDK calls only (`z-ai-web-dev-sdk` is never imported in client components)

---

## 📝 License

This project is provided as-is for educational and demonstration purposes.

---

## 👥 Roles & Permissions

| Role | Access |
|---|---|
| **Senior** (كبير السن) | Personal care view, medications, contacts, voice assistant |
| **Caregiver** (مقدم الرعاية) | Manage medications, contacts, reminders, health |
| **Doctor** (طبيب) | Hospital dashboard, patients, appointments, health |
| **Nurse** (ممرض) | Patient care, medications, health readings |
| **Admin** (مدير النظام) | Full system access including settings & user management |

---

<div align="center">

**Built with ❤️ for our elders**

رفيق الصحة — رفيقك في رحلة العناية

</div>
