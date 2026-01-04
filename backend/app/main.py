from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.penalty_routes import router as penalty_router

app = FastAPI(title="GoodRoad API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(penalty_router, prefix="/api/penalty")

@app.get("/api/health")
def health():
    return {"ok": True}
