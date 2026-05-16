⚡ QuickBill(live url : https://quickbill-eight.vercel.app/)
QuickBill is a premium, high-contrast, glassmorphic Point of Sale (POS) Terminal & AI-Powered Analytics Dashboard built for modern store operations. Bypassing rigid translation layers for a pure, lightning-fast async engine, QuickBill provides real-time stock safeguards, smooth browser-printable invoices, and natural language business intelligence.

🛠️ Technology Stack
Frontend (quickbill-ui)
Framework: Next.js 15 (App Router Architecture)

Language: TypeScript

Styling: Tailwind CSS (Deep zinc-950 backdrops, frosted backdrop-blur-xl panels)

State Management: Zustand (Persistent auth state & reactive cashier cart flow)

Data Layouts & Analytics: TanStack Table v8, Recharts

Interactions: Framer Motion, Lucide React

Backend API (quickbill-api)
Framework: FastAPI (Python 3.10+)

Server Gateway: Uvicorn

Database & Driver: MongoDB Atlas via Motor (Async Python MongoDB Driver)

AI Orchestration Layer: Groq API (Utilizing the highly efficient llama-3.1-8b-instant model)

🏗️ Directory Structure
Plaintext
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
    │   │       ├── layout.tsx   # Protected app frame with a glowing sidebar navigation navigation
    │   │       ├── page.tsx     # Bento-Grid Overview Home featuring charts & Live AI Panel
    │   │       ├── pos/         # POS Terminal featuring a reactive cart assembly
    │   │       └── inventory/   # Inventory controller mapped via TanStack Table
    │   └── store/
    │       ├── useAuthStore.ts  # Persistent encrypted customer session flags
    │       └── usePOSStore.ts   # Cashier flow state mapping & temporary transactional holds
🚀 Core Technical Safeguards Implemented
1. Pure Async Python Database Layer
Dropped compilation-heavy ORMs to eliminate environment binary compilation issues (ENOENT). Replaced with a pure, lightweight configuration using the Motor Async MongoDB Driver for zero local compilation overhead and instant database communication.

2. Single-Document Atomic Stock Isolation
To eliminate checkout oversells, the checkout workflow uses MongoDB atomicity on a single-document layer using find_one_and_update combined with conditional matching checks:

JSON
{ "stockQty": { "$gte": item.quantity } }
Multi-item loops are protected by an array inversion handler that triggers an instant manual rollback if mid-checkout failures occur across compound transaction updates.

3. Print-Optimized Hybrid Styles
The system uses specialized CSS media queries (print:) to completely alter the viewport during a print request. On-screen, the application renders deep, rich dark themes to look premium; when window.print() triggers, it automatically switches to a high-contrast, minimal ink layout designed for receipts or standard A4 sheets.

4. Dynamic Text-to-Aggregation AI Translation
The QuickBill Core AI Panel avoids hardcoded responses by executing a dual-chain LLM request through the Groq API:

Translates natural language questions directly into a secure MongoDB aggregation pipeline array [].

Processes the pipeline dynamically, retrieves real documents from your live Atlas cluster, and passes the raw dataset back into llama-3.1-8b-instant to generate friendly, conversational insights.

🏁 Quickstart Installation
1. Setup the Backend API
Navigate to your backend directory, initialize a Python virtual environment, and install dependencies:

Bash
cd quickbill-api
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install fastapi uvicorn motor pydantic groq python-dotenv passlib python-jose
Create a file named env inside the quickbill-api/ directory:

Code snippet
DATABASE_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_signing_key
GROQ_API_KEY=your_groq_api_key
Boot the server instance using Uvicorn:

Bash
uvicorn main:app --reload
2. Setup the Frontend UI
Navigate to your frontend folder and install the UI node packages:

Bash
cd ../quickbill-ui
npm install
Configure your local environment parameters by ensuring your target API base URL aligns with Uvicorn (usually [http://127.0.0.1:8000](http://127.0.0.1:8000)). Then, run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to interact with the dashboard.
