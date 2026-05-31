```markdown
# 🏦 Full-Stack Loan Management System (LMS)

A production-grade, end-to-end lending platform where borrowers apply for loans and internal executives manage those loans through their lifecycle. Built with strict adherence to Role-Based Access Control (RBAC) and data integrity.

---
## 🚀 Tech Stack
* **Frontend:** Next.js 14, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express, TypeScript
* **Database:** MongoDB Atlas
* **Security:** JWT (JSON Web Tokens) & bcrypt

---

## 🔑 Evaluator Test Credentials

A seed script has pre-populated the database with accounts for every role. 
**The password for ALL accounts is:** `Admin123!`

| Role | Login Email | Module Access |
| :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | Full System Access |
| **Sales** | `sales@lms.com` | Sales (Leads) Module Only |
| **Sanction** | `sanction@lms.com` | Sanction Queue Only |
| **Disbursement**| `disbursement@lms.com` | Disbursement Queue Only |
| **Collection** | `collection@lms.com` | Repayments & Collections Only |
| **Borrower** | `borrower@lms.com` | Application Portal Only |

---

## 📁 Project Structure (Monorepo)

The application separates concerns strictly between the Next.js frontend and the Express/Node.js backend.

```text
lms-assignment/
├── .gitignore               # Root gitignore
├── README.md                # Documentation & Setup instructions
│
├── backend/                 # Node.js + Express + TypeScript
│   ├── .env                 # Backend secrets (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   ├── tsconfig.json        # Configured for CommonJS and node16 resolution
│   └── src/
│       ├── config/
│       │   └── db.ts        # MongoDB connection logic
│       ├── controllers/
│       │   ├── authController.ts
│       │   └── loanController.ts
│       ├── middlewares/
│       │   └── authMiddleware.ts # JWT verification & RBAC guard
│       ├── models/
│       │   ├── Loan.ts      # Enums, validation, id transformation
│       │   ├── Payment.ts   # Unique UTR indexing
│       │   └── User.ts      # Bcrypt pre-save hooks
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   └── loanRoutes.ts
│       ├── utils/
│       │   ├── generateToken.ts
│       │   └── loanHelpers.ts # BRE logic and SI Math
│       ├── seed.ts          # Database wipe & RBAC population script
│       └── server.ts        # Entry point & Global error handler
│
└── frontend/                # Next.js App Router + Tailwind CSS
    ├── .env.local           # NEXT_PUBLIC_API_URL
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── globals.css  # Tailwind directives
        │   ├── layout.tsx   # Root layout with Toaster provider
        │   ├── page.tsx     # Root redirect to /login
        │   ├── (auth)/
        │   │   └── login/page.tsx
        │   ├── apply/
        │   │   ├── page.tsx # Multi-step borrower application
        │   │   └── success/page.tsx
        │   └── dashboard/
        │       ├── layout.tsx # Dynamic RBAC sidebar
        │       ├── page.tsx   # Module redirector
        │       ├── collection/page.tsx
        │       ├── disbursement/page.tsx
        │       ├── sales/page.tsx
        │       └── sanction/page.tsx
        └── lib/
            └── api.ts       # Axios instance with JWT interceptor

```

---

## ✨ System Architecture & Features

### 1. The Borrower Portal

A multi-step, dynamic application pipeline featuring:

* **Real-time Business Rule Engine (BRE):** Rejects invalid parameters (Age 23-50, Salary > 25k, Valid PAN, Employment Status) on both the client and server.
* **Live Mathematical Configuration:** Real-time Simple Interest (12% p.a.) and Total Repayment calculation using dynamic sliders (50k - 5L limits).
* **Graceful Handoff:** Clean routing structure pushing completed applications to the Sanction queue.

### 2. The Operations Dashboard (RBAC)

A protected modular dashboard. Executive accounts can **only** access their assigned modules. Any unauthorized API request is intercepted and returned as a `403 Forbidden`.

* **Sales Module:** Tracks pre-application registered users (`LEAD` status).
* **Sanction Module:** Reviews applications. Approves (`SANCTIONED`) or explicitly rejects (`REJECTED` with reason).
* **Disbursement Module:** Authorizes fund releases (`DISBURSED`).
* **Collection Module:** Records incoming payments. Features strict database-level unique indexing on `utrNumber` to prevent double-entry, and an auto-close mathematical trigger when the total paid meets the total repayment amount.

---

## ⚙️ Environment Variables Example

To run this project, you will need to create two environment files.

**1. Backend (`backend/.env`)**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms-db  # Or your MongoDB Atlas URL
JWT_SECRET=super_secret_lms_key_2026

```

**2. Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```

---

## 🛠️ Local Setup & Installation

### Prerequisites

* Node.js (v18 or higher)
* Git
* A MongoDB instance (Local or Atlas Cloud)

### 1. Clone the Repository

```bash
git clone [https://github.com/prajjwalkumar2104/Loan_Management_System.git](https://github.com/prajjwalkumar2104/Loan_Management_System.git)
cd Loan_Management_System

```

### 2. Backend Setup

Open your terminal and navigate to the backend directory:

```bash
cd backend
npm install

```

*Ensure you create the `backend/.env` file as shown in the Environment Variables section.*

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install

```

*Ensure you create the `frontend/.env.local` file as shown in the Environment Variables section.*

### 4. Database Seeding & Running the App

You will need two terminal windows running concurrently.

**Terminal 1 (Backend):**

```bash
cd backend
npm run seed  # Wipes the database and seeds the required RBAC test accounts
npm run dev   # Starts the Express API server on Port 5000

```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev   # Starts the Next.js application

```

The application will now be running on [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).

---

## 👨‍💻 Author

**Prajjwal Kumar** *Full-Stack Developer*

```

```
