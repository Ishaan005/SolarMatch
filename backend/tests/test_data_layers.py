"""
Test script for the Data Layers endpoint
This endpoint provides raw solar data including imagery, DSM, and flux maps.
"""
import asyncio
import json
from core.solar_api import solar_client
from core.config import settings


async def test_data_layers():
    """Test the Data Layers endpoint"""
    
    try:
        # Test 1: Basic request
        print("Test 1: Basic Data Layers Request")
        result = await solar_client.get_data_layers(
            latitude=37.4220936,
            longitude=-122.0840897,
            radius_meters=50.0
        )
        
        print("Success!\n")
        
        # Display key information
        print("Imagery Information:")
        print(f"  Captured: {result.get('imageryDate', 'N/A')}")
        print(f"  Processed: {result.get('imageryProcessedDate', 'N/A')}")
        print(f"  Quality: {result.get('imageryQuality', 'N/A')}")

        print("\nAvailable Data Layers:")
        if 'dsmUrl' in result:
            print("  DSM (Digital Surface Model) - Elevation data")
            print(f"     URL: {result['dsmUrl'][:80]}...")
        
        if 'rgbUrl' in result:
            print("  RGB Imagery - Aerial photos")
            print(f"     URL: {result['rgbUrl'][:80]}...")
        
        if 'maskUrl' in result:
            print("  Mask Layer - Building/roof boundaries")
            print(f"     URL: {result['maskUrl'][:80]}...")
        
        if 'annualFluxUrl' in result:
            print("  Annual Flux - Yearly solar irradiance")
            print(f"     URL: {result['annualFluxUrl'][:80]}...")
        
        if 'monthlyFluxUrl' in result:
            print("  Monthly Flux - Monthly irradiance patterns")
            print(f"     URL: {result['monthlyFluxUrl'][:80]}...")
        
        if 'hourlyShadeUrls' in result:
            shade_urls = result['hourlyShadeUrls']
            print(f"  Hourly Shade Data - {len(shade_urls)} time periods available")
        
        # Test 2: Request with specific view
        print("\n\nTest 2: Request with Specific View (IMAGERY_AND_ANNUAL_FLUX_LAYERS)")
        result2 = await solar_client.get_data_layers(
            latitude=37.4220936,
            longitude=-122.0840897,
            radius_meters=50.0,
            view="IMAGERY_AND_ANNUAL_FLUX_LAYERS"
        )
        
        print("Success!")
        print(f"  Imagery Quality: {result2.get('imageryQuality', 'N/A')}")
        print(f"  Has RGB URL: {'rgbUrl' in result2}")
        print(f"  Has Annual Flux: {'annualFluxUrl' in result2}")
        print(f"  Has Monthly Flux: {'monthlyFluxUrl' in result2}")
        
        # Test 3: Different radius
        print("\n\nTest 3: Larger Radius (100 meters)")
        result3 = await solar_client.get_data_layers(
            latitude=37.4220936,
            longitude=-122.0840897,
            radius_meters=100.0
        )

        print("Success!")
        print(f"  Radius: 100m (covers larger area)")
        print(f"  Quality: {result3.get('imageryQuality', 'N/A')}")
        
        # Test 4: High quality requirement
        print("\n\n📍 Test 4: High Quality Requirement")
        print("-" * 80)
        result4 = await solar_client.get_data_layers(
            latitude=37.4220936,
            longitude=-122.0840897,
            radius_meters=50.0,
            required_quality="HIGH"
        )
        
        print("Success!")
        print(f"  Requested: HIGH quality")
        print(f"  Received: {result4.get('imageryQuality', 'N/A')} quality")
        
        # Show full response structure
        print("\n\nFull Response Structure:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Error Type: {type(e).__name__}")

async def main():
    """Run all tests"""

    await test_data_layers()



if __name__ == "__main__":
    asyncio.run(main())
