import os
from groq import Groq

# --- CONFIGURATION ---
# 1. Get your FREE key from https://console.groq.com/keys
os.environ["GROQ_API_KEY"] = "gsk_..." # <--- PASTE YOUR KEY INSIDE THESE QUOTES

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_violation_email(driver_name, driver_email, plate_no, violation_label, points, expiry_date):
    """
    Generates a personalized warning email using Llama-3 AI.
    Inputs match the sketch: Name, Violation Type, Points, Expiry.
    """
    
    # 1. The Prompt Template (Based on your friend's sketch)
    prompt = f"""
    You are the 'GoodRoad Traffic Enforcement AI'.
    Write a formal email body to a driver.
    
    --- DATA ---
    Driver Name: {driver_name}
    Vehicle No: {plate_no}
    Violation Type: {violation_label}
    Date/Time: {expiry_date.strftime("%Y-%m-%d %H:%M")} (Violation Time)
    Added Points: {points}
    Expiry Date: {expiry_date.strftime("%Y-%m-%d")}
    
    --- INSTRUCTIONS ---
    1. Start with "Dear {driver_name},"
    2. State clearly that a violation was detected.
    3. Mention the specific violation and the penalty points added.
    4. Mention when these points will expire.
    5. Add a short educational safety tip related to {violation_label}.
    6. End with "Safe Driving, GoodRoad Enforcement Team".
    7. Keep it professional and concise.
    """

    try:
        # 2. Call the AI Model
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful traffic safety assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama3-8b-8192",
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error generating email: {str(e)}"