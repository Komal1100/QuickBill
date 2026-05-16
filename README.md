# ⚡ QuickBill

QuickBill is a premium, high-contrast, glassmorphic **Point of Sale (POS) Terminal & AI-Powered Analytics Dashboard** built for modern store operations. Bypassing rigid translation layers for a pure, lightning-fast async engine, QuickBill provides real-time stock safeguards, smooth browser-printable invoices, and natural language business intelligence.

---

## 🛠️ Technology Stack

### Frontend (`quickbill-ui`)
* **Framework:** Next.js 15 (App Router Architecture)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Deep `zinc-950` backdrops, frosted `backdrop-blur-xl` panels)
* **State Management:** Zustand (Persistent auth state & reactive cashier cart flow)
* **Data Layouts & Analytics:** TanStack Table v8, Recharts
* **Interactions:** Framer Motion, Lucide React

### Backend API (`quickbill-api`)
* **Framework:** FastAPI (Python 3.10+)
* **Server Gateway:** Uvicorn
* **Database & Driver:** MongoDB Atlas via Motor (Async Python MongoDB Driver)
* **AI Orchestration Layer:** Groq API (Utilizing the highly efficient `llama-3.1-8b-instant` model)

---

## 🏗️ Directory Structure

```plaintext
├── quickbill-api/               # FastAPI Async Backend Execution Layer
│   ├── env                      # Local environment configuration file
│   ├── main.py                  # Application entrypoint, CORS policies, & Lifecycles
│   ├── database.py              # Motor client initialization & BSON formatting utilities
│   ├── auth.py                  # Passlib hashing contexts & OAuth2 JWT dependencies
│   └── routers/
│       ├── auth.py              # Security token generation tokens
│       ├── products.py          # Inventory matrix tracking & product CRUD
│       ├── orders.py            # Checkout with Single-Document Atomic Stock Logic
│       └── insights.py          # Core AI Engine (Natural Language-to-MongoDB translation)
│
└── quickbill-ui/                # Next.js Frontend Presentation Layer
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx       # Root configuration enforcing global dark mode styling
    │   │   ├── globals.css      # Custom printing layers & glassmorphic base styles
    │   │   ├── page.tsx         # Linear/Apple-inspired glassmorphic login screen
    │   │   └── dashboard/
    │   │       ├── layout.tsx   # Protected app frame with a glowing sidebar navigation
    │   │       ├── page.tsx     # Bento-Grid Overview Home featuring charts & Live AI Panel
    │   │       ├── pos/         # POS Terminal featuring a reactive cart assembly
    │   │       └── inventory/   # Inventory controller mapped via TanStack Table
    │   └── store/
    │       ├── useAuthStore.ts  # Persistent encrypted customer session flags
    │       └── usePOSStore.ts   # Cashier flow state mapping & temporary transactional holds
