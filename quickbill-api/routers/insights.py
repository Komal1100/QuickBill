# quickbill-api/routers/insights.py
from fastapi import APIRouter, Depends
from auth import get_current_user
import os
from groq import AsyncGroq

router = APIRouter(prefix="/api/insights", tags=["Insights"])

# Initialize the Groq client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

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
        # chat_completion = await client.chat.completions.create(
        #     messages=[{"role": "user", "content": prompt}],
        #     model="llama3-8b-8192", # Extremely fast model
        #     temperature=0.5,
        #     max_tokens=100,
        # )
        ai_message = chat_completion.choices[0].message.content.strip()
        return {"summary": ai_message}
    except Exception as e:
        # Graceful fallback if the API key is missing or rate-limited during the interview
        return {
            "summary": "AI currently unavailable. Revenue is up 12.5% today, driven by Electronics. Action required: 4 stationery items are critically low on stock."
        }