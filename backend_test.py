#!/usr/bin/env python3
"""
Backend API Test Suite for YABISO HOTELS
Tests all backend endpoints in order as specified in the review request.
"""

import requests
import json
import re
from datetime import datetime, timedelta

# Base URL from environment
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

def print_test(name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  Details: {details}")

def test_seed():
    """Test 1: GET /api/seed - should seed 17 hotels + reviews"""
    print("\n" + "="*80)
    print("TEST 1: Seed demo hotels and reviews")
    print("="*80)
    
    try:
        # First call - should seed
        response = requests.get(f"{BASE_URL}/seed", timeout=30)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check if seeded or already seeded
        if data.get('seeded') == True:
            # First time seeding
            hotels_count = data.get('hotels', 0)
            reviews_count = data.get('reviews', 0)
            passed = hotels_count == 17 and reviews_count > 0
            print_test("Seed first call", passed, f"Seeded {hotels_count} hotels and {reviews_count} reviews")
        elif data.get('seeded') == False:
            # Already seeded
            hotels_count = data.get('hotels', 0)
            passed = hotels_count == 17
            print_test("Seed already done", passed, f"Database already has {hotels_count} hotels")
        else:
            print_test("Seed response format", False, "Unexpected response format")
            return False
        
        # Second call - should return seeded: false
        response2 = requests.get(f"{BASE_URL}/seed", timeout=30)
        data2 = response2.json()
        print(f"\nSecond call response: {json.dumps(data2, indent=2)}")
        
        idempotent = data2.get('seeded') == False and data2.get('hotels') == 17
        print_test("Seed idempotent", idempotent, f"Second call returned seeded=false with {data2.get('hotels')} hotels")
        
        return passed and idempotent
        
    except Exception as e:
        print_test("Seed endpoint", False, str(e))
        return False

def test_settings_get():
    """Test 2: GET /api/settings/rates"""
    print("\n" + "="*80)
    print("TEST 2: Get exchange rate settings")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/settings/rates", timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check structure
        has_rates = 'rates' in data
        has_fee = 'fee' in data
        
        if has_rates and has_fee:
            rates = data['rates']
            fee = data['fee']
            
            # Check rates have USD, EUR, GBP
            has_currencies = 'USD' in rates and 'EUR' in rates and 'GBP' in rates
            fee_valid = isinstance(fee, (int, float)) and fee <= 0.10
            
            passed = has_currencies and fee_valid
            print_test("Settings structure", passed, f"Rates: {rates}, Fee: {fee}")
            return passed, data
        else:
            print_test("Settings structure", False, "Missing rates or fee")
            return False, None
            
    except Exception as e:
        print_test("Settings GET", False, str(e))
        return False, None

def test_settings_put():
    """Test 3: PUT /api/settings/rates"""
    print("\n" + "="*80)
    print("TEST 3: Update exchange rate settings")
    print("="*80)
    
    try:
        # Test updating fee to 0.05
        response = requests.put(
            f"{BASE_URL}/settings/rates",
            json={"fee": 0.05},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        fee_updated = data.get('fee') == 0.05
        print_test("Update fee to 0.05", fee_updated, f"Fee is now {data.get('fee')}")
        
        # Test fee capping at 0.10
        response2 = requests.put(
            f"{BASE_URL}/settings/rates",
            json={"fee": 0.15},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        data2 = response2.json()
        print(f"\nFee cap test response: {json.dumps(data2, indent=2)}")
        
        fee_capped = data2.get('fee') == 0.10
        print_test("Fee capped at 0.10", fee_capped, f"Fee set to 0.15 but capped at {data2.get('fee')}")
        
        # Reset to 0.05 for consistent testing
        requests.put(
            f"{BASE_URL}/settings/rates",
            json={"fee": 0.05},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        return fee_updated and fee_capped
        
    except Exception as e:
        print_test("Settings PUT", False, str(e))
        return False

def test_hotels_list():
    """Test 4: GET /api/hotels"""
    print("\n" + "="*80)
    print("TEST 4: List all hotels")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/hotels", timeout=10)
        print(f"Status Code: {response.status_code}")
        hotels = response.json()
        print(f"Number of hotels: {len(hotels)}")
        
        if len(hotels) > 0:
            print(f"\nFirst hotel sample: {json.dumps(hotels[0], indent=2)[:500]}...")
            
            # Check count
            count_ok = len(hotels) == 17
            print_test("Hotel count", count_ok, f"Expected 17, got {len(hotels)}")
            
            # Check no _id field
            has_mongo_id = any('_id' in h for h in hotels)
            print_test("No Mongo _id", not has_mongo_id, "Mongo _id field removed" if not has_mongo_id else "Mongo _id still present")
            
            # Check structure
            first = hotels[0]
            has_required = all(k in first for k in ['id', 'name', 'rooms', 'images', 'priceCDF', 'verified', 'featured'])
            print_test("Hotel structure", has_required, "All required fields present")
            
            # Check rooms
            rooms_ok = len(first.get('rooms', [])) == 3
            if rooms_ok:
                room = first['rooms'][0]
                room_has_fields = all(k in room for k in ['id', 'priceCDF', 'capacity'])
                print_test("Room structure", room_has_fields, f"Room has required fields")
            
            return count_ok and not has_mongo_id and has_required and rooms_ok, hotels
        else:
            print_test("Hotels list", False, "No hotels returned")
            return False, []
            
    except Exception as e:
        print_test("Hotels list", False, str(e))
        return False, []

def test_hotels_filters():
    """Test 5: GET /api/hotels with filters"""
    print("\n" + "="*80)
    print("TEST 5: Filter hotels")
    print("="*80)
    
    try:
        # Test text search
        response = requests.get(f"{BASE_URL}/hotels?q=kinshasa", timeout=10)
        kinshasa_hotels = response.json()
        print(f"\nFilter q=kinshasa: {len(kinshasa_hotels)} hotels")
        kinshasa_ok = len(kinshasa_hotels) > 0 and all('kinshasa' in h.get('name', '').lower() or 'kinshasa' in h.get('city', '').lower() for h in kinshasa_hotels)
        print_test("Text filter (q=kinshasa)", kinshasa_ok, f"Found {len(kinshasa_hotels)} hotels with 'kinshasa'")
        
        # Test type filter
        response = requests.get(f"{BASE_URL}/hotels?type=lodge", timeout=10)
        lodge_hotels = response.json()
        print(f"\nFilter type=lodge: {len(lodge_hotels)} hotels")
        lodge_ok = len(lodge_hotels) > 0 and all(h.get('type') == 'lodge' for h in lodge_hotels)
        print_test("Type filter (type=lodge)", lodge_ok, f"Found {len(lodge_hotels)} lodges")
        
        # Test featured filter
        response = requests.get(f"{BASE_URL}/hotels?featured=true", timeout=10)
        featured_hotels = response.json()
        print(f"\nFilter featured=true: {len(featured_hotels)} hotels")
        featured_ok = len(featured_hotels) > 0 and all(h.get('featured') == True for h in featured_hotels)
        print_test("Featured filter", featured_ok, f"Found {len(featured_hotels)} featured hotels")
        
        # Test guests filter
        response = requests.get(f"{BASE_URL}/hotels?guests=4", timeout=10)
        guest_hotels = response.json()
        print(f"\nFilter guests=4: {len(guest_hotels)} hotels")
        guest_ok = len(guest_hotels) > 0 and all(any(r.get('capacity', 0) >= 4 for r in h.get('rooms', [])) for h in guest_hotels)
        print_test("Guests filter (guests=4)", guest_ok, f"Found {len(guest_hotels)} hotels with capacity >= 4")
        
        return kinshasa_ok and lodge_ok and featured_ok and guest_ok
        
    except Exception as e:
        print_test("Hotels filters", False, str(e))
        return False

def test_single_hotel(hotel_id):
    """Test 6: GET /api/hotels/:id"""
    print("\n" + "="*80)
    print("TEST 6: Get single hotel with reviews")
    print("="*80)
    
    try:
        # Valid hotel
        response = requests.get(f"{BASE_URL}/hotels/{hotel_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            hotel = response.json()
            print(f"Hotel: {hotel.get('name')}")
            print(f"Reviews count: {len(hotel.get('reviews', []))}")
            
            has_reviews = 'reviews' in hotel and isinstance(hotel['reviews'], list)
            reviews_ok = len(hotel.get('reviews', [])) > 0
            print_test("Hotel with reviews", has_reviews and reviews_ok, f"Hotel has {len(hotel.get('reviews', []))} reviews")
            
            # Test invalid ID
            response2 = requests.get(f"{BASE_URL}/hotels/invalid-id-12345", timeout=10)
            print(f"\nInvalid ID status: {response2.status_code}")
            invalid_ok = response2.status_code == 404
            print_test("Invalid hotel ID returns 404", invalid_ok, f"Status: {response2.status_code}")
            
            return has_reviews and reviews_ok and invalid_ok, hotel
        else:
            print_test("Single hotel", False, f"Status {response.status_code}")
            return False, None
            
    except Exception as e:
        print_test("Single hotel", False, str(e))
        return False, None

def test_destinations():
    """Test 7: GET /api/destinations"""
    print("\n" + "="*80)
    print("TEST 7: Get destinations")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/destinations", timeout=10)
        print(f"Status Code: {response.status_code}")
        destinations = response.json()
        print(f"Number of destinations: {len(destinations)}")
        
        if len(destinations) > 0:
            print(f"\nFirst destination: {json.dumps(destinations[0], indent=2)}")
            
            # Check structure
            first = destinations[0]
            has_fields = all(k in first for k in ['city', 'count', 'image'])
            print_test("Destination structure", has_fields, "Has city, count, and image fields")
            
            # Check grouped by city
            cities = [d.get('city') for d in destinations]
            unique_cities = len(cities) == len(set(cities))
            print_test("Grouped by city", unique_cities, f"Each city appears once")
            
            return has_fields and unique_cities
        else:
            print_test("Destinations", False, "No destinations returned")
            return False
            
    except Exception as e:
        print_test("Destinations", False, str(e))
        return False

def test_create_booking(hotel, current_fee):
    """Test 8-9: POST /api/bookings with USD and CDF"""
    print("\n" + "="*80)
    print("TEST 8-9: Create bookings (USD and CDF)")
    print("="*80)
    
    try:
        # Get a room from the hotel
        room = hotel['rooms'][0]
        hotel_id = hotel['id']
        room_id = room['id']
        
        # Test USD booking
        print("\n--- USD Booking ---")
        check_in = "2025-07-10"
        check_out = "2025-07-13"
        
        booking_data = {
            "hotelId": hotel_id,
            "roomId": room_id,
            "checkIn": check_in,
            "checkOut": check_out,
            "guests": 2,
            "currency": "USD",
            "customer": {
                "name": "Jean-Pierre Mukendi",
                "email": "jpmukendi@example.com",
                "phone": "+243990000000"
            },
            "paymentMethod": "visa"
        }
        
        response = requests.post(
            f"{BASE_URL}/bookings",
            json=booking_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        booking = response.json()
        print(f"Booking response: {json.dumps(booking, indent=2)}")
        
        # Verify reference format
        reference = booking.get('reference', '')
        ref_pattern = r'^YBS-[A-Z0-9]{6}$'
        ref_ok = bool(re.match(ref_pattern, reference))
        print_test("Reference format", ref_ok, f"Reference: {reference}")
        
        # Verify nights
        nights = booking.get('nights')
        nights_ok = nights == 3
        print_test("Nights calculation", nights_ok, f"Expected 3, got {nights}")
        
        # Verify totalCDF
        expected_total_cdf = room['priceCDF'] * 3
        actual_total_cdf = booking.get('totalCDF')
        total_cdf_ok = actual_total_cdf == expected_total_cdf
        print_test("Total CDF", total_cdf_ok, f"Expected {expected_total_cdf}, got {actual_total_cdf}")
        
        # Verify totalDisplay (USD conversion)
        # Formula: round(totalCDF / 2850 * (1 + fee))
        usd_rate = 2850  # Default USD rate
        expected_total_display = round((expected_total_cdf / usd_rate) * (1 + current_fee))
        actual_total_display = booking.get('totalDisplay')
        total_display_ok = actual_total_display == expected_total_display
        print_test("Total Display (USD)", total_display_ok, 
                  f"Expected {expected_total_display} (CDF {expected_total_cdf} / {usd_rate} * {1+current_fee}), got {actual_total_display}")
        
        # Verify commission (30%)
        expected_commission = round(expected_total_cdf * 0.3)
        actual_commission = booking.get('commissionCDF')
        commission_ok = actual_commission == expected_commission
        print_test("Commission (30%)", commission_ok, f"Expected {expected_commission}, got {actual_commission}")
        
        # Verify payout
        expected_payout = expected_total_cdf - expected_commission
        actual_payout = booking.get('payoutCDF')
        payout_ok = actual_payout == expected_payout
        print_test("Payout", payout_ok, f"Expected {expected_payout}, got {actual_payout}")
        
        # Verify status
        status_ok = booking.get('status') == 'payment_received'
        print_test("Status", status_ok, f"Status: {booking.get('status')}")
        
        # Verify statusHistory
        status_history = booking.get('statusHistory', [])
        history_ok = len(status_history) == 2
        print_test("Status history", history_ok, f"Expected 2 entries, got {len(status_history)}")
        
        usd_booking_ok = all([ref_ok, nights_ok, total_cdf_ok, total_display_ok, commission_ok, payout_ok, status_ok, history_ok])
        
        # Test CDF booking
        print("\n--- CDF Booking ---")
        booking_data_cdf = {
            "hotelId": hotel_id,
            "roomId": room_id,
            "checkIn": check_in,
            "checkOut": check_out,
            "guests": 2,
            "currency": "CDF",
            "customer": {
                "name": "Marie Kalala",
                "email": "mkalala@example.com",
                "phone": "+243990000001"
            },
            "paymentMethod": "cash"
        }
        
        response_cdf = requests.post(
            f"{BASE_URL}/bookings",
            json=booking_data_cdf,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        booking_cdf = response_cdf.json()
        print(f"CDF Booking response: {json.dumps(booking_cdf, indent=2)}")
        
        # For CDF, conversionFee should be 0 and totalDisplay == totalCDF
        conversion_fee = booking_cdf.get('conversionFee')
        total_display_cdf = booking_cdf.get('totalDisplay')
        total_cdf = booking_cdf.get('totalCDF')
        
        cdf_fee_ok = conversion_fee == 0
        print_test("CDF conversion fee", cdf_fee_ok, f"Expected 0, got {conversion_fee}")
        
        cdf_total_ok = total_display_cdf == total_cdf
        print_test("CDF total display", cdf_total_ok, f"totalDisplay ({total_display_cdf}) == totalCDF ({total_cdf})")
        
        cdf_booking_ok = cdf_fee_ok and cdf_total_ok
        
        return usd_booking_ok and cdf_booking_ok, reference
        
    except Exception as e:
        print_test("Create booking", False, str(e))
        return False, None

def test_booking_validation():
    """Test 10: POST /api/bookings with missing email"""
    print("\n" + "="*80)
    print("TEST 10: Booking validation (missing email)")
    print("="*80)
    
    try:
        booking_data = {
            "hotelId": "some-id",
            "roomId": "some-room",
            "checkIn": "2025-07-10",
            "checkOut": "2025-07-13",
            "guests": 2,
            "currency": "USD",
            "customer": {
                "name": "Test User"
                # Missing email
            },
            "paymentMethod": "visa"
        }
        
        response = requests.post(
            f"{BASE_URL}/bookings",
            json=booking_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        validation_ok = response.status_code == 400
        print_test("Missing email validation", validation_ok, f"Status: {response.status_code}")
        
        return validation_ok
        
    except Exception as e:
        print_test("Booking validation", False, str(e))
        return False

def test_get_booking(reference):
    """Test 11: GET /api/bookings/:reference"""
    print("\n" + "="*80)
    print("TEST 11: Get booking by reference")
    print("="*80)
    
    try:
        # Valid reference
        response = requests.get(f"{BASE_URL}/bookings/{reference}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            booking = response.json()
            print(f"Booking reference: {booking.get('reference')}")
            print(f"Hotel: {booking.get('hotelName')}")
            
            ref_match = booking.get('reference') == reference
            print_test("Get booking by reference", ref_match, f"Retrieved booking {reference}")
            
            # Test invalid reference
            response2 = requests.get(f"{BASE_URL}/bookings/YBS-INVALID", timeout=10)
            print(f"\nInvalid reference status: {response2.status_code}")
            invalid_ok = response2.status_code == 404
            print_test("Invalid reference returns 404", invalid_ok, f"Status: {response2.status_code}")
            
            return ref_match and invalid_ok
        else:
            print_test("Get booking", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_test("Get booking", False, str(e))
        return False

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("YABISO HOTELS - Backend API Test Suite")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test 1: Seed
    results['seed'] = test_seed()
    
    # Test 2: Get settings
    settings_ok, settings = test_settings_get()
    results['settings_get'] = settings_ok
    current_fee = settings.get('fee', 0.05) if settings else 0.05
    
    # Test 3: Update settings
    results['settings_put'] = test_settings_put()
    current_fee = 0.05  # We reset to 0.05 in the test
    
    # Test 4: List hotels
    hotels_ok, hotels = test_hotels_list()
    results['hotels_list'] = hotels_ok
    
    # Test 5: Filter hotels
    results['hotels_filters'] = test_hotels_filters()
    
    # Test 6: Single hotel
    if hotels:
        hotel_id = hotels[0]['id']
        single_ok, hotel = test_single_hotel(hotel_id)
        results['single_hotel'] = single_ok
    else:
        results['single_hotel'] = False
        hotel = None
    
    # Test 7: Destinations
    results['destinations'] = test_destinations()
    
    # Test 8-9: Create bookings
    if hotel:
        booking_ok, reference = test_create_booking(hotel, current_fee)
        results['create_booking'] = booking_ok
    else:
        results['create_booking'] = False
        reference = None
    
    # Test 10: Validation
    results['booking_validation'] = test_booking_validation()
    
    # Test 11: Get booking
    if reference:
        results['get_booking'] = test_get_booking(reference)
    else:
        results['get_booking'] = False
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Success rate: {(passed/total)*100:.1f}%")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
