# quickbill-api/database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("DATABASE_URL")
# Extract database name or default to 'quickbill'
client = AsyncIOMotorClient(MONGO_URL)
db = client["quickbill"]
# Helper to format MongoDB's _id ObjectId into a clean string id for frontend
def format_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc