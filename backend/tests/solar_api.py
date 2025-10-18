"""
Quick test - just check if the API is working with one location
"""
import asyncio
from core.solar_api import solar_client

async def quick_test():
    result = await solar_client.find_closest_building(
            latitude=37.4220936,
            longitude=-122.0840897
        )
        
    print(result)

if __name__ == "__main__":
    asyncio.run(quick_test())
