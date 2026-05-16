# # quickbill-api/routers/insights.py
# from fastapi import APIRouter, Depends
from auth import get_current_user
# import os
# from groq import AsyncGroq

# router = APIRouter(prefix="/api/insights", tags=["Insights"])

# # Initialize the Groq client
# client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# @router.get("/summary")
# async def get_ai_summary(current_user = Depends(get_current_user)):
#     # Dummy context data (In production, you would fetch this from db.orders and db.products)
#     store_data = {
#         "todays_revenue": 4250.00,
#         "revenue_growth": "+12.5%",
#         "top_category": "Electronics",
#         "low_stock_items": ["Premium Notebook", "Blue Ink Pen", "A4 Paper Bundle", "Stapler Pins"],
#         "total_orders": 142
#     }

#     prompt = f"""
#     You are an expert AI retail assistant for a POS system named QuickBill.
#     Analyze the following daily store data: {store_data}.
#     Write a very concise, professional, 2-sentence business summary.
#     Highlight the revenue growth, the best category, and warn about the specific low stock items.
#     Do not use any markdown formatting, just plain text.
#     """

#     try:
#         # chat_completion = await client.chat.completions.create(
#         #     messages=[{"role": "user", "content": prompt}],
#         #     model="llama3-8b-8192", # Extremely fast model
#         #     temperature=0.5,
#         #     max_tokens=100,
#         # )
#         ai_message = chat_completion.choices[0].message.content.strip()
#         return {"summary": ai_message}
#     except Exception as e:
#         # Graceful fallback if the API key is missing or rate-limited during the interview
#         return {
#             "summary": "AI currently unavailable. Revenue is up 12.5% today, driven by Electronics. Action required: 4 stationery items are critically low on stock."
#         }



from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from groq import AsyncGroq
import json
import os
from datetime import datetime, timedelta
from database import db  # Assuming db handles your motor client connection
from dotenv import load_dotenv

router = APIRouter(prefix="/api/insights", tags=["Insights"])

# Initialize your Groq client using your environment keys
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

class InsightRequest(BaseModel):
    prompt: str

# @router.post("/query")
# async def generate_insights(request: InsightRequest):
#     # Context window injector to let the LLM handle dates seamlessly relative to 2026
#     current_date_context = f"Today's date is {datetime.utcnow().strftime('%Y-%m-%d')} (UTC)."

#     # Step 1: Tell Llama 3 to output ONLY a valid MongoDB aggregation or filter payload
#     translation_system_prompt = f"""
#     You are a database translation engine for a POS system. Your job is to convert natural language into a valid MongoDB pipeline/query array for the 'orders' collection.
#     {current_date_context}

#     Collection Schema Details:
#     - total: float (Total price of the order)
#     - date: string or datetime ISO format
#     - customerName: string
#     - items: array of objects containing [product_id, quantity]

#     Output strictly valid JSON and nothing else. No markdown syntax like ```json, no explanations. 
#     Format example: {{"total": {{"$gt": 500}}}} or an aggregation array [ {{"$match": ...}} ]
#     """

#     try:
#         # Step 1 Call
#         translation_completion = await groq_client.chat.completions.create(
#             model="llama3-8b-8192",
#             messages=[
#                 {"role": "system", "content": translation_system_prompt},
#                 {"role": "user", "content": f"Convert this query to a MongoDB find filter or aggregation pipeline: {request.prompt}"}
#             ],
#             temperature=0.1 # Low temperature for reliable syntax outputs
#         )
        
#         raw_query_string = translation_completion.choices[0].message.content.strip()
        
#         # Clean up any rogue backticks just in case
#         if raw_query_string.startswith("```"):
#             raw_query_string = raw_query_string.replace("```json", "").replace("```", "").strip()

#         mongo_query = json.loads(raw_query_string)

#         # Step 2: Execute dynamically generated query securely against MongoDB
#         # Check if it's a structural pipeline array or a standard key-value find dict
#         if isinstance(mongo_query, list):
#             cursor = db.orders.aggregate(mongo_query)
#             raw_results = await cursor.to_list(length=20)
#         else:
#             cursor = db.orders.find(mongo_query).limit(20)
#             raw_results = await cursor.to_list(length=20)

#         # Sanitize ObjectId string conversions for the upcoming context insertion
#         for doc in raw_results:
#             if "_id" in doc:
#                 doc["_id"] = str(doc["_id"])

#         # Step 3: Send data matrix back to Llama 3 for human contextual synthesis
#         synthesis_system_prompt = """
#         You are Meera's expert business strategist built into QuickBill. 
#         Analyze the raw database results provided and answer the user's initial question in a clear, friendly, and actionable conversational tone.
#         Highlight trends, warn about low stock if relevant, and use bullet points for layout readability. Keep it punchy!
#         """

#         synthesis_completion = await groq_client.chat.completions.create(
#             model="llama3-8b-8192",
#             messages=[
#                 {"role": "system", "content": synthesis_system_prompt},
#                 {"role": "user", "content": f"User Prompt: '{request.prompt}'\n\nRaw Database Results:\n{json.dumps(raw_results)}"}
#             ],
#             temperature=0.7
#         )

#         return {
#             "insights": synthesis_completion.choices[0].message.content,
#             "interpreted_query": mongo_query
#         }

#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="AI produced an unstable database query payload.")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/summary")
async def get_ai_summary(current_user = Depends(get_current_user)):
    # Dummy context data (In production, you would fetch this from db.orders and db.products)
    store_data = {
        "todays_revenue": 4250.00,
        "revenue_growth": "+12.5%",
        "top_category": "Electronics",
        "low_stock_items": ["Premium Notebook", "Blue Ink Pen", "A4 Paper Bundle", "Stapler Pins"],
        "total_orders": 142
    }

    prompt = f"""
    You are an expert AI retail assistant for a POS system named QuickBill.
    Analyze the following daily store data: {store_data}.
    Write a very concise, professional, 2-sentence business summary.
    Highlight the revenue growth, the best category, and warn about the specific low stock items.
    Do not use any markdown formatting, just plain text.
    """

    try:
        chat_completion = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant", # Extremely fast model
            temperature=0.5,
            max_tokens=100,
        )
        ai_message = chat_completion.choices[0].message.content.strip()
        return {"summary": ai_message}
    except Exception as e:
        # Graceful fallback if the API key is missing or rate-limited during the interview
        return {
            "summary": "AI currently unavailable. Revenue is up 12.5% today, driven by Electronics. Action required: 4 stationery items are critically low on stock."
        }


@router.post("/query")
async def generate_insights(request: InsightRequest):
    current_date_context = f"Today's date is {datetime.utcnow().strftime('%Y-%m-%d')} (UTC)."

    # 1. Heavily enforce a strict array response structure in the system prompt
    translation_system_prompt = f"""
    You are a database translation engine for a POS system. Your job is to convert natural language into a valid MongoDB aggregation pipeline array for the 'orders' collection.
    {current_date_context}

    Collection Schema Details:
    - total: float (Total price of the order)
    - date: string (ISO format YYYY-MM-DD)
    - customerName: string
    - items: array of objects containing [product_id, name, quantity, price, total]

    CRITICAL INSTRUCTION: Your output MUST always be a strictly valid JSON array representing a MongoDB aggregation pipeline (wrapped in square brackets `[]`), even if it only contains a single stage like `[ {{"$match": ...}} ]`.
    Output strictly raw JSON. Do not wrap it in markdown code blocks. No descriptions.
    """

    try:
        translation_completion = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": translation_system_prompt},
                {"role": "user", "content": f"Convert this query to a MongoDB aggregation pipeline array: {request.prompt}"}
            ],
            temperature=0.1
        )
        
        raw_query_string = translation_completion.choices[0].message.content.strip()
        
        # Clean up any markdown wraps
        if "```json" in raw_query_string:
            raw_query_string = raw_query_string.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_query_string:
            raw_query_string = raw_query_string.split("```")[1].split("```")[0].strip()

        # Parse the string
        pipeline = json.loads(raw_query_string)

        # 🔥 DEFENSIVE FIX: If the LLM still forgot the array wrapper, wrap it manually!
        if isinstance(pipeline, dict):
            # If they gave us {"$match": ...}, convert it to [{"$match": ...}]
            if any(key.startswith('$') for key in pipeline.keys()):
                pipeline = [pipeline]
            else:
                # If they gave us a plain find dict like {"total": 500}, turn it into a match stage
                pipeline = [{"$match": pipeline}]

        # 2. Always execute as an aggregate pipeline now
        cursor = db.orders.aggregate(pipeline)
        raw_results = await cursor.to_list(length=20)

        # Sanitize ObjectId string conversions
        for doc in raw_results:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])

        # 3. Data Synthesis Chain
        synthesis_system_prompt = """
        You are Meera's expert business strategist built into QuickBill. 
        Analyze the raw database results provided and answer the user's initial question in a clear, friendly, and actionable conversational tone.
        Highlight trends and use bullet points for readability. Keep it punchy!
        """

        synthesis_completion = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": synthesis_system_prompt},
                {"role": "user", "content": f"User Prompt: '{request.prompt}'\n\nRaw Database Results:\n{json.dumps(raw_results)}"}
            ],
            temperature=0.7
        )

        return {
            "insights": synthesis_completion.choices[0].message.content,
            "interpreted_query": pipeline
        }

    except Exception as e:
        print(f"--- INSIGHTS ROUTE CRASH LOG ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {str(e)}")
        if 'raw_query_string' in locals():
            print(f"What the LLM returned: {raw_query_string}")
        print(f"--------------------------------")
        raise HTTPException(status_code=500, detail=str(e))