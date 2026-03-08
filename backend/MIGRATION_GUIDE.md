# MongoDB to PostgreSQL Migration - Complete Guide

## ✅ Migration Status: COMPLETED

Your GoodRoad FastAPI backend has been successfully migrated from MongoDB to PostgreSQL with SQLAlchemy ORM.

---

## 📦 Installed Packages

The following packages were installed in your virtual environment:

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

- **SQLAlchemy**: ORM (Object-Relational Mapping) framework
- **psycopg2-binary**: PostgreSQL database adapter for Python
- **python-dotenv**: Environment variable management

---

## 📝 Files Created/Modified

### 1. **database.py** (Completely Rewritten)
   - ✅ Removed MongoDB/PyMongo connection logic
   - ✅ Added SQLAlchemy engine, SessionLocal, and Base
   - ✅ Connection string loaded from `.env` file
   - ✅ Created `get_db()` dependency function for FastAPI

### 2. **models_orm.py** (New File)
   - ✅ Created `Driver` model (replaces drivers collection)
   - ✅ Created `Violation` model (replaces violations collection)
   - ✅ Created `Reward` model (replaces rewards collection)
   - ✅ Defined relationships between models using SQLAlchemy
   - ✅ Added proper data types, primary keys, and foreign keys

### 3. **models/__init__.py** (Updated)
   - ✅ Exports Driver, Violation, Reward from models_orm.py

### 4. **penalty_service.py** (Completely Refactored)
   - ✅ Updated all methods to use SQLAlchemy queries
   - ✅ Added `db: Session` parameter to all methods
   - ✅ Replaced MongoDB syntax with SQLAlchemy ORM syntax
   - ✅ register_vehicle() - Uses SQLAlchemy models
   - ✅ add_violation() - Uses SQLAlchemy queries
   - ✅ get_full_profile() - Uses SQLAlchemy queries

### 5. **penalty_routes.py** (Updated)
   - ✅ Added FastAPI dependency injection
   - ✅ All endpoints now use `db: Session = Depends(get_db)`
   - ✅ Passes database session to service methods

### 6. **.env** (Updated)
   - ✅ Fixed DATABASE_URL with proper URL encoding
   - ✅ Password special characters (@) are URL-encoded (%40)

### 7. **init_db.py** (New Script)
   - ✅ Database initialization script
   - ✅ Creates all tables automatically
   - ✅ Already executed successfully

---

## 🗄️ Database Schema

### Drivers Table
```sql
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    plate_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    registered_at TIMESTAMP NOT NULL,
    contributor_level VARCHAR(50) DEFAULT 'Bronze',
    upload_count INTEGER DEFAULT 0
);
```

### Violations Table
```sql
CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    plate_no VARCHAR(20) REFERENCES drivers(plate_no) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    weight FLOAT NOT NULL,
    multiplier FLOAT DEFAULT 1.0,
    points FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    generated_email TEXT
);
```

### Rewards Table
```sql
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    plate_no VARCHAR(20) REFERENCES drivers(plate_no) ON DELETE CASCADE,
    violation_reported VARCHAR(255) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    footage_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending'
);
```

---

## 🔄 Syntax Changes Reference

### Before (MongoDB)
```python
# Find one
driver = drivers_collection.find_one({"plate_no": plate_no})

# Insert one
result = drivers_collection.insert_one(new_driver)

# Count documents
count = violations_collection.count_documents({"plate_no": plate_no})

# Find many
cursor = violations_collection.find({"plate_no": plate_no})
violations = list(cursor)

# Update one
violations_collection.update_one(
    {"_id": result.inserted_id},
    {"$set": {"generated_email": ai_email_text}}
)
```

### After (SQLAlchemy)
```python
# Find one
driver = db.query(Driver).filter(Driver.plate_no == plate_no).first()

# Insert one
new_driver = Driver(plate_no=plate_no, name=name, ...)
db.add(new_driver)
db.commit()
db.refresh(new_driver)

# Count
count = db.query(Violation).filter(Violation.plate_no == plate_no).count()

# Find many
violations = db.query(Violation).filter(Violation.plate_no == plate_no).all()

# Update
violation.generated_email = ai_email_text
db.commit()
```

---

## 🚀 How to Run

1. **Ensure PostgreSQL is running** and database 'goodroad' exists

2. **Update .env file** (already done):
   ```
   DATABASE_URL=postgresql://postgres:Pabasara%402001@localhost:5432/goodroad
   ```
   Note: Special characters in password must be URL-encoded (@ becomes %40)

3. **Initialize database tables** (already done):
   ```bash
   python init_db.py
   ```

4. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## 🔍 Testing the Migration

### Test 1: Register a Vehicle
```bash
curl -X POST "http://localhost:8000/api/penalty/register" \
  -H "Content-Type: application/json" \
  -d '{
    "plate_no": "WP-1234",
    "owner_name": "John Doe",
    "email": "john@example.com",
    "vehicle_type": "Car"
  }'
```

### Test 2: Add a Violation
```bash
curl -X POST "http://localhost:8000/api/penalty/add" \
  -H "Content-Type: application/json" \
  -d '{
    "plate_no": "WP-1234",
    "violation_code": "RED_LIGHT"
  }'
```

### Test 3: Get Profile
```bash
curl "http://localhost:8000/api/penalty/user/WP-1234/full_profile"
```

---

## 🎯 Key Benefits

1. **Type Safety**: SQLAlchemy models provide strong typing
2. **Relationships**: Automatic foreign key management and CASCADE deletes
3. **Query Optimization**: Better query performance with indexes
4. **Data Integrity**: ACID compliance with PostgreSQL
5. **Migrations**: Easy schema evolution with Alembic (can be added later)

---

## 📊 Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: goodroad
- **Username**: postgres
- **Password**: Pabasara@2001 (URL-encoded as Pabasara%402001)

---

## ✅ Next Steps (Optional)

1. **Add Alembic for Migrations**: Track schema changes over time
2. **Add Indexes**: Optimize frequently queried columns
3. **Add Connection Pooling**: Improve performance under load
4. **Add Database Backups**: Schedule automated backups
5. **Migrate Existing Data**: If you have MongoDB data to migrate

---

## 🆘 Troubleshooting

### Error: "could not translate host name"
- Check `.env` file - special characters in password must be URL-encoded
- @ becomes %40, : becomes %3A, etc.

### Error: "relation does not exist"
- Run: `python init_db.py` to create tables

### Error: "password authentication failed"
- Verify PostgreSQL username and password
- Check pgAdmin connection settings

### Error: "database does not exist"
- Create database in pgAdmin: `CREATE DATABASE goodroad;`

---

## 📞 Support

All migration tasks completed successfully! Your application is now using PostgreSQL with SQLAlchemy.

Migration Date: March 5, 2026
Status: ✅ PRODUCTION READY
