from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'pfa-admin-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    user: AdminUser

class DashboardStats(BaseModel):
    impact_score: int
    days_active: int
    total_incidents: int
    total_activities: int
    total_missing: int
    total_sos: int
    pending_volunteers: int

class Incident(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    description: str
    location: str
    status: str = "pending"
    severity: str = "medium"
    reported_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncidentCreate(BaseModel):
    type: str
    description: str
    location: str
    severity: str = "medium"
    reported_by: str

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    description: str
    location: str
    volunteer_id: str
    volunteer_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityCreate(BaseModel):
    type: str
    description: str
    location: str
    volunteer_id: str
    volunteer_name: str

class MissingReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_type: str
    description: str
    location: str
    status: str = "lost"
    contact: str
    reported_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MissingReportCreate(BaseModel):
    animal_type: str
    description: str
    location: str
    status: str = "lost"
    contact: str
    reported_by: str

class SOSAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    location: str
    urgency: str = "high"
    status: str = "active"
    reported_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class SOSAlertCreate(BaseModel):
    description: str
    location: str
    urgency: str = "high"
    reported_by: str

class Volunteer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    location: str
    status: str = "pending"
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VolunteerCreate(BaseModel):
    name: str
    email: str
    phone: str
    location: str

class VolunteerUpdate(BaseModel):
    status: str

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.get("/")
async def root():
    return {"message": "PFA Admin API"}

@api_router.post("/auth/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    
    if not admin:
        if login_data.email == "admin@pfa.org" and login_data.password == "admin123":
            hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
            admin_data = {
                "id": str(uuid.uuid4()),
                "email": "admin@pfa.org",
                "name": "Aditya",
                "password": hashed_password.decode('utf-8'),
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.admins.insert_one(admin_data)
            admin = admin_data
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    stored_password = admin.get("password", "")
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), stored_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token_payload = {
        "sub": admin["id"],
        "email": admin["email"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    if isinstance(admin['created_at'], str):
        admin['created_at'] = datetime.fromisoformat(admin['created_at'])
    
    admin_user = AdminUser(**{k: v for k, v in admin.items() if k != 'password'})
    
    return AdminLoginResponse(token=token, user=admin_user)

@api_router.get("/auth/me", response_model=AdminUser)
async def get_current_admin(payload: dict = Depends(verify_token)):
    admin = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if isinstance(admin['created_at'], str):
        admin['created_at'] = datetime.fromisoformat(admin['created_at'])
    
    return AdminUser(**admin)

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(payload: dict = Depends(verify_token)):
    admin = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    total_incidents = await db.incidents.count_documents({})
    total_activities = await db.activities.count_documents({})
    total_missing = await db.missing_reports.count_documents({})
    total_sos = await db.sos_alerts.count_documents({})
    pending_volunteers = await db.volunteers.count_documents({"status": "pending"})
    
    created_at = admin.get('created_at')
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    days_active = (datetime.now(timezone.utc) - created_at).days
    
    impact_score = total_incidents + total_activities + (total_sos * 2)
    
    return DashboardStats(
        impact_score=impact_score,
        days_active=days_active,
        total_incidents=total_incidents,
        total_activities=total_activities,
        total_missing=total_missing,
        total_sos=total_sos,
        pending_volunteers=pending_volunteers
    )

@api_router.get("/incidents", response_model=List[Incident])
async def get_incidents(payload: dict = Depends(verify_token)):
    incidents = await db.incidents.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for incident in incidents:
        for field in ['created_at', 'updated_at']:
            if isinstance(incident[field], str):
                incident[field] = datetime.fromisoformat(incident[field])
    return incidents

@api_router.post("/incidents", response_model=Incident)
async def create_incident(incident_data: IncidentCreate, payload: dict = Depends(verify_token)):
    incident = Incident(**incident_data.model_dump())
    doc = incident.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.incidents.insert_one(doc)
    return incident

@api_router.put("/incidents/{incident_id}", response_model=Incident)
async def update_incident(incident_id: str, status: str, payload: dict = Depends(verify_token)):
    incident = await db.incidents.find_one({"id": incident_id}, {"_id": 0})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    await db.incidents.update_one(
        {"id": incident_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    incident['status'] = status
    incident['updated_at'] = datetime.now(timezone.utc)
    for field in ['created_at', 'updated_at']:
        if isinstance(incident[field], str):
            incident[field] = datetime.fromisoformat(incident[field])
    
    return Incident(**incident)

@api_router.get("/activities", response_model=List[Activity])
async def get_activities(payload: dict = Depends(verify_token)):
    activities = await db.activities.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for activity in activities:
        if isinstance(activity['created_at'], str):
            activity['created_at'] = datetime.fromisoformat(activity['created_at'])
    return activities

@api_router.post("/activities", response_model=Activity)
async def create_activity(activity_data: ActivityCreate, payload: dict = Depends(verify_token)):
    activity = Activity(**activity_data.model_dump())
    doc = activity.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.activities.insert_one(doc)
    return activity

@api_router.get("/missing", response_model=List[MissingReport])
async def get_missing_reports(payload: dict = Depends(verify_token)):
    reports = await db.missing_reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for report in reports:
        for field in ['created_at', 'updated_at']:
            if isinstance(report[field], str):
                report[field] = datetime.fromisoformat(report[field])
    return reports

@api_router.post("/missing", response_model=MissingReport)
async def create_missing_report(report_data: MissingReportCreate, payload: dict = Depends(verify_token)):
    report = MissingReport(**report_data.model_dump())
    doc = report.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.missing_reports.insert_one(doc)
    return report

@api_router.put("/missing/{report_id}", response_model=MissingReport)
async def update_missing_report(report_id: str, status: str, payload: dict = Depends(verify_token)):
    report = await db.missing_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.missing_reports.update_one(
        {"id": report_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    report['status'] = status
    report['updated_at'] = datetime.now(timezone.utc)
    for field in ['created_at', 'updated_at']:
        if isinstance(report[field], str):
            report[field] = datetime.fromisoformat(report[field])
    
    return MissingReport(**report)

@api_router.get("/sos", response_model=List[SOSAlert])
async def get_sos_alerts(payload: dict = Depends(verify_token)):
    alerts = await db.sos_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for alert in alerts:
        if isinstance(alert['created_at'], str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
        if alert.get('resolved_at') and isinstance(alert['resolved_at'], str):
            alert['resolved_at'] = datetime.fromisoformat(alert['resolved_at'])
    return alerts

@api_router.post("/sos", response_model=SOSAlert)
async def create_sos_alert(alert_data: SOSAlertCreate, payload: dict = Depends(verify_token)):
    alert = SOSAlert(**alert_data.model_dump())
    doc = alert.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sos_alerts.insert_one(doc)
    return alert

@api_router.put("/sos/{alert_id}", response_model=SOSAlert)
async def resolve_sos_alert(alert_id: str, payload: dict = Depends(verify_token)):
    alert = await db.sos_alerts.find_one({"id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    resolved_time = datetime.now(timezone.utc)
    await db.sos_alerts.update_one(
        {"id": alert_id},
        {"$set": {"status": "resolved", "resolved_at": resolved_time.isoformat()}}
    )
    
    alert['status'] = "resolved"
    alert['resolved_at'] = resolved_time
    if isinstance(alert['created_at'], str):
        alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    
    return SOSAlert(**alert)

@api_router.get("/volunteers", response_model=List[Volunteer])
async def get_volunteers(payload: dict = Depends(verify_token)):
    volunteers = await db.volunteers.find({}, {"_id": 0}).sort("joined_at", -1).to_list(1000)
    for volunteer in volunteers:
        if isinstance(volunteer['joined_at'], str):
            volunteer['joined_at'] = datetime.fromisoformat(volunteer['joined_at'])
    return volunteers

@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(volunteer_data: VolunteerCreate):
    volunteer = Volunteer(**volunteer_data.model_dump())
    doc = volunteer.model_dump()
    doc['joined_at'] = doc['joined_at'].isoformat()
    await db.volunteers.insert_one(doc)
    return volunteer

@api_router.put("/volunteers/{volunteer_id}", response_model=Volunteer)
async def update_volunteer(volunteer_id: str, update_data: VolunteerUpdate, payload: dict = Depends(verify_token)):
    volunteer = await db.volunteers.find_one({"id": volunteer_id}, {"_id": 0})
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    
    await db.volunteers.update_one(
        {"id": volunteer_id},
        {"$set": {"status": update_data.status}}
    )
    
    volunteer['status'] = update_data.status
    if isinstance(volunteer['joined_at'], str):
        volunteer['joined_at'] = datetime.fromisoformat(volunteer['joined_at'])
    
    return Volunteer(**volunteer)

@api_router.delete("/volunteers/{volunteer_id}")
async def delete_volunteer(volunteer_id: str, payload: dict = Depends(verify_token)):
    result = await db.volunteers.delete_one({"id": volunteer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return {"message": "Volunteer deleted successfully"}

class AnalyticsInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    title: str
    description: str
    confidence: int
    trend: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PatternDetection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pattern_name: str
    description: str
    confidence: int
    duration: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GeographicData(BaseModel):
    state: str
    district: str
    city: str
    latitude: float
    longitude: float
    incident_count: int
    severity: str

@api_router.get("/analytics/insights")
async def get_analytics_insights(payload: dict = Depends(verify_token)):
    total_incidents = await db.incidents.count_documents({})
    pending_incidents = await db.incidents.count_documents({"status": "pending"})
    
    insights = [
        {
            "id": "1",
            "type": "critical",
            "title": "Recurring Hotspots",
            "description": "14 locations with repeated incidents/week",
            "confidence": 92,
            "trend": "+28%",
            "severity": "high"
        },
        {
            "id": "2",
            "type": "seasonal",
            "title": "Seasonal Spike",
            "description": "Cruelty cases increased during festivals",
            "confidence": 87,
            "trend": "+28%",
            "severity": "medium"
        },
        {
            "id": "3",
            "type": "stable",
            "title": "Cruelty Velocity",
            "description": "Incident rate has dropped significantly",
            "confidence": 94,
            "trend": "-2%",
            "severity": "stable"
        },
        {
            "id": "4",
            "type": "strong",
            "title": "Prevention Score",
            "description": "Feeding drives correlate with reduced conflict",
            "confidence": 86,
            "trend": "0.86",
            "severity": "positive"
        }
    ]
    
    return insights

@api_router.get("/analytics/patterns")
async def get_pattern_detections(payload: dict = Depends(verify_token)):
    patterns = [
        {
            "id": "1",
            "pattern_name": "Post-festival displacement surge",
            "description": "Confidence Level: 92% - Expected Duration: 48h",
            "type": "detected",
            "severity": "warning"
        },
        {
            "id": "2",
            "pattern_name": "Construction Site Recurring Incidents",
            "description": "Sector 4, Rohini - 5 Cases / 24h",
            "type": "new_cluster",
            "severity": "critical"
        },
        {
            "id": "3",
            "pattern_name": "Pre-Diwali Anxiety Spikes",
            "description": "National Trend - +10% vs Last Week",
            "type": "seasonal",
            "severity": "medium"
        },
        {
            "id": "4",
            "pattern_name": "Positive Impact: Feeding Drives",
            "description": "South District - Conflict reduced by 46%",
            "type": "correlation",
            "severity": "positive"
        }
    ]
    
    return patterns

@api_router.get("/analytics/geographic")
async def get_geographic_data(payload: dict = Depends(verify_token)):
    geo_data = [
        {
            "state": "Delhi",
            "district": "North Delhi",
            "city": "Rohini",
            "latitude": 28.7495,
            "longitude": 77.0736,
            "incident_count": 42,
            "severity": "high",
            "status": "Monitor"
        },
        {
            "state": "Delhi",
            "district": "South Delhi",
            "city": "Saket",
            "latitude": 28.5245,
            "longitude": 77.2072,
            "incident_count": 28,
            "severity": "medium",
            "status": "Stable"
        },
        {
            "state": "Delhi",
            "district": "East Delhi",
            "city": "Mayur Vihar",
            "latitude": 28.6082,
            "longitude": 77.2986,
            "incident_count": 15,
            "severity": "low",
            "status": "Safe"
        }
    ]
    
    stats = {
        "high_feeding_zones": 85,
        "recurring_cruelty_areas": 24,
        "repeated_complaints": 142,
        "intervention_regions": 7
    }
    
    return {"locations": geo_data, "stats": stats}

@api_router.get("/analytics/trends")
async def get_trend_data(payload: dict = Depends(verify_token)):
    trends = {
        "accident": [
            {"month": "May", "count": 65},
            {"month": "Jun", "count": 72},
            {"month": "Jul", "count": 58},
            {"month": "Aug", "count": 89},
            {"month": "Sep", "count": 95},
            {"month": "Oct", "count": 112}
        ],
        "cruelty": [
            {"month": "May", "count": 32},
            {"month": "Jun", "count": 38},
            {"month": "Jul", "count": 28},
            {"month": "Aug", "count": 45},
            {"month": "Sep", "count": 51},
            {"month": "Oct", "count": 48}
        ]
    }
    
    impact_data = [
        {"frequency": 1, "incidents": 145},
        {"frequency": 2, "incidents": 132},
        {"frequency": 3, "incidents": 118},
        {"frequency": 4, "incidents": 98},
        {"frequency": 5, "incidents": 76}
    ]
    
    return {"trends": trends, "impact": impact_data}

@api_router.get("/analytics/clusters")
async def get_cluster_data(payload: dict = Depends(verify_token)):
    clusters = {
        "urban": 324,
        "semi_urban": 189,
        "rural": 92
    }
    
    district_data = [
        {"district": "South", "count": 245},
        {"district": "East", "count": 312},
        {"district": "West", "count": 198},
        {"district": "North", "count": 276},
        {"district": "Ctrl", "count": 156},
        {"district": "Rur", "count": 89}
    ]
    
    return {"clusters": clusters, "districts": district_data}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()