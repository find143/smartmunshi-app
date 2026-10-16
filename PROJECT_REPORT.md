# Comprehensive Project Report: SmartMunshi App (स्मार्ट मुंशी)

**Project Name:** SmartMunshi (Smart Munshi App)  
**System Category:** Construction Site Management, Labour Attendance & Financial Khata Ledger System  
**Version:** 2.0.0  
**Stack:** Next.js (React 18), TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS, Framer Motion, Lucide Icons  
**Target Deployment:** Vercel Cloud & Neon/Supabase Cloud PostgreSQL  
**Storage Architecture:** High-Performance Indexed 5-Year Financial Archive  

---

## 1. Executive Summary

**SmartMunshi** (स्मार्ट मुंशी) is an enterprise-grade digital management and attendance tracking platform built specifically for civil construction contractors, site supervisors (munshis), and skilled/unskilled site workers. 

In conventional construction environments across South Asia and developing markets, labour attendance, daily wages, emergency advances, and material expenses are managed manually via handwritten notebooks ("Khata Register"). This manual method suffers from high error rates, lost registers, wage calculation disputes, fraud in cash advances, and zero long-term visibility into site budget overruns.

SmartMunshi resolves these pain points by offering a modern, dual-role web application (Contractor Admin View & Labour Self Portal) featuring:
- **Instant Attendance Marking & Automated Wage Computations** (supporting Full-Day, Half-Day, Overday 1.5x, Double-Shift 2.0x, and Hourly Overtime).
- **Dual Language Interface** (English & Hindi) for seamless adoption by non-technical site staff.
- **Financial Khata Ledger & Settlement Management** (Tracking Earned Wages, Paid Advances, Expense Receipts, and Net Liabilities).
- **Labour Self-Service Portal** using secure 4-digit PIN authentication.
- **Immutable Audit Trail & Regulatory Verification safeguards**.
- **1-Click Wage Slips (PDF), Excel Exports (CSV), and WhatsApp Slip Sharing**.

---

## 2. Problem Statement & Business Objectives

### 2.1 The Construction Management Dilemma
1. **Unstructured Attendance Systems:** Workers often work varying shifts (e.g., 1.5 shifts during concrete casting or night shifts). Standard binary attendance apps fail to compute fractional or multiplied wages dynamically.
2. **Untracked Cash Advances:** Daily wage labourers frequently request cash or UPI advances for food, medical emergencies, or home trips. Without instant logging, contractors lose track of deductions during weekend wage payouts.
3. **Material & Site Cash Leakage:** Petty cash spent on diesel, bricks, sand, tea/snacks, and freight lacks categorized digital receipts.
4. **Language & Usability Barrier:** Frontline workers and supervisors struggle with complex English-only ERP software.
5. **Data Longevity Requirements:** Construction projects run for multiple years. Financial and audit logs must remain indexed and queryable for at least 5 years without performance degradation.

### 2.2 Core Project Objectives
- **Zero-Dispute Settlement:** Automated calculation of `Net Payable = (Total Earned Wages) - (Advances Deducted) - (Previous Settlements)`.
- **Sub-Second Search & Query Speed:** Indexed database schema optimized for 5-year archives containing thousands of attendance entries and transactions.
- **Progressive Accessibility:** Works on mobile smartphones and desktop browsers, featuring PWA service-worker capability for offline status awareness.
- **Transparency & Trust:** Multi-channel receipt generation via WhatsApp sharing and downloadable PDF wage slips.

---

## 3. System Architecture & Technology Stack

SmartMunshi follows a modern monolithic full-stack architecture built on **Next.js 14 App Router** with Server Actions and API Routes, connected to a relational **PostgreSQL** database through **Prisma ORM**.

```mermaid
graph TD
    User[Contractor / Site Supervisor / Labour] -->|HTTPS| NextApp[Next.js 14 Frontend & SSR]
    NextApp -->|Dual UI Roles| AdminView[Admin & Contractor Dashboard]
    NextApp -->|Dual UI Roles| LabourView[Labour Self-Service Portal]
    
    NextApp -->|REST API Routes| API[Next.js API Layer /api/*]
    
    API -->|Prisma Client| Prisma[Prisma ORM]
    Prisma -->|Pooled / Direct Session| DB[(PostgreSQL Cloud Database)]
    
    API -->|Audit Log Service| Audit[AuditLog Engine]
    API -->|Export Engine| Exports[PDF / CSV / WhatsApp Share]
```

### 3.1 Stack Breakdown

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (React 18) | Component-driven UI, client-side state management, and SSR routing |
| **Language** | TypeScript | Type safety across API payloads, database models, and component props |
| **Styling & Motion** | Tailwind CSS & Framer Motion | Sleek dark-themed UI, responsive flex/grid layouts, micro-animations |
| **Icons & Design** | Lucide React | Modern crisp vector icons for intuitive navigation |
| **Database & ORM** | PostgreSQL & Prisma ORM v5.19 | Cloud-native relational database with schema migration & type-safe queries |
| **Localization** | Dictionary JSON (`lib/dictionary.ts`) | Real-time bi-directional English and Hindi translation |
| **Offline Awareness** | Service Worker (`/sw.js`) & Navigator Web APIs | Network connectivity status banner and offline PWA foundation |

---

## 4. Database Schema & Data Modeling

The database schema (`prisma/schema.prisma`) is built for **5-year archival integrity** with targeted index strategies on high-frequency query parameters (`date`, `labourId`, `siteId`, `status`).

```mermaid
erDiagram
    Site ||--o{ Attendance : "logs"
    Site ||--o{ Advance : "issues"
    Site ||--o{ Expense : "incurs"
    Site ||--o{ WagePayout : "settles"
    
    Labour ||--o{ Attendance : "records"
    Labour ||--o{ Advance : "receives"
    Labour ||--o{ WagePayout : "gets paid"
    
    Site {
        string id PK
        string name
        string location
        float budget
        string status
    }
    
    Labour {
        string id PK
        string name
        string phone UK
        string pin
        string skill
        float dailyWage
        string status
        string bankName
        string accountNo
        string ifsc
        string upiId
    }

    Attendance {
        string id PK
        string labourId FK
        string siteId FK
        string date
        string status
        float overtimeHours
        float calculatedWage
        boolean selfMarked
        boolean verifiedByAdmin
    }

    Advance {
        string id PK
        string labourId FK
        string siteId FK
        string date
        float amount
        string paymentMode
        string reason
        string status
    }

    Expense {
        string id PK
        string siteId FK
        string category
        float amount
        string date
        string paidBy
        string description
    }

    WagePayout {
        string id PK
        string labourId FK
        string siteId FK
        string date
        float amountPaid
        float advancesDeducted
        float totalEarned
        float netPayable
        string paymentMode
    }

    AuditLog {
        string id PK
        string action
        string entity
        string entityId
        string details
        string performedBy
        datetime timestamp
    }
```

### 4.1 Prisma Models & Indexing Rationale

1. **`Labour`**: Stores profile information, daily wage rate, skill trade classification, 4-digit authentication PIN, and bank/UPI settlement details. Indexed by `status` and `skill`.
2. **`Attendance`**: Links worker to site for a specific `date` (`YYYY-MM-DD`). Compound unique index `@@unique([labourId, date])` prevents duplicate attendance records. Indexed on `[date]`, `[labourId, date]`, and `[siteId]`.
3. **`Advance`**: Records cash/UPI advances issued to workers with mandatory financial reasoning. Indexed on `[labourId, date]`, `[date]`, and `[status]`.
4. **`Expense`**: Manages site procurement and petty cash across categories (`MATERIALS`, `TRANSPORT`, `FOOD_SNACKS`, `TOOLS`, `FUEL`, `MISC`). Indexed on `[siteId, date]`, `[category]`, and `[date]`.
5. **`WagePayout`**: Tracks final ledger settlements, capturing gross earned wages, deducted advances, and net amount paid via UPI/Cash/Bank.
6. **`AuditLog`**: Records administrative actions (`ATTENDANCE_OVERRIDE`, `EXPENSE_ADDED`, `ADVANCE_GIVEN`, `PAYOUT_SETTLED`, `PROFILE_UPDATED`) for audit verification.

---

## 5. Core Functional Modules

### 5.1 Admin / Contractor Overview Dashboard
- **Real-Time Financial Cards:** Active workers count, today's attendance summary, net wage liabilities across all sites, monthly expenditure totals, and pending advances.
- **Quick Action Bar:** Direct modal popups for Registering Labour, Logging Site Expense, and Recording Advance.
- **Site Filtering:** Global dropdown selector to switch between all sites or specific construction sites (e.g., "Metro Station Site", "Residential Tower A").

### 5.2 Labour Master & Khata Directory
- **Trade Skill Classification:** Categorizes workers into 8 trades:
  - Mason (राजमिस्त्री)
  - Helper / Labour (मजदूर)
  - Painter (पेंटर)
  - Carpenter (कारपेंटर)
  - Electrician (इलेक्ट्रिशियन)
  - Plumber (प्लंबर)
  - Welder (वेल्डर)
  - Supervisor (साइट सुपरवाइजर)
- **Financial Balance Ledger:** Displays `Total Earned`, `Advances Taken`, `Settled Payouts`, and `Net Due Balance` for each individual worker.
- **Profile & Payment Management:** Add bank account number, IFSC code, and UPI ID for direct salary transfers.

### 5.3 Attendance Management & Wage Calculation Engine
- **Dynamic Wage Multipliers:**
  - **Full Day (PRESENT):** $1.0 \times \text{Daily Wage}$
  - **Half Day (HALF_DAY):** $0.5 \times \text{Daily Wage}$
  - **Overday (OVERDAY):** $1.5 \times \text{Daily Wage}$
  - **Double Shift (DOUBLE_SHIFT):** $2.0 \times \text{Daily Wage}$
  - **Absent (ABSENT):** $0.0 \times \text{Daily Wage}$
- **Overtime Calculation Formula:**
  $$\text{Calculated Wage} = (\text{Multiplier} \times \text{Daily Wage}) + \left( \text{Overtime Hours} \times \frac{\text{Daily Wage}}{8} \right)$$
- **Admin Verification Status:** Displays whether an attendance entry was self-marked by the worker or verified by the site supervisor.

### 5.4 Site Expense Management
- **Categorized Logging:** Tracks operational expenses with supplier/vendor names, receipt attachments, and payment sources.
- **Category Analytics:** Instant breakdown between building materials, transport/freight, food/tea snacks, hardware tools, fuel, and miscellaneous.

### 5.5 Advance & Wage Settlement System
- **Advance Recording:** Captures date, amount, payment mode (Cash, UPI, Bank), and reason (Emergency, Home Trip, Festival, Medical).
- **Settlement Ledger:** Calculates net payout after deducting pending advances and generates wage settlement slips.

### 5.6 Labour Self-Service Portal
- **PIN-Based Authentication:** Workers log in securely using their phone number and 4-digit PIN.
- **Self Attendance Submission:** Allows workers to mark attendance or view their approved attendance calendar, wage calculations, and advance history.

### 5.7 Multi-Lingual Architecture
- Instant client-side switching between **English** and **Hindi (हिंदी)** for all navigation elements, buttons, status indicators, and skill classifications.

### 5.8 5-Year Reporting, PDF/CSV Export & WhatsApp Slips
- **Automated Summary Reports:** Generates financial summary cards and 100 most recent audit logs.
- **WhatsApp Share Integration:** Pre-formats text slips with wage summaries and direct WhatsApp API links (`https://wa.me/...`).

---

## 6. REST API Specifications

SmartMunshi provides a clean RESTful API suite under `/api/`:

| Endpoint | Method | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `/api/labours` | `GET` | Retrieve list of all workers with computed financial balances | `status`, `skill` |
| `/api/labours` | `POST` | Create a new worker profile | N/A |
| `/api/attendance` | `GET` | Fetch attendance records | `date`, `labourId`, `siteId` |
| `/api/attendance` | `POST` | Mark or update worker attendance | N/A |
| `/api/expenses` | `GET` | List site expenses | `siteId`, `category`, `startDate`, `endDate` |
| `/api/expenses` | `POST` | Log a new site expense | N/A |
| `/api/advances` | `GET` | Retrieve advances given | `labourId`, `siteId`, `status` |
| `/api/advances` | `POST` | Record a new advance | N/A |
| `/api/payouts` | `GET` | Retrieve wage payout settlements | `labourId`, `siteId` |
| `/api/payouts` | `POST` | Execute a wage payout settlement | N/A |
| `/api/sites` | `GET` | Fetch all construction site locations | N/A |
| `/api/reports` | `GET` | Get overall aggregated financial summaries & audit logs | `startDate`, `endDate` |

---

## 7. UI/UX Design & Aesthetic Standard

SmartMunshi strictly follows high-contrast, modern dark-mode aesthetic standards tailored for high readability in outdoor construction environments:

- **Color Palette:**
  - **Background:** Deep Slate (`#020617` / `slate-950`) & Card Containers (`#0f172a` / `slate-900`)
  - **Primary Brand Accents:** Electric Sky Blue (`sky-500` / `sky-600`) & Indigo Gradients
  - **Status Indicators:** Emerald (`emerald-500` - Present/Paid), Amber (`amber-500` - Half Day/Pending), Rose (`rose-500` - Absent/Overdue)
- **Typography:** Clean sans-serif typography hierarchy with bold numerical displays for currency ($\text{₹}$).
- **Interactive Feedback:** Micro-animations powered by Framer Motion, active tab glow effects, hover transitions, and modal backdrop blurs.

---

## 8. Deployment & Environmental Configuration

### 8.1 Prerequisites
- Node.js v18.x or v20.x
- PostgreSQL instance (Neon DB, Supabase, or Vercel Postgres)

### 8.2 Environment Variables (`.env`)

```env
# PostgreSQL Connection Strings
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/smartmunshi?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xyz.neon.tech/smartmunshi?sslmode=require"
```

### 8.3 Build & Deployment Scripts

```bash
# Install dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# Build Next.js production app
npm run build

# Start production server
npm run start
```

---

## 9. Regulatory, Audit & Security Features

1. **Strict Input Constraints & Data Validation Engine (`lib/validation.ts`):**
   - **Mobile Phone Numbers:** Enforces exact 10-digit Indian mobile standard (`/^[6-9]\d{9}$/`), auto-filtering non-numeric characters and blocking invalid lengths.
   - **Authentication PINs:** Restricts PIN inputs strictly to 4 numeric digits (`/^\d{4}$/`).
   - **Financial Wage Rates & Amounts:** Mandates positive non-zero numbers with custom upper/lower limits (e.g. Daily Wage ₹50–₹50,000/day, Expenses/Advances > ₹0).
   - **Banking & UPI Credentials:** Regex validation for 11-character IFSC codes (`/^[A-Z]{4}0[A-Z0-9]{6}$/`), 9–18 digit account numbers, and standard VPA formats (`user@bank`).
   - **Text Sanitization & Length Caps:** Sanitizes and trims worker names, expense notes, and advance reasons while enforcing minimum/maximum character limits.
   - **Server-Side API Guardrails:** All API endpoints (`/api/labours`, `/api/advances`, `/api/expenses`, `/api/payouts`) independently execute server-side payload validation, preventing corrupted database records.

2. **Immutable Audit Logging:** All sensitive modifications (manual attendance overrides, advance approvals, wage settlements) generate an `AuditLog` entry detailing action, entity, user, and timestamp.
3. **Data Consistency Guards:** Database transaction constraints ensure that advance deductions cannot exceed un-settled earned wages without manual contractor sign-off.
4. **Cascading Integrity:** Foreign key relations use explicit `onDelete` handlers (`Cascade` for worker records, `SetNull` for site deletions) preventing orphaned database entries.

---

## 10. Future Roadmap & Enhancement Plan

1. **Facial Recognition & Geofenced Attendance:** AI-powered facial verification and GPS geofencing to auto-verify worker check-ins on site boundaries.
2. **Offline LocalSync (IndexedDB PWA):** Full offline store for attendance marking in remote tunneling or basement sites with zero connectivity, auto-syncing when back online.
3. **SMS & Voice Reminders:** Automated voice call reminders in regional languages for daily attendance verification.
4. **Direct Bank Payout Integration:** RazorpayX / Cashfree Payout API integration for 1-click batch UPI wage disbursemal directly from the app dashboard.

---

## 11. Conclusion

**SmartMunshi** successfully bridges the digital divide in the construction sector. By combining high-performance database indexing (optimized for 5-year archives), flexible attendance rules, financial accountability tools, dual-language capabilities, and a slick user experience, SmartMunshi empowers contractors to eliminate cash leakages, protect worker rights, and streamline site operations.

---
*Report generated for SmartMunshi Project Version 2.0.0*
