"""
Test script for PVGIS integration
Tests rural Ireland solar analysis using PVGIS fallback
"""

import asyncio
from core.pvgis_client import pvgis_client
from core.unified_solar_service import unified_solar_service


async def test_pvgis():
    """Test PVGIS client directly"""
    print("=" * 60)
    print("Testing PVGIS Client")
    print("=" * 60)
    
    # Test location: Rural Ireland (Connemara)
    lat, lon = 53.5461, -9.8902
    print(f"\nLocation: Connemara, Ireland ({lat}, {lon})")
    
    try:
        result = await pvgis_client.get_solar_radiation(lat, lon)
        print(f"\n[SUCCESS] PVGIS Data Retrieved:")
        print(f"  - Source: {result.get('source')}")
        print(f"  - Annual PV Energy: {result.get('annual_pv_energy_per_kwp')} kWh/kWp/year")
        print(f"  - Annual Irradiation: {result.get('annual_irradiation_kwh_per_m2')} kWh/m²/year")
        print(f"  - Optimal Tilt: {result.get('optimal_tilt_angle')}°")
        print(f"  - Optimal Azimuth: {result.get('optimal_azimuth')}°")
        print(f"  - Mean Flux: {result.get('flux_stats', {}).get('mean')} kWh/kWp/year")
        return True
    except Exception as e:
        print(f"\n[ERROR] PVGIS Error: {str(e)}")
        return False


async def test_unified_service_urban():
    """Test unified service with urban location (should use Google Solar API)"""
    print("\n" + "=" * 60)
    print("Testing Unified Service - Urban Location")
    print("=" * 60)
    
    # Dublin city center
    lat, lon = 53.3498, -6.2603
    print(f"\nLocation: Dublin City ({lat}, {lon})")
    
    try:
        result = await unified_solar_service.get_solar_analysis(lat, lon, 50.0)
        print(f"\n[SUCCESS] Analysis Complete:")
        print(f"  - Data Source: {result.get('data_source')}")
        print(f"  - Has Imagery: {result.get('has_imagery')}")
        print(f"  - Roof Area: {result.get('estimated_roof_area_sq_meters')} m²")
        print(f"  - Annual Energy: {result.get('estimated_annual_energy_kwh')} kWh/year")
        print(f"  - Mean Flux: {result.get('flux_stats', {}).get('mean')} kWh/kWp/year")
        return True
    except Exception as e:
        print(f"\n[ERROR] Urban Analysis Error: {str(e)}")
        return False


async def test_unified_service_rural():
    """Test unified service with rural location (should fallback to PVGIS)"""
    print("\n" + "=" * 60)
    print("Testing Unified Service - Rural Location")
    print("=" * 60)
    
    # Rural Ireland (Donegal countryside)
    lat, lon = 54.9966, -8.1111
    print(f"\nLocation: Rural Donegal ({lat}, {lon})")
    
    try:
        result = await unified_solar_service.get_solar_analysis(
            lat, lon, 50.0, 
            estimated_roof_area=120.0  # Provide roof area estimate
        )
        print(f"\n[SUCCESS] Analysis Complete:")
        print(f"  - Data Source: {result.get('data_source')}")
        print(f"  - Has Imagery: {result.get('has_imagery')}")
        print(f"  - Coverage Type: {result.get('coverage_type')}")
        print(f"  - Roof Area: {result.get('estimated_roof_area_sq_meters')} m²")
        print(f"  - Capacity: {result.get('estimated_capacity_kwp')} kWp")
        print(f"  - Annual Energy: {result.get('estimated_annual_energy_kwh')} kWh/year")
        print(f"  - Mean Flux: {result.get('flux_stats', {}).get('mean')} kWh/kWp/year")
        
        if result.get('note'):
            print(f"  - Note: {result.get('note')}")
        
        if result.get('optimal_panel_config'):
            config = result['optimal_panel_config']
            print(f"  - Optimal Config: {config.get('tilt_angle')}° tilt, {config.get('azimuth')}° azimuth")
        
        return True
    except Exception as e:
        print(f"\n[ERROR] Rural Analysis Error: {str(e)}")
        return False


async def test_coverage_check():
    """Test coverage checker"""
    print("\n" + "=" * 60)
    print("Testing Coverage Checker")
    print("=" * 60)
    
    locations = [
        ("Dublin", 53.3498, -6.2603),
        ("Rural Kerry", 52.0599, -9.5177),
        ("Cork City", 51.8985, -8.4756)
    ]
    
    for name, lat, lon in locations:
        print(f"\n{name} ({lat}, {lon}):")
        try:
            coverage = await unified_solar_service.check_coverage(lat, lon)
            print(f"  - Google Solar API: {'Available' if coverage['google_solar_api'] else 'Not Available'}")
            print(f"  - PVGIS: {'Available' if coverage['pvgis'] else 'Not Available'}")
            print(f"  - Recommended: {coverage.get('recommended_source', 'Unknown')}")
            print(f"  - Has Imagery: {'Yes' if coverage['has_imagery'] else 'No'}")
        except Exception as e:
            print(f"  [ERROR] Error: {str(e)}")


async def main():
    """Run all tests"""
    print("\nSolarMatch Multi-Source Analysis Tests\n")
    
    results = []
    
    # Test 1: PVGIS directly
    results.append(("PVGIS Client", await test_pvgis()))
    
    # Test 2: Urban location (Google Solar API)
    results.append(("Urban Analysis", await test_unified_service_urban()))
    
    # Test 3: Rural location (PVGIS fallback)
    results.append(("Rural Analysis", await test_unified_service_rural()))
    
    # Test 4: Coverage checker
    await test_coverage_check()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results:
        status = "[PASSED]" if passed else "[FAILED]"
        print(f"{test_name}: {status}")
    
    # Cleanup
    await pvgis_client.close()
    
    print("\nTests complete!\n")


if __name__ == "__main__":
    asyncio.run(main())
