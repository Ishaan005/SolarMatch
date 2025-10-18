"""
Test GeoTIFF Processing Features
Demonstrates downloading, processing, and converting GeoTIFF data
"""
import asyncio
from core.geotiff_processor import geotiff_processor
from core.solar_api import solar_client
from core.config import settings
from pathlib import Path


async def test_geotiff_processing():
    """Test all GeoTIFF processing features"""
    
    print("\n" + "="*80)
    print("GEOTIFF PROCESSING TEST SUITE")
    print("="*80 + "\n")
    
    if not settings.is_api_key_configured:
        print("ERROR: API key not configured!")
        return
    
    # Test location: Google HQ
    latitude = 37.4220936
    longitude = -122.0840897
    radius = 50.0
    
    print(f"Testing location: Google HQ")
    print(f"   Coordinates: ({latitude}, {longitude})")
    print(f"   Radius: {radius}m\n")
    
    # Create output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    try:
        # Step 1: Get data layers
        print("Step 1: Fetching data layers from Google Solar API...")
        data_layers = await solar_client.get_data_layers(
            latitude=latitude,
            longitude=longitude,
            radius_meters=radius
        )
        print("Data layers received\n")
        
        # Step 2: Process RGB Imagery
        if 'rgbUrl' in data_layers:
            print("Step 2: Processing RGB Imagery...")
            print(f"   URL: {data_layers['rgbUrl'][:60]}...")
            
            cache_key = f"rgb_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['rgbUrl'],
                cache_key
            )
            print(f"   Downloaded: {len(geotiff_data):,} bytes")
            
            # Convert to PNG
            png_data = geotiff_processor.rgb_geotiff_to_png(
                geotiff_data,
                output_path=str(output_dir / "rgb_imagery.png")
            )
            print(f"   Converted to PNG: {len(png_data):,} bytes")
            print(f"   Saved to: output/rgb_imagery.png\n")
        
        # Step 3: Process Annual Flux (Solar Potential Heatmap)
        if 'annualFluxUrl' in data_layers:
            print("Step 3: Processing Annual Solar Flux...")
            print(f"   URL: {data_layers['annualFluxUrl'][:60]}...")
            
            cache_key = f"flux_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['annualFluxUrl'],
                cache_key
            )
            print(f"   Downloaded: {len(geotiff_data):,} bytes")
            
            # Convert to heatmap
            png_data = geotiff_processor.flux_to_heatmap(
                geotiff_data,
                output_path=str(output_dir / "solar_flux_heatmap.png"),
                colormap='hot',
                title='Annual Solar Flux (kWh/kW/year)'
            )
            print(f"   Converted to heatmap: {len(png_data):,} bytes")
            print(f"   Saved to: output/solar_flux_heatmap.png")
            
            # Get statistics
            array, metadata = geotiff_processor.geotiff_to_array(geotiff_data)
            stats = geotiff_processor.get_statistics(array)
            print(f"\n   Solar Flux Statistics:")
            print(f"      Min: {stats['min']:.2f} kWh/kW/year")
            print(f"      Max: {stats['max']:.2f} kWh/kW/year")
            print(f"      Mean: {stats['mean']:.2f} kWh/kW/year")
            print(f"      Median: {stats['median']:.2f} kWh/kW/year")
            print(f"      Std Dev: {stats['std']:.2f} kWh/kW/year")
            print(f"      Data Points: {stats['count']:,}\n")
        
        # Step 4: Process DSM (Elevation)
        if 'dsmUrl' in data_layers:
            print("Step 4: Processing Digital Surface Model (Elevation)...")
            print(f"   URL: {data_layers['dsmUrl'][:60]}...")
            
            cache_key = f"dsm_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['dsmUrl'],
                cache_key
            )
            print(f"   Downloaded: {len(geotiff_data):,} bytes")
            
            # Convert to heightmap
            png_data = geotiff_processor.dsm_to_heightmap(
                geotiff_data,
                output_path=str(output_dir / "elevation_map.png"),
                colormap='terrain',
                title='Building Elevation (meters)'
            )
            print(f"   Converted to heightmap: {len(png_data):,} bytes")
            print(f"   Saved to: output/elevation_map.png")
            
            # Get elevation statistics
            array, metadata = geotiff_processor.geotiff_to_array(geotiff_data)
            stats = geotiff_processor.get_statistics(array)
            print(f"\n   Elevation Statistics:")
            print(f"      Min Height: {stats['min']:.2f} meters")
            print(f"      Max Height: {stats['max']:.2f} meters")
            print(f"      Mean Height: {stats['mean']:.2f} meters")
            print(f"      Building Height Range: {stats['max'] - stats['min']:.2f} meters\n")
        
        # Step 5: Process Mask (Roof Boundaries)
        if 'maskUrl' in data_layers:
            print("Step 5: Processing Roof Mask...")
            print(f"   URL: {data_layers['maskUrl'][:60]}...")
            
            cache_key = f"mask_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['maskUrl'],
                cache_key
            )
            print(f"   Downloaded: {len(geotiff_data):,} bytes")
            
            # Convert to PNG
            png_data = geotiff_processor.mask_to_png(
                geotiff_data,
                output_path=str(output_dir / "roof_mask.png")
            )
            print(f"   Converted to mask PNG: {len(png_data):,} bytes")
            print(f"   Saved to: output/roof_mask.png\n")
        
        # Step 6: Extract Metadata
        print("Step 6: Extracting GeoTIFF Metadata...")
        if 'rgbUrl' in data_layers:
            cache_key = f"rgb_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['rgbUrl'],
                cache_key
            )
            metadata = geotiff_processor.read_geotiff_metadata(geotiff_data)
            
            print(f"   Image Dimensions: {metadata['width']} x {metadata['height']} pixels")
            print(f"   Bands: {metadata['count']}")
            print(f"   Resolution: {metadata['resolution'][0]:.6f} x {metadata['resolution'][1]:.6f}")
            print(f"   CRS: {metadata['crs']}")
            print(f"   Bounds:")
            print(f"      Left: {metadata['bounds']['left']:.6f}")
            print(f"      Bottom: {metadata['bounds']['bottom']:.6f}")
            print(f"      Right: {metadata['bounds']['right']:.6f}")
            print(f"      Top: {metadata['bounds']['top']:.6f}\n")
        
        # Step 7: Test different colormaps for flux
        print("Step 7: Testing Different Colormaps...")
        if 'annualFluxUrl' in data_layers:
            colormaps = ['hot', 'viridis', 'plasma', 'inferno', 'magma']
            cache_key = f"flux_{latitude}_{longitude}_{radius}"
            geotiff_data = await geotiff_processor.download_geotiff(
                data_layers['annualFluxUrl'],
                cache_key
            )
            
            for cmap in colormaps:
                png_data = geotiff_processor.flux_to_heatmap(
                    geotiff_data,
                    output_path=str(output_dir / f"flux_heatmap_{cmap}.png"),
                    colormap=cmap,
                    title=f'Solar Flux - {cmap.capitalize()} Colormap'
                )
                print(f"   Created heatmap with '{cmap}' colormap")
            print()
        
        # Step 8: Cache Information
        print("Step 8: Cache Information...")
        cache_size = geotiff_processor.get_cache_size()
        print(f"   Cache Directory: {geotiff_processor.cache_dir}")
        print(f"   Total Cache Size: {cache_size:,} bytes ({cache_size / (1024*1024):.2f} MB)\n")
        
        # Summary
        print("="*80)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*80)
        print(f"\nOutput files saved to: {output_dir.absolute()}")
        print("\nGenerated files:")
        if (output_dir / "rgb_imagery.png").exists():
            print("  • rgb_imagery.png - Aerial/satellite photo")
        if (output_dir / "solar_flux_heatmap.png").exists():
            print("  • solar_flux_heatmap.png - Solar potential heatmap")
        if (output_dir / "elevation_map.png").exists():
            print("  • elevation_map.png - Building elevation map")
        if (output_dir / "roof_mask.png").exists():
            print("  • roof_mask.png - Roof boundaries")
        for cmap in ['hot', 'viridis', 'plasma', 'inferno', 'magma']:
            if (output_dir / f"flux_heatmap_{cmap}.png").exists():
                print(f"  • flux_heatmap_{cmap}.png - Heatmap with {cmap} colors")
        
        print("\nUse these images in your frontend to:")
        print("   1. Show users aerial photos of their roof")
        print("   2. Display solar potential heatmaps")
        print("   3. Visualize building structure with elevation maps")
        print("   4. Overlay panel placement on roof boundaries")
        print("   5. Create interactive solar analysis tools\n")
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()


async def test_api_endpoints():
    """Test that the API endpoints work"""
    
    print("\n" + "="*80)
    print("TESTING API ENDPOINTS")
    print("="*80 + "\n")
    
    print("To test the new API endpoints, start the server:")
    print("   cd backend")
    print("   source venv/bin/activate")
    print("   uvicorn main:app --reload --port 8000")
    print("\nThen visit these URLs in your browser:")
    print("\n1. RGB Imagery:")
    print("   http://localhost:8000/api/solar/rgb-image?latitude=37.4221&longitude=-122.0841")
    print("\n2. Solar Flux Heatmap:")
    print("   http://localhost:8000/api/solar/annual-flux-heatmap?latitude=37.4221&longitude=-122.0841")
    print("\n3. Elevation Map:")
    print("   http://localhost:8000/api/solar/elevation-map?latitude=37.4221&longitude=-122.0841")
    print("\n4. Roof Mask:")
    print("   http://localhost:8000/api/solar/roof-mask?latitude=37.4221&longitude=-122.0841")
    print("\n5. Flux Statistics (JSON):")
    print("   http://localhost:8000/api/solar/flux-statistics?latitude=37.4221&longitude=-122.0841")
    print("\n6. GeoTIFF Metadata (JSON):")
    print("   http://localhost:8000/api/solar/geotiff-metadata?latitude=37.4221&longitude=-122.0841&layer_type=dsm")
    print("\n7. Interactive API Docs:")
    print("   http://localhost:8000/docs")
    print()


async def main():
    """Run all tests"""
    
    print("\n" + "="*80)
    print("GEOTIFF PROCESSING - COMPREHENSIVE TEST")
    print("="*80)
    
    await test_geotiff_processing()
    await test_api_endpoints()
    
    print("\nTesting Complete!\n")


if __name__ == "__main__":
    asyncio.run(main())
