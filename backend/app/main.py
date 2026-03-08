from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models_orm

from app.api.routes.penalty_routes import router as penalty_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GoodRoad API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(penalty_router, prefix="/api/penalty")

@app.get("/api/health")
def health():
    return {"ok": True}
