"""
Repository layer for Community Solar data access
Handles conversion between SQLAlchemy models and Pydantic models
Falls back to in-memory storage if database is not available
"""

# pyright: reportGeneralTypeIssues=false
# pyright: reportAttributeAccessIssue=false
# type: ignore

from typing import List, Optional, Dict
from datetime import datetime

from .database import get_db_session, is_database_available
from models.db_models import CommunityProjectDB, HomeParticipantDB
from models.coop_models import (
    CommunityProject, HomeParticipant, CommunityLocation, SolarFeasibility,
    CommunityFinancials, CommunityStatus, ParticipantStatus
)


class CommunityRepository:
    """
    Data access layer for community solar projects.
    Uses PostgreSQL when available, falls back to in-memory storage.
    """
    
    def __init__(self):
        # Fallback in-memory storage (for development/testing)
        self._memory_communities: Dict[str, CommunityProject] = {}
        self._memory_participants: Dict[str, HomeParticipant] = {}
        # Don't check database availability at init time - check on each operation
        self._use_database = None
    
    def reset_database_cache(self):
        """
        Reset the cached database availability check.
        Should be called after database initialization.
        """
        self._use_database = None
    
    @property
    def _should_use_database(self) -> bool:
        """Check if database should be used (lazy evaluation)"""
        # Cache the result after first check
        if self._use_database is None:
            self._use_database = is_database_available()
        return self._use_database
    
    # ============ Community CRUD Operations ============
    
    def create_community(self, community: CommunityProject) -> CommunityProject:
        """Create a new community project"""
        if self._should_use_database:
            return self._create_community_db(community)
        else:
            self._memory_communities[community.id] = community
            return community
    
    def get_community(self, community_id: str) -> Optional[CommunityProject]:
        """Get a community by ID"""
        if self._should_use_database:
            return self._get_community_db(community_id)
        else:
            return self._memory_communities.get(community_id)
    
    def update_community(self, community: CommunityProject) -> CommunityProject:
        """Update an existing community"""
        if self._should_use_database:
            return self._update_community_db(community)
        else:
            self._memory_communities[community.id] = community
            return community
    
    def delete_community(self, community_id: str) -> bool:
        """Delete a community"""
        if self._should_use_database:
            return self._delete_community_db(community_id)
        else:
            if community_id in self._memory_communities:
                del self._memory_communities[community_id]
                return True
            return False
    
    def list_communities(
        self,
        county: Optional[str] = None,
        status: Optional[List[CommunityStatus]] = None,
        limit: int = 100
    ) -> List[CommunityProject]:
        """List communities with optional filters"""
        if self._should_use_database:
            return self._list_communities_db(county, status, limit)
        else:
            results = list(self._memory_communities.values())
            
            # Apply filters
            if county:
                results = [c for c in results if c.location.county.lower() == county.lower()]
            if status:
                results = [c for c in results if c.status in status]
            
            return results[:limit]
    
    # ============ Participant CRUD Operations ============
    
    def create_participant(self, participant: HomeParticipant) -> HomeParticipant:
        """Add a participant to a community"""
        if self._should_use_database:
            return self._create_participant_db(participant)
        else:
            self._memory_participants[participant.id] = participant
            return participant
    
    def get_participant(self, participant_id: str) -> Optional[HomeParticipant]:
        """Get a participant by ID"""
        if self._should_use_database:
            return self._get_participant_db(participant_id)
        else:
            return self._memory_participants.get(participant_id)
    
    def list_participants(self, community_id: str) -> List[HomeParticipant]:
        """List all participants in a community"""
        if self._should_use_database:
            return self._list_participants_db(community_id)
        else:
            return [p for p in self._memory_participants.values() if p.community_id == community_id]
    
    def update_participant(self, participant: HomeParticipant) -> HomeParticipant:
        """Update a participant"""
        if self._should_use_database:
            return self._update_participant_db(participant)
        else:
            self._memory_participants[participant.id] = participant
            return participant
    
    # ============ Database Implementation ============
    
    def _create_community_db(self, community: CommunityProject) -> CommunityProject:
        """Create community in database"""
        with get_db_session() as session:
            db_community = CommunityProjectDB(
                id=community.id,
                name=community.name,
                description=community.description,
                status=community.status,
                latitude=community.location.latitude,
                longitude=community.location.longitude,
                address=community.location.address,
                county=community.location.county,
                eircode=community.location.eircode,
                total_capacity_kwp=community.total_capacity_kwp,
                total_annual_energy_kwh=community.total_annual_energy_kwh,
                total_co2_reduction_kg_year=community.total_co2_reduction_kg_year,
                participant_count=community.participant_count,
                interested_count=community.interested_count,
                committed_count=community.committed_count,
                installed_count=community.installed_count,
                total_estimated_cost_eur=community.financials.total_estimated_cost_eur,
                estimated_cost_per_home_eur=community.financials.estimated_cost_per_home_eur,
                bulk_discount_percentage=community.financials.bulk_discount_percentage,
                total_annual_savings_eur=community.financials.total_annual_savings_eur,
                average_payback_years=community.financials.average_payback_years,
                coordinator_name=community.coordinator_name,
                coordinator_contact=community.coordinator_contact,
                installer_name=community.installer_name,
                installer_contact=community.installer_contact,
                created_date=community.created_date,
                updated_date=community.updated_date
            )
            session.add(db_community)
            session.commit()
            session.refresh(db_community)
            return self._db_to_pydantic_community(db_community)
    
    def _get_community_db(self, community_id: str) -> Optional[CommunityProject]:
        """Get community from database"""
        with get_db_session() as session:
            db_community = session.query(CommunityProjectDB).filter_by(id=community_id).first()
            if db_community:
                return self._db_to_pydantic_community(db_community)
            return None
    
    def _update_community_db(self, community: CommunityProject) -> CommunityProject:
        """Update community in database"""
        with get_db_session() as session:
            db_community = session.query(CommunityProjectDB).filter_by(id=community.id).first()
            if not db_community:
                raise ValueError(f"Community {community.id} not found")
            
            # Update fields
            db_community.name = community.name
            db_community.description = community.description
            db_community.status = community.status
            db_community.total_capacity_kwp = community.total_capacity_kwp
            db_community.total_annual_energy_kwh = community.total_annual_energy_kwh
            db_community.total_co2_reduction_kg_year = community.total_co2_reduction_kg_year
            db_community.participant_count = community.participant_count
            db_community.interested_count = community.interested_count
            db_community.committed_count = community.committed_count
            db_community.installed_count = community.installed_count
            db_community.total_estimated_cost_eur = community.financials.total_estimated_cost_eur
            db_community.estimated_cost_per_home_eur = community.financials.estimated_cost_per_home_eur
            db_community.bulk_discount_percentage = community.financials.bulk_discount_percentage
            db_community.total_annual_savings_eur = community.financials.total_annual_savings_eur
            db_community.average_payback_years = community.financials.average_payback_years
            db_community.updated_date = datetime.utcnow()
            
            session.commit()
            session.refresh(db_community)
            return self._db_to_pydantic_community(db_community)
    
    def _delete_community_db(self, community_id: str) -> bool:
        """Delete community from database"""
        with get_db_session() as session:
            db_community = session.query(CommunityProjectDB).filter_by(id=community_id).first()
            if db_community:
                session.delete(db_community)
                session.commit()
                return True
            return False
    
    def _list_communities_db(
        self,
        county: Optional[str] = None,
        status: Optional[List[CommunityStatus]] = None,
        limit: int = 100
    ) -> List[CommunityProject]:
        """List communities from database"""
        with get_db_session() as session:
            query = session.query(CommunityProjectDB)
            
            # Apply filters
            if county:
                query = query.filter(CommunityProjectDB.county.ilike(f"%{county}%"))
            if status:
                query = query.filter(CommunityProjectDB.status.in_(status))
            
            db_communities = query.limit(limit).all()
            return [self._db_to_pydantic_community(c) for c in db_communities]
    
    def _create_participant_db(self, participant: HomeParticipant) -> HomeParticipant:
        """Create participant in database"""
        with get_db_session() as session:
            # Convert feasibility to JSON
            feasibility_json = None
            if participant.feasibility:
                feasibility_json = participant.feasibility.dict()
            
            db_participant = HomeParticipantDB(
                id=participant.id,
                community_id=participant.community_id,
                name=participant.name,
                email=participant.email,
                phone=participant.phone,
                address=participant.address,
                feasibility_data=feasibility_json,
                status=participant.status,
                join_date=participant.join_date,
                installation_date=participant.installation_date
            )
            session.add(db_participant)
            session.commit()
            session.refresh(db_participant)
            return self._db_to_pydantic_participant(db_participant)
    
    def _get_participant_db(self, participant_id: str) -> Optional[HomeParticipant]:
        """Get participant from database"""
        with get_db_session() as session:
            db_participant = session.query(HomeParticipantDB).filter_by(id=participant_id).first()
            if db_participant:
                return self._db_to_pydantic_participant(db_participant)
            return None
    
    def _list_participants_db(self, community_id: str) -> List[HomeParticipant]:
        """List participants from database"""
        with get_db_session() as session:
            db_participants = session.query(HomeParticipantDB).filter_by(community_id=community_id).all()
            return [self._db_to_pydantic_participant(p) for p in db_participants]
    
    def _update_participant_db(self, participant: HomeParticipant) -> HomeParticipant:
        """Update participant in database"""
        with get_db_session() as session:
            db_participant = session.query(HomeParticipantDB).filter_by(id=participant.id).first()
            if not db_participant:
                raise ValueError(f"Participant {participant.id} not found")
            
            # Update fields
            db_participant.name = participant.name
            db_participant.email = participant.email
            db_participant.phone = participant.phone
            db_participant.address = participant.address
            db_participant.status = participant.status
            db_participant.installation_date = participant.installation_date
            
            if participant.feasibility:
                db_participant.feasibility_data = participant.feasibility.dict()
            
            session.commit()
            session.refresh(db_participant)
            return self._db_to_pydantic_participant(db_participant)
    
    # ============ Conversion Helpers ============
    
    def _db_to_pydantic_community(self, db_community: CommunityProjectDB) -> CommunityProject:  # type: ignore[misc]
        """Convert SQLAlchemy model to Pydantic model"""
        return CommunityProject(  # type: ignore[arg-type]
            id=str(db_community.id),
            name=str(db_community.name),
            description=str(db_community.description),
            location=CommunityLocation(
                latitude=float(db_community.latitude), # type: ignore
                longitude=float(db_community.longitude), # type: ignore
                address=str(db_community.address),
                county=str(db_community.county),
                eircode=str(db_community.eircode) if db_community.eircode else None
            ),
            status=db_community.status, # type: ignore
            total_capacity_kwp=float(db_community.total_capacity_kwp), # type: ignore
            total_annual_energy_kwh=float(db_community.total_annual_energy_kwh), # type: ignore
            total_co2_reduction_kg_year=float(db_community.total_co2_reduction_kg_year), # type: ignore
            participant_count=int(db_community.participant_count), # type: ignore
            interested_count=int(db_community.interested_count), # type: ignore
            committed_count=int(db_community.committed_count), # type: ignore
            installed_count=int(db_community.installed_count), # type: ignore
            financials=CommunityFinancials(
                total_estimated_cost_eur=float(db_community.total_estimated_cost_eur), # type: ignore
                estimated_cost_per_home_eur=float(db_community.estimated_cost_per_home_eur), # type: ignore
                bulk_discount_percentage=float(db_community.bulk_discount_percentage), # type: ignore
                total_annual_savings_eur=float(db_community.total_annual_savings_eur), # type: ignore
                average_payback_years=float(db_community.average_payback_years) # type: ignore
            ),
            created_date=db_community.created_date, # type: ignore
            updated_date=db_community.updated_date,  # type: ignore
            coordinator_name=str(db_community.coordinator_name) if db_community.coordinator_name else None,
            coordinator_contact=str(db_community.coordinator_contact) if db_community.coordinator_contact else None,
            installer_name=str(db_community.installer_name) if db_community.installer_name else None,
            installer_contact=str(db_community.installer_contact) if db_community.installer_contact else None
        )
    
    def _db_to_pydantic_participant(self, db_participant: HomeParticipantDB) -> HomeParticipant:  # type: ignore[misc]
        """Convert SQLAlchemy model to Pydantic model"""
        feasibility = None
        if db_participant.feasibility_data:
            feasibility = SolarFeasibility(**db_participant.feasibility_data) # type: ignore
        
        return HomeParticipant(  # type: ignore[arg-type]
            id=db_participant.id,  # type: ignore
            name=db_participant.name,  # type: ignore
            email=db_participant.email,  # type: ignore
            phone=db_participant.phone,  # type: ignore
            address=db_participant.address,  # type: ignore
            feasibility=feasibility,
            community_id=db_participant.community_id,  # type: ignore
            status=db_participant.status,  # type: ignore
            join_date=db_participant.join_date,  # type: ignore
            installation_date=db_participant.installation_date  # type: ignore
        )


# Global repository instance
community_repository = CommunityRepository()
