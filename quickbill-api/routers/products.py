# quickbill-api/routers/products.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import db, format_doc
from auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/products", tags=["Products"])

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    costPrice: float
    stockQty: int
    lowStock: int = 5
    description: Optional[str] = None
    imageUrl: Optional[str] = None

@router.post("/")
async def create_product(product: ProductCreate, current_user = Depends(get_current_user)):
    existing = await db.products.find_one({"sku": product.sku})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    product_dict = product.model_dump()
    product_dict["createdAt"] = datetime.utcnow()
    
    result = await db.products.insert_one(product_dict)
    created = await db.products.find_one({"_id": result.inserted_id})
    return format_doc(created)

@router.get("/")
async def get_products(current_user = Depends(get_current_user)):
    cursor = db.products.find().sort("createdAt", -1)
    products = await cursor.to_list(length=100)
    return [format_doc(p) for p in products]

@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user = Depends(get_current_user)):
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}