"""
Data models for Community Solar Coordination Platform
Helps estates, villages, and neighbourhoods plan solar installations together
No legal shares - just coordinated planning and awareness
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CommunityStatus(str, Enum):
    """Community project lifecycle stages"""
    PLANNING = "planning"  # Gathering interest, feasibility phase
    COORDINATING = "coordinating"  # Members coordinating, getting quotes
    INSTALLING = "installing"  # Installation in progress
    ACTIVE = "active"  # Operational, generating energy
    COMPLETED = "completed"  # Project ended


class ParticipantStatus(str, Enum):
    """Participant interest status"""
    INTERESTED = "interested"  # Expressed interest
    COMMITTED = "committed"  # Ready to proceed
    INSTALLED = "installed"  # System installed
    WITHDRAWN = "withdrawn"  # No longer participating


class CommunityLocation(BaseModel):
    """Geographic location of community project"""
    latitude: float
    longitude: float
    address: str
    county: str
    eircode: Optional[str] = None


class SolarFeasibility(BaseModel):
    """Solar potential analysis for a home"""
    annual_energy_kwh: float
    capacity_kwp: float
    mean_solar_flux: float
    estimated_cost_eur: float
    payback_period_years: float
    annual_savings_eur: float  # Changed from revenue
    co2_reduction_kg_year: float
    data_source: str  # "Google Solar API" or "PVGIS"


class HomeParticipant(BaseModel):
    """Individual home participating in community solar"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    address: str
    
    # Solar potential for this specific home
    feasibility: Optional[SolarFeasibility] = None
    
    community_id: str
    status: ParticipantStatus
    
    join_date: datetime
    installation_date: Optional[datetime] = None


class CommunityFinancials(BaseModel):
    """Aggregated financial estimates for community"""
    total_estimated_cost_eur: float
    estimated_cost_per_home_eur: float
    bulk_discount_percentage: float = 0.0  # Discount from coordinating together
    total_annual_savings_eur: float
    average_payback_years: float


class CommunityProject(BaseModel):
    """Community solar coordination project (estate, village, neighbourhood)"""
    id: str
    name: str
    description: str
    location: CommunityLocation  # Center point of community
    status: CommunityStatus
    
    # Aggregate solar potential
    total_capacity_kwp: float = 0.0
    total_annual_energy_kwh: float = 0.0
    total_co2_reduction_kg_year: float = 0.0
    
    # Participation
    participant_count: int = 0
    interested_count: int = 0  # Expressed interest
    committed_count: int = 0  # Ready to proceed
    installed_count: int = 0  # Systems installed
    
    # Financial aggregates
    financials: CommunityFinancials
    
    # Tracking
    created_date: datetime
    updated_date: datetime
    
    # Community coordinator
    coordinator_name: Optional[str] = None
    coordinator_contact: Optional[str] = None
    
    # Installation partners (optional)
    installer_name: Optional[str] = None
    installer_contact: Optional[str] = None


class CommunityDashboard(BaseModel):
    """Real-time dashboard for community solar project"""
    community_id: str
    community_name: str
    status: CommunityStatus
    
    # Participation metrics
    participant_count: int
    interested_count: int
    committed_count: int
    installed_count: int
    
    # Aggregate potential
    total_capacity_kwp: float
    total_annual_energy_kwh: float
    total_annual_savings_eur: float
    
    # Impact
    total_co2_reduction_kg_year: float
    equivalent_trees_planted: int  # 1 tree = ~20kg CO2/year
    equivalent_homes_powered: int
    
    # Cost efficiency
    estimated_cost_per_home_eur: float
    bulk_discount_percentage: float
    total_savings_from_coordination_eur: float


class CreateCommunityRequest(BaseModel):
    """Request to create a new community solar project"""
    name: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=20, max_length=1000)
    
    latitude: float
    longitude: float
    address: str
    county: str
    
    coordinator_name: str
    coordinator_contact: str


class JoinCommunityRequest(BaseModel):
    """Request to join a community solar project"""
    community_id: str
    participant_name: str
    participant_email: str
    participant_phone: Optional[str] = None
    participant_address: str
    
    # Optional: Include their home's solar analysis
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CommunitySearchFilters(BaseModel):
    """Search/filter parameters for finding community projects"""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance_km: Optional[float] = 50.0
    
    county: Optional[str] = None
    status: Optional[List[CommunityStatus]] = None
    
    min_participant_count: Optional[int] = None
    accepting_participants: bool = True

