# quickbill-api/main.py
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from database import db, format_doc
from auth import verify_password, create_access_token, get_password_hash
from datetime import timedelta
from routers import products, orders , insights
from datetime import datetime
import random
from dotenv import load_dotenv
load_dotenv(dotenv_path="./env")
app = FastAPI(title="QuickBill POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000" , "https://quickbill-eight.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
   
)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    email: str


@app.get("/")
async def root():
    return {
        "message": "QuickBill API Running 🚀"
    }

@app.on_event("startup")
async def startup():
    # Seed Demo Credentials directly into MongoDB
    demo_email = "admin@quickbill.com"
    existing_user = await db.users.find_one({"email": demo_email})
    if not existing_user:
        hashed_pw = get_password_hash("admin123")
        await db.users.insert_one({"email": demo_email, "password": hashed_pw})
        print("💡 Demo account seeded successfully via Motor!")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=480)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": user["email"]
    }

@app.post("/api/seed")
async def seed_database():
    # 1. Clear existing data
    await db.products.delete_many({})
    await db.orders.delete_many({})
    
    # 2. Dummy Products
    products = [
        {"name": "Wireless Mouse Pro", "sku": "ELEC-001", "category": "Electronics", "price": 45.00, "costPrice": 20.00, "stockQty": 50, "lowStock": 10, "createdAt": datetime.utcnow()},
        {"name": "Mechanical Keyboard", "sku": "ELEC-002", "category": "Electronics", "price": 120.00, "costPrice": 70.00, "stockQty": 15, "lowStock": 5, "createdAt": datetime.utcnow()},
        {"name": "USB-C Hub", "sku": "ELEC-003", "category": "Electronics", "price": 35.00, "costPrice": 15.00, "stockQty": 4, "lowStock": 10, "createdAt": datetime.utcnow()}, # Low stock example
        {"name": "Premium Moleskine Notebook", "sku": "STAT-001", "category": "Stationery", "price": 24.00, "costPrice": 8.00, "stockQty": 100, "lowStock": 20, "createdAt": datetime.utcnow()},
        {"name": "Gel Pen Set (Black)", "sku": "STAT-002", "category": "Stationery", "price": 12.00, "costPrice": 3.00, "stockQty": 2, "lowStock": 15, "createdAt": datetime.utcnow()}, # Low stock example
    ]
    
    # 3. Insert Products
    result = await db.products.insert_many(products)
    
    # 4. Create dummy orders for today to populate the dashboard stats
    # (Optional, but makes it look real)
    
    return {"message": f"Successfully seeded {len(result.inserted_ids)} products!"}

# Register routers
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(insights.router) 