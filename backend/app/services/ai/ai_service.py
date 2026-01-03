import os
import google.generativeai as genai

# --- CONFIGURATION ---
# Your Google Key (from your code snippet)
os.environ["GEMINI_API_KEY"] = "AIzaSyAlPLTHOx5cRsTJAiXtrMWrauf6yz_X92U"

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_violation_email(driver_name, driver_email, plate_no, violation_label, points, expiry_date):
    """
    Generates a personalized warning email using Google Gemini AI.
    Includes error handling and model auto-discovery.
    """
    
    # 1. The Prompt
    prompt = f"""
    You are the 'GoodRoad Traffic Enforcement AI'.
    Write a formal email body to a driver.
    
    --- DATA ---
    Driver Name: {driver_name}
    Vehicle No: {plate_no}
    Violation Type: {violation_label}
    Date/Time: {expiry_date.strftime("%Y-%m-%d %H:%M")}
    Added Points: {points}
    Expiry Date: {expiry_date.strftime("%Y-%m-%d")}
    
    --- INSTRUCTIONS ---
    1. Start with "Dear {driver_name},"
    2. State clearly that a violation was detected.
    3. Mention the penalty points and expiry.
    4. Add a safety tip related to {violation_label}.
    5. End with "Safe Driving, GoodRoad Enforcement Team".
    6. Keep it professional and concise.
    """

    try:
        # 2. AUTO-DISCOVERY: Find a working model
        # This asks Google: "What models are available for this key?"
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        # Pick the best available model
        model_name = 'models/gemini-1.5-flash' # Default preference
        
        # If default isn't there, try to find a 'flash' or 'pro' model
        if model_name not in available_models:
            for m in available_models:
                if 'flash' in m:
                    model_name = m
                    break
                elif 'pro' in m:
                    model_name = m
                    break
            else:
                # If all else fails, take the first available one
                if available_models:
                    model_name = available_models[0]
        
        print(f"Using AI Model: {model_name}") # This will print in your terminal so you know it works

        # 3. Call the Model
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"AI Error: {e}")
        return f"Error generating email: {str(e)}"