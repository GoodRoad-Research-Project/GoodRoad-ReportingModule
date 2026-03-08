#!/usr/bin/env python3
"""
Database Initialization Script
Run this script to create all database tables in PostgreSQL.

Usage:
    python init_db.py
"""

from app.database import engine, Base
from app.models import Driver, Violation, Reward

def init_database():
    """
    Create all database tables defined in the models.
    This will not drop existing tables or data.
    """
    print("🔧 Initializing PostgreSQL database...")
    print(f"📍 Creating tables for: Driver, Violation, Reward")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\n📋 Tables created:")
        print("   - drivers")
        print("   - violations")
        print("   - rewards")
        print("\n🎉 Database is ready to use!")
        
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print("\n💡 Make sure:")
        print("   1. PostgreSQL server is running")
        print("   2. Database 'goodroad' exists")
        print("   3. Connection details in .env are correct")
        raise

if __name__ == "__main__":
    init_database()
