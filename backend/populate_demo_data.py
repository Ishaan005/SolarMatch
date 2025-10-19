"""
Populate demo data for St. Stephen's Green area co-op in Dublin
Creates a realistic community solar project with 12 participants
"""

import sys
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from core.database import init_database, get_db_session
from models.db_models import CommunityProjectDB, HomeParticipantDB
from models.coop_models import CommunityStatus, ParticipantStatus
import random

# St. Stephen's Green coordinates (center point)
ST_STEPHENS_GREEN_LAT = 53.3381
ST_STEPHENS_GREEN_LNG = -6.2592

# Realistic Irish names for demo
DEMO_PARTICIPANTS = [
    {
        "name": "Sarah Murphy",
        "email": "sarah.murphy@email.ie",
        "phone": "087 123 4567",
        "address": "12 Harcourt Street, Dublin 2",
        "lat_offset": 0.0015,
        "lng_offset": 0.0010,
    },
    {
        "name": "Michael O'Brien",
        "email": "michael.obrien@email.ie",
        "phone": "086 234 5678",
        "address": "45 Leeson Street Lower, Dublin 2",
        "lat_offset": 0.0020,
        "lng_offset": -0.0015,
    },
    {
        "name": "Emma Kelly",
        "email": "emma.kelly@email.ie",
        "phone": "085 345 6789",
        "address": "8 Cuffe Street, Dublin 2",
        "lat_offset": -0.0010,
        "lng_offset": 0.0020,
    },
    {
        "name": "James Ryan",
        "email": "james.ryan@email.ie",
        "phone": "087 456 7890",
        "address": "23 Adelaide Road, Dublin 2",
        "lat_offset": 0.0025,
        "lng_offset": 0.0005,
    },
    {
        "name": "Aoife Walsh",
        "email": "aoife.walsh@email.ie",
        "phone": "086 567 8901",
        "address": "17 Earlsfort Terrace, Dublin 2",
        "lat_offset": 0.0008,
        "lng_offset": -0.0012,
    },
    {
        "name": "David McCarthy",
        "email": "david.mccarthy@email.ie",
        "phone": "085 678 9012",
        "address": "34 Hatch Street Upper, Dublin 2",
        "lat_offset": 0.0018,
        "lng_offset": 0.0018,
    },
    {
        "name": "Rachel Byrne",
        "email": "rachel.byrne@email.ie",
        "phone": "087 789 0123",
        "address": "5 Pembroke Road, Dublin 4",
        "lat_offset": 0.0030,
        "lng_offset": -0.0020,
    },
    {
        "name": "Patrick Doyle",
        "email": "patrick.doyle@email.ie",
        "phone": "086 890 1234",
        "address": "29 Fitzwilliam Street Lower, Dublin 2",
        "lat_offset": 0.0012,
        "lng_offset": 0.0025,
    },
    {
        "name": "Niamh Collins",
        "email": "niamh.collins@email.ie",
        "phone": "085 901 2345",
        "address": "41 Merrion Square South, Dublin 2",
        "lat_offset": 0.0022,
        "lng_offset": -0.0008,
    },
    {
        "name": "Thomas Fitzgerald",
        "email": "thomas.fitzgerald@email.ie",
        "phone": "087 012 3456",
        "address": "16 Baggot Street Lower, Dublin 2",
        "lat_offset": 0.0028,
        "lng_offset": 0.0012,
    },
    {
        "name": "Claire O'Sullivan",
        "email": "claire.osullivan@email.ie",
        "phone": "086 123 4567",
        "address": "7 Lesson Park, Dublin 6",
        "lat_offset": 0.0035,
        "lng_offset": -0.0025,
    },
    {
        "name": "Sean Kennedy",
        "email": "sean.kennedy@email.ie",
        "phone": "085 234 5678",
        "address": "52 St. Stephen's Green, Dublin 2",
        "lat_offset": 0.0005,
        "lng_offset": 0.0008,
    },
]


def generate_realistic_solar_data(participant_name: str, home_number: int):
    """
    Generate realistic solar feasibility data for Georgian/Victorian townhouses
    in Dublin 2 area. These homes typically have:
    - Moderate to good roof space (40-80 m²)
    - Mixed orientations (not all south-facing)
    - Some shading from neighboring buildings
    - System sizes 3-7 kWp typical for urban homes
    """
    
    # Realistic capacity range for Dublin city townhouses (kWp)
    # Georgian/Victorian terraced homes have varying roof sizes
    base_capacity = random.uniform(3.5, 7.2)
    
    # Annual energy production in Ireland (kWh/kWp/year)
    # Dublin gets about 850-950 kWh/kWp/year depending on orientation
    annual_production_per_kwp = random.uniform(850, 950)
    annual_energy = base_capacity * annual_production_per_kwp
    
    # Mean solar flux (kWh/m²/year) - Dublin typical
    # Ireland gets 900-1100 kWh/m²/year depending on orientation
    mean_flux = random.uniform(920, 1080)
    
    # Installation cost (EUR) - 2024/2025 Irish market
    # Urban installations often slightly higher due to access/scaffolding
    # €1,100-1,400 per kWp is realistic for Dublin
    cost_per_kwp = random.uniform(1100, 1380)
    estimated_cost = base_capacity * cost_per_kwp
    
    # Annual savings calculation (Irish market)
    # Self-consumption model: 35% used directly @ €0.38/kWh
    # Export: 65% @ €0.185/kWh (Clean Export Guarantee)
    self_consumption_rate = 0.35
    import_rate = 0.38  # EUR/kWh
    export_rate = 0.185  # EUR/kWh
    
    self_consumed_kwh = annual_energy * self_consumption_rate
    exported_kwh = annual_energy * (1 - self_consumption_rate)
    
    annual_savings = (self_consumed_kwh * import_rate) + (exported_kwh * export_rate)
    
    # SEAI grant (2025) - €700/kWp up to 2kWp, then €200/kWp up to 4kWp, max €1,800
    if base_capacity <= 2.0:
        seai_grant = base_capacity * 700
    elif base_capacity <= 4.0:
        seai_grant = (2.0 * 700) + ((base_capacity - 2.0) * 200)
    else:
        seai_grant = 1800  # Maximum grant
    
    net_cost = estimated_cost - seai_grant
    
    # Payback period (years) - using net cost after grant
    payback_period = net_cost / annual_savings if annual_savings > 0 else 0
    
    # CO2 reduction (kg/year) - Irish grid factor 0.35 kg CO2/kWh
    co2_reduction = annual_energy * 0.35
    
    # Mix of data sources - most Dublin 2 has Google Solar API coverage
    # But some older buildings might fall back to PVGIS
    data_source = "Google Solar API" if random.random() > 0.15 else "PVGIS"
    
    # Calculate roof area based on capacity
    # Modern panels: ~6.5 m²/kWp (400W panels are ~2m x 1m, need ~16 panels per kWp with spacing)
    area_per_kwp = 6.5
    usable_roof_area = base_capacity * area_per_kwp
    
    # Total roof area is larger (usable is ~55% of total due to orientation, obstructions, setbacks)
    total_roof_area = usable_roof_area / 0.55
    
    return {
        "annual_energy_kwh": round(annual_energy, 1),
        "capacity_kwp": round(base_capacity, 2),
        "mean_solar_flux": round(mean_flux, 1),
        "estimated_cost_eur": round(estimated_cost, 2),
        "payback_period_years": round(payback_period, 1),
        "annual_savings_eur": round(annual_savings, 2),
        "co2_reduction_kg_year": round(co2_reduction, 1),
        "data_source": data_source,
        "usable_roof_area_sq_meters": round(usable_roof_area, 1),
        "estimated_roof_area_sq_meters": round(total_roof_area, 1),
    }


def populate_demo_data():
    """Create demo community and participants for St. Stephen's Green area"""
    
    # Initialize database
    if not init_database():
        print("❌ Failed to initialize database connection")
        return False
    
    print("✅ Database connection established")
    
    with get_db_session() as session:
        # Check if demo community already exists
        existing = session.query(CommunityProjectDB).filter_by(
            name="St. Stephen's Green Solar Co-op"
        ).first()
        
        if existing:
            print("⚠️  Demo community already exists. Deleting and recreating...")
            session.delete(existing)
            session.commit()
        
        # Create community project
        community_id = str(uuid.uuid4())
        
        print(f"\n📍 Creating St. Stephen's Green Solar Co-op...")
        print(f"   Community ID: {community_id}")
        
        # Generate solar data for all participants first to calculate aggregates
        participants_data = []
        for i, participant in enumerate(DEMO_PARTICIPANTS):
            solar_data = generate_realistic_solar_data(participant["name"], i + 1)
            participants_data.append({
                **participant,
                "solar_data": solar_data
            })
        
        # Calculate aggregate statistics
        total_capacity = sum(p["solar_data"]["capacity_kwp"] for p in participants_data)
        total_annual_energy = sum(p["solar_data"]["annual_energy_kwh"] for p in participants_data)
        total_co2_reduction = sum(p["solar_data"]["co2_reduction_kg_year"] for p in participants_data)
        total_estimated_cost = sum(p["solar_data"]["estimated_cost_eur"] for p in participants_data)
        total_annual_savings = sum(p["solar_data"]["annual_savings_eur"] for p in participants_data)
        average_payback = sum(p["solar_data"]["payback_period_years"] for p in participants_data) / len(participants_data)
        
        # Bulk discount for coordinating together (realistic 8-12% for group of 12)
        bulk_discount_percentage = 10.0
        
        # Calculate savings from coordination
        cost_per_home = total_estimated_cost / len(participants_data)
        
        # Create community project
        community = CommunityProjectDB(
            id=community_id,
            name="St. Stephen's Green Solar Co-op",
            description="Community solar initiative for Georgian Quarter residents. By coordinating installations together, we're securing bulk discounts from certified installers and sharing knowledge about the solar journey. Open to all homeowners in Dublin 2 area.",
            status=CommunityStatus.COORDINATING,
            
            # Location (center of St. Stephen's Green)
            latitude=ST_STEPHENS_GREEN_LAT,
            longitude=ST_STEPHENS_GREEN_LNG,
            address="St. Stephen's Green, Dublin 2",
            county="Dublin",
            eircode="D02",
            
            # Aggregate solar potential
            total_capacity_kwp=round(total_capacity, 2),
            total_annual_energy_kwh=round(total_annual_energy, 1),
            total_co2_reduction_kg_year=round(total_co2_reduction, 1),
            
            # Participation counts
            participant_count=12,
            interested_count=3,
            committed_count=9,
            installed_count=0,
            
            # Financial aggregates
            total_estimated_cost_eur=round(total_estimated_cost, 2),
            estimated_cost_per_home_eur=round(cost_per_home, 2),
            bulk_discount_percentage=bulk_discount_percentage,
            total_annual_savings_eur=round(total_annual_savings, 2),
            average_payback_years=round(average_payback, 1),
            
            # Coordinator
            coordinator_name="Sarah Murphy",
            coordinator_contact="sarah.murphy@email.ie",
            
            # Installer (realistic Dublin installer)
            installer_name="Dublin Solar Solutions Ltd",
            installer_contact="info@dublinsolar.ie",
            
            # Timestamps
            created_date=datetime.utcnow() - timedelta(days=45),  # Created 45 days ago
            updated_date=datetime.utcnow() - timedelta(days=2),   # Updated 2 days ago
        )
        
        session.add(community)
        session.flush()  # Get the ID
        
        print(f"✅ Created community: {community.name}")
        print(f"   Total capacity: {total_capacity:.2f} kWp")
        print(f"   Annual energy: {total_annual_energy:.0f} kWh")
        print(f"   Annual savings: €{total_annual_savings:.2f}")
        print(f"   Bulk discount: {bulk_discount_percentage}%")
        
        # Create participants
        print(f"\n👥 Creating {len(DEMO_PARTICIPANTS)} participants...")
        
        # Mix of statuses (9 committed, 3 interested)
        statuses = [ParticipantStatus.COMMITTED] * 9 + [ParticipantStatus.INTERESTED] * 3
        random.shuffle(statuses)
        
        for i, participant_info in enumerate(participants_data):
            participant_id = str(uuid.uuid4())
            
            # Calculate location (offset from center)
            lat = ST_STEPHENS_GREEN_LAT + participant_info["lat_offset"]
            lng = ST_STEPHENS_GREEN_LNG + participant_info["lng_offset"]
            
            # Join date varies (over last 45 days)
            days_ago = random.randint(5, 45)
            join_date = datetime.utcnow() - timedelta(days=days_ago)
            
            participant = HomeParticipantDB(
                id=participant_id,
                community_id=community_id,
                
                # Personal info
                name=participant_info["name"],
                email=participant_info["email"],
                phone=participant_info["phone"],
                address=participant_info["address"],
                
                # Location
                latitude=lat,
                longitude=lng,
                
                # Solar feasibility
                feasibility_data=participant_info["solar_data"],
                
                # Status
                status=statuses[i],
                
                # Timestamps
                join_date=join_date,
                installation_date=None,
            )
            
            session.add(participant)
            
            status_emoji = "✅" if statuses[i] == ParticipantStatus.COMMITTED else "👋"
            print(f"   {status_emoji} {participant_info['name']}: {participant_info['solar_data']['capacity_kwp']:.2f} kWp, €{participant_info['solar_data']['annual_savings_eur']:.0f}/yr savings")
        
        session.commit()
        
        print(f"\n🎉 Successfully created demo data!")
        print(f"\n📊 Summary:")
        print(f"   Community: St. Stephen's Green Solar Co-op")
        print(f"   Location: Dublin 2 (St. Stephen's Green area)")
        print(f"   Participants: 12 (9 committed, 3 interested)")
        print(f"   Total System Capacity: {total_capacity:.2f} kWp")
        print(f"   Total Annual Energy: {total_annual_energy:,.0f} kWh")
        print(f"   Total Annual Savings: €{total_annual_savings:,.2f}")
        print(f"   Average Payback Period: {average_payback:.1f} years")
        print(f"   CO₂ Reduction: {total_co2_reduction:,.0f} kg/year")
        print(f"   Equivalent Trees: {int(total_co2_reduction / 20)} trees planted")
        print(f"   Bulk Discount: {bulk_discount_percentage}%")
        print(f"\n✨ Demo data ready for presentation!")
        
        return True


if __name__ == "__main__":
    try:
        success = populate_demo_data()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
