# GoodRoad/backend/app/database.py
from pymongo import MongoClient

# 1. Connect to the MongoDB Server running on your machine
client = MongoClient("mongodb://localhost:27017/")

# 2. Create (or connect to) a database named 'goodroad'
db = client["goodroad"]

# 3. Define our collections (like tables in SQL)
drivers_collection = db["drivers"]
violations_collection = db["violations"]
rewards_collection = db["rewards"]  # For dashcam footage submissions

print("Connected to MongoDB successfully!")