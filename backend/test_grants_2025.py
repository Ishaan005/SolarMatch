"""
Quick test script for 2025 SEAI grant calculations
Run: python test_grants_2025.py
"""

from core.grants_service import grants_service

def test_grant_calculations():
    """Test the 2025 SEAI grant calculation logic"""
    print("🧪 Testing 2025 SEAI Solar PV Grant Calculations\n")
    print("=" * 60)
    
    test_cases = [
        (1.0, 700, "1 kWp system"),
        (1.5, 1050, "1.5 kWp system"),
        (2.0, 1400, "2 kWp system (tier 1 max)"),
        (2.5, 1500, "2.5 kWp system"),
        (3.0, 1600, "3 kWp system"),
        (3.5, 1700, "3.5 kWp system"),
        (4.0, 1800, "4 kWp system (max grant)"),
        (5.0, 1800, "5 kWp system (capped at max)"),
        (6.5, 1800, "6.5 kWp system (capped at max)"),
    ]
    
    print("\n📊 Grant Amount Calculations:")
    print("-" * 60)
    
    all_passed = True
    for capacity, expected, description in test_cases:
        actual = grants_service.calculate_solar_pv_grant(capacity)
        status = "✅" if abs(actual - expected) < 0.01 else "❌"
        
        if abs(actual - expected) >= 0.01:
            all_passed = False
        
        print(f"{status} {description}")
        print(f"   Capacity: {capacity} kWp")
        print(f"   Expected: €{expected:,.0f}")
        print(f"   Actual:   €{actual:,.0f}")
        print()
    
    # Test applicable grants with full context
    print("\n📋 Full Grant Information Test:")
    print("-" * 60)
    
    capacity = 3.5
    grants_data = grants_service.get_applicable_grants(
        system_capacity_kwp=capacity,
        has_battery=False,
        property_type="residential"
    )
    
    print(f"\nFor a {capacity} kWp residential system:")
    print(f"Total Grant Amount: €{grants_data['total_grant_amount']:,.0f}")
    print(f"\nAvailable Grants:")
    for grant in grants_data['grants']:
        if 'actual_amount' in grant:
            print(f"  - {grant['name']}: €{grant['actual_amount']:,.0f}")
            print(f"    {grant['amount_note']}")
        else:
            print(f"  - {grant['name']}")
    
    print(f"\nRecommendations:")
    for i, rec in enumerate(grants_data['recommendations'], 1):
        print(f"  {i}. {rec}")
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")
    
    return all_passed


if __name__ == "__main__":
    test_grant_calculations()
