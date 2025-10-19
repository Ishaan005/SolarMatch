"""
SQLAlchemy ORM models for Community Solar Coordination Platform
Maps to PostgreSQL tables in Cloud SQL
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Enum as SQLEnum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base
from .coop_models import CommunityStatus, ParticipantStatus
import enum


class CommunityProjectDB(Base):
    """Community solar coordination project - stored in PostgreSQL"""
    __tablename__ = "community_projects"
    
    # Primary key
    id = Column(String(36), primary_key=True)
    
    # Basic info
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(CommunityStatus), nullable=False, default=CommunityStatus.PLANNING, index=True)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    county = Column(String(50), nullable=False, index=True)
    eircode = Column(String(10), nullable=True)
    
    # Aggregate solar potential
    total_capacity_kwp = Column(Float, nullable=False, default=0.0)
    total_annual_energy_kwh = Column(Float, nullable=False, default=0.0)
    total_co2_reduction_kg_year = Column(Float, nullable=False, default=0.0)
    
    # Participation counts
    participant_count = Column(Integer, nullable=False, default=0)
    interested_count = Column(Integer, nullable=False, default=0)
    committed_count = Column(Integer, nullable=False, default=0)
    installed_count = Column(Integer, nullable=False, default=0)
    
    # Financial aggregates
    total_estimated_cost_eur = Column(Float, nullable=False, default=0.0)
    estimated_cost_per_home_eur = Column(Float, nullable=False, default=0.0)
    bulk_discount_percentage = Column(Float, nullable=False, default=0.0)
    total_annual_savings_eur = Column(Float, nullable=False, default=0.0)
    average_payback_years = Column(Float, nullable=False, default=0.0)
    
    # Coordinator info
    coordinator_name = Column(String(100), nullable=True)
    coordinator_contact = Column(String(100), nullable=True)
    
    # Installer info (optional)
    installer_name = Column(String(100), nullable=True)
    installer_contact = Column(String(100), nullable=True)
    
    # Timestamps
    created_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_date = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    participants = relationship("HomeParticipantDB", back_populates="community", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CommunityProject(id={self.id}, name={self.name}, status={self.status})>"


class HomeParticipantDB(Base):
    """Individual home participating in community solar - stored in PostgreSQL"""
    __tablename__ = "home_participants"
    
    # Primary key
    id = Column(String(36), primary_key=True)
    
    # Foreign key to community
    community_id = Column(String(36), ForeignKey("community_projects.id"), nullable=False, index=True)
    
    # Participant info
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=False)
    
    # Solar feasibility data (stored as JSON for flexibility)
    # Contains: annual_energy_kwh, capacity_kwp, mean_solar_flux, estimated_cost_eur, 
    #           payback_period_years, annual_savings_eur, co2_reduction_kg_year, data_source
    feasibility_data = Column(JSON, nullable=True)
    
    # Location (optional - for solar analysis)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Status
    status = Column(SQLEnum(ParticipantStatus), nullable=False, default=ParticipantStatus.INTERESTED, index=True)
    
    # Timestamps
    join_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    installation_date = Column(DateTime, nullable=True)
    
    # Relationships
    community = relationship("CommunityProjectDB", back_populates="participants")
    
    def __repr__(self):
        return f"<HomeParticipant(id={self.id}, name={self.name}, status={self.status})>"
