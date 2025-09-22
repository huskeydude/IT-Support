from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, time
import hashlib
import json
import base64
import requests
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Summit IT Services API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Models
class AppointmentCreate(BaseModel):
    name: str
    email: str
    phone: str
    service_type: str
    location: str
    preferred_date: str
    preferred_time: str
    description: Optional[str] = ""

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service_type: str
    location: str
    preferred_date: str
    preferred_time: str
    description: Optional[str] = ""
    status: str = "pending"  # pending, confirmed, completed, cancelled
    admin_notes: Optional[str] = ""
    confirmed_date: Optional[str] = None
    confirmed_time: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    confirmed_date: Optional[str] = None
    confirmed_time: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    token: str
    message: str

# Helper functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, date):
                data[key] = value.isoformat()
            elif isinstance(value, time):
                data[key] = value.strftime('%H:%M:%S')
    return data

def parse_from_mongo(item):
    """Parse datetime strings back from MongoDB"""
    if isinstance(item, dict):
        for key, value in item.items():
            if key in ['created_at', 'updated_at'] and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

def create_admin_token(username: str) -> str:
    """Create a simple admin token"""
    payload = f"{username}:{datetime.now(timezone.utc).isoformat()}"
    return base64.b64encode(payload.encode()).decode()

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin token"""
    try:
        token = credentials.credentials
        decoded = base64.b64decode(token).decode()
        username = decoded.split(':')[0]
        if username == os.environ.get('ADMIN_USERNAME', 'yRoot'):
            return username
        raise HTTPException(status_code=401, detail="Invalid token")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Summit IT Services API"}

# Appointment routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    """Create a new appointment request"""
    try:
        appointment = Appointment(**appointment_data.dict())
        appointment_dict = prepare_for_mongo(appointment.dict())
        
        result = await db.appointments.insert_one(appointment_dict)
        if result.inserted_id:
            return appointment
        raise HTTPException(status_code=500, detail="Failed to create appointment")
    except Exception as e:
        logging.error(f"Error creating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(admin: str = Depends(verify_admin_token)):
    """Get all appointments (admin only)"""
    try:
        appointments = await db.appointments.find().to_list(1000)
        return [Appointment(**parse_from_mongo(apt)) for apt in appointments]
    except Exception as e:
        logging.error(f"Error fetching appointments: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, update_data: AppointmentUpdate, admin: str = Depends(verify_admin_token)):
    """Update appointment status and details (admin only)"""
    try:
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.appointments.update_one(
            {"id": appointment_id},
            {"$set": update_dict}
        )
        
        if result.modified_count:
            updated_appointment = await db.appointments.find_one({"id": appointment_id})
            if updated_appointment:
                # If appointment is confirmed, trigger calendar and email
                if update_data.status == "confirmed":
                    # TODO: Add Google Calendar integration
                    # TODO: Add email confirmation
                    pass
                return Appointment(**parse_from_mongo(updated_appointment))
        
        raise HTTPException(status_code=404, detail="Appointment not found")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin authentication routes
@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(login_data: AdminLogin):
    """Admin login"""
    try:
        if (login_data.username == os.environ.get('ADMIN_USERNAME', 'yRoot') and 
            login_data.password == os.environ.get('ADMIN_PASSWORD', 'password123')):
            token = create_admin_token(login_data.username)
            return AdminToken(token=token, message="Login successful")
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during admin login: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/admin/verify")
async def verify_admin(admin: str = Depends(verify_admin_token)):
    """Verify admin token"""
    return {"message": "Token valid", "username": admin}

# Services data
@api_router.get("/services")
async def get_services():
    """Get available services"""
    services = [
        {
            "id": "pc-repair", 
            "name": "PC/Laptop Repair & Support",
            "description": "Complete hardware and software troubleshooting, virus removal, and system optimization.",
            "icon": "🖥️"
        },
        {
            "id": "networking", 
            "name": "Wi-Fi & Networking",
            "description": "Network setup, Wi-Fi optimization, router configuration, and connectivity solutions.",
            "icon": "📶"
        },
        {
            "id": "custom-builds", 
            "name": "Custom PC Builds",
            "description": "Custom computer builds tailored to your needs - gaming, business, or workstations.",
            "icon": "⚙️"
        },
        {
            "id": "business-support", 
            "name": "Business IT Support",
            "description": "Comprehensive IT support for small businesses including maintenance and consulting.",
            "icon": "🏢"
        },
        {
            "id": "general-consult", 
            "name": "General Consultation",
            "description": "Expert IT consultation and advice for your technology needs and planning.",
            "icon": "💡"
        }
    ]
    return services

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()