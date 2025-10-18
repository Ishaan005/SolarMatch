from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SolarMatch API")

# cors to allow requests from NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to SolarMatch API"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


# Example API endpoint
@app.get("/api/solar/data")
async def get_solar_data():
    return {
        "data": "Sample solar data",
        "timestamp": "2025-10-18"
    }
