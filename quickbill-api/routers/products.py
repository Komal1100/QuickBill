# # quickbill-api/routers/products.py
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from typing import Optional, List
# from database import db, format_doc
# from auth import get_current_user
# from bson import ObjectId
# from datetime import datetime

# router = APIRouter(prefix="/api/products", tags=["Products"])

# class ProductCreate(BaseModel):
#     name: str
#     sku: str
#     category: str
#     price: float
#     costPrice: float
#     stockQty: int
#     lowStock: int = 5
#     description: Optional[str] = None
#     imageUrl: Optional[str] = None

# @router.post("/")
# async def create_product(product: ProductCreate, current_user = Depends(get_current_user)):
#     existing = await db.products.find_one({"sku": product.sku})
#     if existing:
#         raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
#     product_dict = product.model_dump()
#     product_dict["createdAt"] = datetime.utcnow()
    
#     result = await db.products.insert_one(product_dict)
#     created = await db.products.find_one({"_id": result.inserted_id})
#     return format_doc(created)

# @router.get("/")
# async def get_products(current_user = Depends(get_current_user)):
#     cursor = db.products.find().sort("createdAt", -1)
#     products = await cursor.to_list(length=100)
#     return [format_doc(p) for p in products]

# @router.delete("/{product_id}")
# async def delete_product(product_id: str, current_user = Depends(get_current_user)):
#     result = await db.products.delete_one({"_id": ObjectId(product_id)})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Product not found")
#     return {"message": "Product deleted successfully"}


# quickbill-api/routers/products.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument

from database import db, format_doc
from auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])


# ==========================================================
# Pydantic Models
# ==========================================================

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float = Field(gt=0)
    costPrice: float = Field(ge=0)
    stockQty: int = Field(ge=0)
    lowStock: int = Field(default=5, ge=0)
    description: Optional[str] = None
    imageUrl: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    costPrice: Optional[float] = Field(default=None, ge=0)
    stockQty: Optional[int] = Field(default=None, ge=0)
    lowStock: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None
    imageUrl: Optional[str] = None


class RestockRequest(BaseModel):
    quantity: int = Field(gt=0)


# ==========================================================
# Utility Functions
# ==========================================================

def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)


def is_low_stock(product: dict) -> bool:
    """
    A product is considered low stock when:
    stockQty <= lowStock

    This allows each product to define its own threshold.
    """
    return product.get("stockQty", 0) <= product.get("lowStock", 5)


# ==========================================================
# Create Product
# ==========================================================

@router.post("/")
async def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_user)
):
    # Ensure SKU is unique
    existing = await db.products.find_one({"sku": product.sku})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Product with this SKU already exists"
        )

    product_dict = product.model_dump()
    product_dict["createdAt"] = datetime.utcnow()
    product_dict["updatedAt"] = datetime.utcnow()

    result = await db.products.insert_one(product_dict)
    created = await db.products.find_one({"_id": result.inserted_id})

    return format_doc(created)


# ==========================================================
# Get All Products
# ==========================================================

@router.get("/")
async def get_products(
    current_user=Depends(get_current_user)
):
    cursor = db.products.find().sort("createdAt", -1)
    products = await cursor.to_list(length=1000)

    return [format_doc(product) for product in products]


# ==========================================================
# Get Single Product
# ==========================================================

@router.get("/{product_id}")
async def get_product(
    product_id: str,
    current_user=Depends(get_current_user)
):
    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await db.products.find_one({
        "_id": ObjectId(product_id)
    })

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return format_doc(product)


# ==========================================================
# Update Product
# ==========================================================

@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user=Depends(get_current_user)
):
    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    update_data = {
        key: value
        for key, value in product.model_dump().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update"
        )

    # Ensure SKU uniqueness if changing SKU
    if "sku" in update_data:
        existing = await db.products.find_one({
            "sku": update_data["sku"],
            "_id": {"$ne": ObjectId(product_id)}
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Another product with this SKU already exists"
            )

    update_data["updatedAt"] = datetime.utcnow()

    updated = await db.products.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")

    return format_doc(updated)


# ==========================================================
# Delete Product
# ==========================================================

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user=Depends(get_current_user)
):
    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.products.delete_one({
        "_id": ObjectId(product_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }


# ==========================================================
# Restock Product
# ==========================================================

@router.post("/{product_id}/restock")
async def restock_product(
    product_id: str,
    payload: RestockRequest,
    current_user=Depends(get_current_user)
):
    if not is_valid_object_id(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    updated = await db.products.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {
            "$inc": {"stockQty": payload.quantity},
            "$set": {"updatedAt": datetime.utcnow()}
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Stock restocked successfully",
        "product": format_doc(updated)
    }


# ==========================================================
# Low Stock Products
# ==========================================================

@router.get("/low-stock")
async def get_low_stock_products(
    current_user=Depends(get_current_user)
):
    products = await db.products.find().to_list(length=1000)

    low_stock_products = [
        format_doc(product)
        for product in products
        if is_low_stock(product)
    ]

    return {
        "count": len(low_stock_products),
        "products": low_stock_products
    }


# ==========================================================
# Inventory Summary Dashboard
# ==========================================================

@router.get("/summary")
async def inventory_summary(
    current_user=Depends(get_current_user)
):
    products = await db.products.find().to_list(length=1000)

    total_products = len(products)

    total_stock_units = sum(
        product.get("stockQty", 0)
        for product in products
    )

    low_stock_count = sum(
        1 for product in products
        if is_low_stock(product)
    )

    out_of_stock_count = sum(
        1 for product in products
        if product.get("stockQty", 0) == 0
    )

    total_inventory_value = sum(
        product.get("stockQty", 0) *
        product.get("costPrice", 0)
        for product in products
    )

    return {
        "totalProducts": total_products,
        "totalStockUnits": total_stock_units,
        "lowStockProducts": low_stock_count,
        "outOfStockProducts": out_of_stock_count,
        "totalInventoryValue": total_inventory_value
    }
