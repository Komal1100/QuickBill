# quickbill-api/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import db, format_doc
from auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["Orders"])

class OrderItemCreate(BaseModel):
    productId: str
    name: str
    quantity: int
    priceAtTime: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    totalAmount: float
    tax: float
    discount: float = 0
    grandTotal: float
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None

@router.post("/")
# async def create_order(order: OrderCreate, current_user = Depends(get_current_user)):
#     updated_items = []
    
#     # 1. Atomic Stock Verification and Deduction loop
#     for item in order.items:
#         # Atomic update criteria: find product by ID AND ensure stockQty >= required quantity
#         result = await db.products.find_one_and_update(
#             {"_id": ObjectId(item.productId), "stockQty": {"$gte": item.quantity}},
#             {"$inc": {"stockQty": -item.quantity}},
#             return_document=False # Returns original document state before deduction
#         )
        
#         if not result:
#             # Rollback any products already processed before this failure
#             for rollback_item in updated_items:
#                 await db.products.update_one(
#                     {"_id": ObjectId(rollback_item["productId"])},
#                     {"$inc": {"stockQty": rollback_item["quantity"]}}
#                 )
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Checkout failed: Insufficient stock or product missing for '{item.name}'."
#             )
        
#         updated_items.append({"productId": item.productId, "quantity": item.quantity})

    # # 2. Store Order details
    # order_dict = order.model_dump()
    # order_dict["status"] = "COMPLETED"
    # order_dict["createdAt"] = datetime.utcnow()
    
    # order_result = await db.orders.insert_one(order_dict)
    # created_order = await db.orders.find_one({"_id": order_result.inserted_id})
    # return format_doc(created_order)


@router.post("/")
async def create_order(
    order: OrderCreate,
    current_user = Depends(get_current_user)
):
    updated_items = []

    # Atomic stock deduction
    for item in order.items:

        result = await db.products.find_one_and_update(
            {
                "_id": ObjectId(item.productId),
                "stockQty": {"$gte": item.quantity}
            },
            {
                "$inc": {"stockQty": -item.quantity}
            },
            return_document=False
        )

        if not result:

            # Rollback
            for rollback_item in updated_items:
                await db.products.update_one(
                    {
                        "_id": ObjectId(
                            rollback_item["productId"]
                        )
                    },
                    {
                        "$inc": {
                            "stockQty":
                            rollback_item["quantity"]
                        }
                    }
                )

            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{item.name}'"
            )

        updated_items.append({
            "productId": item.productId,
            "quantity": item.quantity
        })

    # Create Order
    order_dict = order.model_dump()

    order_dict["status"] = "COMPLETED"

    order_dict["createdAt"] = datetime.utcnow()

    result = await db.orders.insert_one(order_dict)

    created_order = await db.orders.find_one({
        "_id": result.inserted_id
    })

    formatted = format_doc(created_order)

    # FRONTEND SAFE FIELDS

    formatted["date"] = formatted["createdAt"]

    return formatted

@router.get("/")
async def get_orders(current_user = Depends(get_current_user)):
    cursor = db.orders.find().sort("createdAt", -1)
    orders = await cursor.to_list(length=100)
    return [format_doc(o) for o in orders]