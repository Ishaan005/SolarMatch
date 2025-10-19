"""
Service layer for Community Solar Coordination Platform
Helps estates, villages, and neighbourhoods plan solar together
No shares - just coordinated planning and bulk discounts
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import math
from models.coop_models import (
    CommunityProject, HomeParticipant, CommunityLocation, SolarFeasibility,
    CommunityFinancials, CommunityStatus, ParticipantStatus, CommunityDashboard,
    CreateCommunityRequest, JoinCommunityRequest, CommunitySearchFilters
)
from .unified_solar_service import unified_solar_service
from .community_repository import community_repository


class CommunityService:
    """Business logic for community solar coordination platform"""
    
    def __init__(self):
        # Use repository layer (works with database or in-memory storage)
        self.repository = community_repository
        self._sample_data_initialized = False
    
    def ensure_sample_data(self):
        """Ensure sample data is loaded (call this after database is initialized)"""
        if self._sample_data_initialized:
            return
        
        self._init_sample_data()
        self._sample_data_initialized = True
    
    def _init_sample_data(self):
        """Initialize with sample Irish community solar projects (only if database is empty)"""
        # Check if we already have communities - don't reinitialize if database has data
        existing = self.repository.list_communities(limit=1)
        if existing:
            print(f"Database already has {len(existing)} communities - skipping sample data initialization")
            return
        
        print("Initializing sample community data...")
        sample_communities = [
            {
                "name": "Ballyduff Estate Solar Initiative",
                "location": {"lat": 52.2593, "lng": -7.1101, "address": "Ballyduff Estate, Co. Waterford", "county": "Waterford"},
                "description": "45-home estate coordinating solar installation for bulk discounts",
                "participants": 28,
                "committed": 18,
                "total_kwp": 168.0,  # Average 6kWp per committed home
                "bulk_discount": 35
            },
            {
                "name": "Connemara Village Green Energy",
                "location": {"lat": 53.5461, "lng": -9.8902, "address": "Clifden, Co. Galway", "county": "Galway"},
                "description": "Village of 60 homes exploring community solar options",
                "participants": 42,
                "committed": 25,
                "total_kwp": 150.0,
                "bulk_discount": 32
            },
            {
                "name": "Dingle Peninsula Solar Group",
                "location": {"lat": 52.1409, "lng": -10.2694, "address": "Dingle Peninsula, Co. Kerry", "county": "Kerry"},
                "description": "Rural community of farms and homes planning solar together",
                "participants": 35,
                "committed": 22,
                "total_kwp": 220.0,  # Some larger farm systems
                "bulk_discount": 38
            },
            {
                "name": "Wicklow Town Solar Collective",
                "location": {"lat": 53.0004, "lng": -6.3833, "address": "Wicklow Town, Co. Wicklow", "county": "Wicklow"},
                "description": "Town residents joining forces for better solar pricing",
                "participants": 56,
                "committed": 34,
                "total_kwp": 204.0,
                "bulk_discount": 40
            }
        ]
        
        for i, data in enumerate(sample_communities):
            community_id = f"community_{i+1}"
            
            # Calculate aggregate financials
            total_kwp = data["total_kwp"]
            committed_homes = data["committed"]
            base_cost_per_kwp = 1500  # EUR per kWp (individual price)
            discounted_cost_per_kwp = base_cost_per_kwp * (1 - data["bulk_discount"]/100)
            
            total_cost = total_kwp * discounted_cost_per_kwp
            cost_per_home = total_cost / committed_homes if committed_homes > 0 else 0
            
            # Annual savings estimates
            annual_energy_kwh = total_kwp * 950  # ~950 kWh per kWp in Ireland
            annual_savings = annual_energy_kwh * 0.35  # 35 cent per kWh saved
            
            # CO2 calculations
            co2_reduction = annual_energy_kwh * 0.4  # 0.4 kg CO2 per kWh
            
            community = CommunityProject(
                id=community_id,
                name=data["name"],
                description=data["description"],
                location=CommunityLocation(
                    latitude=data["location"]["lat"],
                    longitude=data["location"]["lng"],
                    address=data["location"]["address"],
                    county=data["location"]["county"]
                ),
                status=CommunityStatus.COORDINATING if committed_homes >= 15 else CommunityStatus.PLANNING,
                total_capacity_kwp=total_kwp,
                total_annual_energy_kwh=annual_energy_kwh,
                total_co2_reduction_kg_year=co2_reduction,
                participant_count=data["participants"],
                interested_count=data["participants"] - data["committed"],
                committed_count=data["committed"],
                installed_count=0,
                financials=CommunityFinancials(
                    total_estimated_cost_eur=total_cost,
                    estimated_cost_per_home_eur=cost_per_home,
                    bulk_discount_percentage=data["bulk_discount"],
                    total_annual_savings_eur=annual_savings,
                    average_payback_years=6.5
                ),
                created_date=datetime.now(),
                updated_date=datetime.now(),
                coordinator_name="Community Coordinator",
                coordinator_contact="coordinator@example.com"
            )
            self.repository.create_community(community)
    
    async def create_community(self, request: CreateCommunityRequest) -> Dict[str, Any]:
        """Create a new community solar coordination project"""
        community_id = str(uuid.uuid4())
        
        # Initial empty community
        community = CommunityProject(
            id=community_id,
            name=request.name,
            description=request.description,
            location=CommunityLocation(
                latitude=request.latitude,
                longitude=request.longitude,
                address=request.address,
                county=request.county
            ),
            status=CommunityStatus.PLANNING,
            total_capacity_kwp=0.0,
            total_annual_energy_kwh=0.0,
            total_co2_reduction_kg_year=0.0,
            participant_count=0,
            interested_count=0,
            committed_count=0,
            installed_count=0,
            financials=CommunityFinancials(
                total_estimated_cost_eur=0.0,
                estimated_cost_per_home_eur=0.0,
                bulk_discount_percentage=0.0,
                total_annual_savings_eur=0.0,
                average_payback_years=0.0
            ),
            created_date=datetime.now(),
            updated_date=datetime.now(),
            coordinator_name=request.coordinator_name,
            coordinator_contact=request.coordinator_contact
        )
        
        self.repository.create_community(community)
        
        return {
            "success": True,
            "community_id": community_id,
            "community": community
        }
    
    async def join_community(self, request: JoinCommunityRequest) -> Dict[str, Any]:
        """Add a participant to a community project"""
        community = self.repository.get_community(request.community_id)
        if not community:
            raise ValueError(f"Community {request.community_id} not found")
        
        participant_id = str(uuid.uuid4())
        
        # If location provided, analyze their home
        feasibility = None
        if request.latitude and request.longitude:
            try:
                solar_data = await unified_solar_service.get_solar_analysis(
                    request.latitude,
                    request.longitude
                )
                if solar_data.get("success"):
                    analysis = solar_data.get("analysis", {})
                    feasibility = SolarFeasibility(
                        annual_energy_kwh=analysis.get("annual_energy_kwh", 0),
                        capacity_kwp=analysis.get("capacity_kwp", 0),
                        mean_solar_flux=analysis.get("mean_solar_flux", 0),
                        estimated_cost_eur=analysis.get("estimated_cost_eur", 0),
                        payback_period_years=analysis.get("payback_period_years", 0),
                        annual_savings_eur=analysis.get("annual_savings_eur", 0),
                        co2_reduction_kg_year=analysis.get("co2_reduction_kg_year", 0),
                        data_source=solar_data.get("source", "Unknown")
                    )
            except Exception as e:
                print(f"Error analyzing home: {e}")
        
        participant = HomeParticipant(
            id=participant_id,
            name=request.participant_name,
            email=request.participant_email,
            phone=request.participant_phone,
            address=request.participant_address,
            feasibility=feasibility,
            community_id=request.community_id,
            status=ParticipantStatus.INTERESTED,
            join_date=datetime.now()
        )
        
        self.repository.create_participant(participant)
        
        # Update community aggregates
        community.participant_count += 1
        community.interested_count += 1
        
        if feasibility:
            community.total_capacity_kwp += feasibility.capacity_kwp
            community.total_annual_energy_kwh += feasibility.annual_energy_kwh
            community.total_co2_reduction_kg_year += feasibility.co2_reduction_kg_year
        
        # Recalculate bulk discount based on participant count
        community.financials.bulk_discount_percentage = self._calculate_bulk_discount(community.participant_count)
        
        # Recalculate financials
        self._update_community_financials(community)
        
        community.updated_date = datetime.now()
        self.repository.update_community(community)
        
        return {
            "success": True,
            "participant_id": participant_id,
            "participant": participant
        }
    
    def _calculate_bulk_discount(self, participant_count: int) -> float:
        """Calculate bulk discount percentage based on group size"""
        if participant_count >= 50:
            return 40.0
        elif participant_count >= 30:
            return 35.0
        elif participant_count >= 20:
            return 30.0
        elif participant_count >= 10:
            return 25.0
        elif participant_count >= 5:
            return 15.0
        else:
            return 0.0
    
    def _update_community_financials(self, community: CommunityProject):
        """Recalculate community financial estimates"""
        base_cost_per_kwp = 1500  # EUR per kWp (individual pricing)
        discount = community.financials.bulk_discount_percentage
        discounted_cost_per_kwp = base_cost_per_kwp * (1 - discount/100)
        
        total_cost = community.total_capacity_kwp * discounted_cost_per_kwp
        cost_per_home = total_cost / community.participant_count if community.participant_count > 0 else 0
        
        # Savings: assume 35 cent per kWh
        annual_savings = community.total_annual_energy_kwh * 0.35
        
        # Payback: total cost / annual savings
        payback_years = total_cost / annual_savings if annual_savings > 0 else 0
        
        community.financials.total_estimated_cost_eur = total_cost
        community.financials.estimated_cost_per_home_eur = cost_per_home
        community.financials.total_annual_savings_eur = annual_savings
        community.financials.average_payback_years = payback_years
    
    async def search_communities(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        max_distance_km: float = 50.0,
        county: Optional[str] = None,
        status: Optional[List[CommunityStatus]] = None,
        accepting_participants: bool = True
    ) -> List[Dict[str, Any]]:
        """Search for community projects near a location"""
        
        results = []
        
        # Get communities from repository
        communities = self.repository.list_communities(county=county, status=status)
        
        for community in communities:
            # Filter by status
            if status and community.status not in status:
                continue
            
            # Filter by county
            if county and community.location.county.lower() != county.lower():
                continue
            
            # Calculate distance if location provided
            distance_km = None
            if latitude is not None and longitude is not None:
                distance_km = self._calculate_distance(
                    latitude, longitude,
                    community.location.latitude, community.location.longitude
                )
                
                # Filter by distance
                if distance_km > max_distance_km:
                    continue
            
            results.append({
                "id": community.id,
                "name": community.name,
                "description": community.description,
                "location": {
                    "address": community.location.address,
                    "county": community.location.county,
                    "latitude": community.location.latitude,
                    "longitude": community.location.longitude
                },
                "status": community.status.value,
                "participant_count": community.participant_count,
                "committed_count": community.committed_count,
                "distance_km": round(distance_km, 1) if distance_km else None,
                "bulk_discount_pct": community.financials.bulk_discount_percentage,
                "capacity_kwp": community.total_capacity_kwp,
                "annual_energy_kwh": community.total_annual_energy_kwh,
                "annual_savings_eur": community.financials.total_annual_savings_eur,
                "cost_per_home_eur": community.financials.estimated_cost_per_home_eur,
                "accepting_participants": community.status in [CommunityStatus.PLANNING, CommunityStatus.COORDINATING]
            })
        
        # Sort by distance if location provided, otherwise by participant count
        if latitude is not None and longitude is not None:
            results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float('inf'))
        else:
            results.sort(key=lambda x: x["participant_count"], reverse=True)
        
        return results
    
    def get_community(self, community_id: str) -> Optional[CommunityProject]:
        """Get community project by ID"""
        return self.repository.get_community(community_id)
    
    def get_community_dashboard(self, community_id: str) -> Optional[CommunityDashboard]:
        """Get dashboard data for a community"""
        community = self.repository.get_community(community_id)
        if not community:
            return None
        
        # Calculate derived metrics
        equivalent_trees = int(community.total_co2_reduction_kg_year / 20)  # 20kg CO2 per tree per year
        equivalent_homes = int(community.total_annual_energy_kwh / 4200)  # Average Irish home uses ~4200 kWh/year
        
        # Calculate total savings from coordination
        individual_cost = community.total_capacity_kwp * 1500  # No discount
        group_cost = community.financials.total_estimated_cost_eur
        savings_from_coordination = individual_cost - group_cost
        
        return CommunityDashboard(
            community_id=community.id,
            community_name=community.name,
            status=community.status,
            participant_count=community.participant_count,
            interested_count=community.interested_count,
            committed_count=community.committed_count,
            installed_count=community.installed_count,
            total_capacity_kwp=community.total_capacity_kwp,
            total_annual_energy_kwh=community.total_annual_energy_kwh,
            total_annual_savings_eur=community.financials.total_annual_savings_eur,
            total_co2_reduction_kg_year=community.total_co2_reduction_kg_year,
            equivalent_trees_planted=equivalent_trees,
            equivalent_homes_powered=equivalent_homes,
            estimated_cost_per_home_eur=community.financials.estimated_cost_per_home_eur,
            bulk_discount_percentage=community.financials.bulk_discount_percentage,
            total_savings_from_coordination_eur=savings_from_coordination
        )
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula (in km)"""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c


# Global instance
community_service = CommunityService()
