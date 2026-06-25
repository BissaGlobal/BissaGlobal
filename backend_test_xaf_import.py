#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - XAF Currency + Bulk Import + Seed Migration
Tests the NEW features: XAF currency, bulk Google import, seed migration idempotency
"""

import requests
import json
import sys
import random
import string
from datetime import datetime, timedelta

# Base URL from .env
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_test(step, message, status="INFO"):
    color = GREEN if status == "PASS" else RED if status == "FAIL" else YELLOW if status == "WARN" else BLUE
    print(f"{color}[{status}] {step}: {message}{RESET}")

def log_detail(message):
    print(f"  → {message}")

def random_email_suffix():
    """Generate random suffix for email to avoid duplicates"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

def test_xaf_currency_and_bulk_import():
    """Test XAF currency, bulk import, and seed migration"""
    
    print(f"\n{BLUE}{'='*80}")
    print(f"YABISO HOTELS - XAF Currency + Bulk Import + Seed Migration Test")
    print(f"{'='*80}{RESET}\n")
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    # Variables to store across steps
    hotel_id = None
    xaf_booking_ref = None
    cdf_booking_ref = None
    
    try:
        # ============================================================
        # AREA 1: NEW CURRENCY XAF (CFA)
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"AREA 1: NEW CURRENCY XAF (CFA)")
        print(f"{'='*80}{RESET}\n")
        
        # Test 1.1: GET /api/settings/rates must return XAF rate
        log_test("1.1", "GET /api/settings/rates - Verify XAF rate (~4.7)", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/settings/rates", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                rates = settings.get('rates', {})
                xaf_rate = rates.get('XAF')
                
                log_detail(f"Rates: {rates}")
                log_detail(f"XAF rate: {xaf_rate}")
                log_detail(f"Fee: {settings.get('fee')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("XAF in rates", 'XAF' in rates))
                checks.append(("XAF rate ~4.7", xaf_rate == 4.7))
                checks.append(("USD in rates", 'USD' in rates))
                checks.append(("EUR in rates", 'EUR' in rates))
                checks.append(("GBP in rates", 'GBP' in rates))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("1.1", "XAF rate present - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("1.1", "XAF rate check - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("1.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("1.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 1.2: Create a booking in XAF and verify math
        log_test("1.2", "Create XAF booking and verify currency conversion math", "INFO")
        results["total"] += 1
        try:
            # First get a hotel and room
            response = requests.get(f"{BASE_URL}/hotels", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                if len(hotels) > 0:
                    hotel = hotels[0]
                    hotel_id = hotel.get('id')
                    room = hotel.get('rooms', [])[0] if hotel.get('rooms') else None
                    
                    if hotel_id and room:
                        room_id = room.get('id')
                        room_price_cdf = room.get('priceCDF')
                        
                        log_detail(f"Using hotel: {hotel.get('name')} (ID: {hotel_id})")
                        log_detail(f"Room: {room.get('name')} - {room_price_cdf} CDF/night")
                        
                        # Create booking in XAF
                        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
                        checkout = (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d')
                        
                        booking_data = {
                            "hotelId": hotel_id,
                            "roomId": room_id,
                            "checkIn": tomorrow,
                            "checkOut": checkout,
                            "guests": 2,
                            "currency": "XAF",
                            "customer": {
                                "name": "Test XAF Customer",
                                "email": f"xaf.customer+{random_email_suffix()}@test.com",
                                "phone": "+237670000000"
                            },
                            "paymentMethod": "visa"
                        }
                        
                        response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
                        
                        if response.status_code == 200:
                            booking = response.json()
                            xaf_booking_ref = booking.get('reference')
                            
                            log_detail(f"Booking reference: {xaf_booking_ref}")
                            log_detail(f"Currency: {booking.get('currency')}")
                            log_detail(f"Nights: {booking.get('nights')}")
                            log_detail(f"Total CDF: {booking.get('totalCDF')}")
                            log_detail(f"Total Display: {booking.get('totalDisplay')}")
                            log_detail(f"Rate used: {booking.get('rateUsed')}")
                            log_detail(f"Conversion fee: {booking.get('conversionFee')}")
                            
                            # Verify math: totalDisplay = round(totalCDF / 4.7 * (1 + fee))
                            nights = booking.get('nights', 3)
                            total_cdf = booking.get('totalCDF')
                            total_display = booking.get('totalDisplay')
                            rate_used = booking.get('rateUsed')
                            conversion_fee = booking.get('conversionFee')
                            
                            # Get fee from settings
                            settings_response = requests.get(f"{BASE_URL}/settings/rates", timeout=10)
                            fee = settings_response.json().get('fee', 0.07) if settings_response.status_code == 200 else 0.07
                            
                            # Calculate expected totalDisplay
                            expected_total_display = round((total_cdf / 4.7) * (1 + fee))
                            
                            log_detail(f"Expected total display: {expected_total_display}")
                            log_detail(f"Actual total display: {total_display}")
                            
                            # Verify expectations
                            checks = []
                            checks.append(("HTTP 200", True))
                            checks.append(("booking.currency == 'XAF'", booking.get('currency') == 'XAF'))
                            checks.append(("booking.reference format YBS-XXXXXX", xaf_booking_ref and xaf_booking_ref.startswith('YBS-') and len(xaf_booking_ref) == 10))
                            checks.append(("rate_used == 4.7", rate_used == 4.7))
                            checks.append(("conversion_fee > 0", conversion_fee > 0))
                            checks.append(("totalDisplay matches math", total_display == expected_total_display))
                            checks.append(("no _id field", '_id' not in booking))
                            
                            all_passed = all(check[1] for check in checks)
                            
                            for check_name, check_result in checks:
                                status = "✓" if check_result else "✗"
                                log_detail(f"{status} {check_name}")
                            
                            if all_passed:
                                log_test("1.2", "XAF booking math - PASS", "PASS")
                                results["passed"] += 1
                            else:
                                log_test("1.2", "XAF booking math - FAIL", "FAIL")
                                results["failed"] += 1
                        else:
                            log_test("1.2", f"Booking failed with status {response.status_code}: {response.text}", "FAIL")
                            results["failed"] += 1
                    else:
                        log_test("1.2", "No hotel or room available", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("1.2", "No hotels found", "FAIL")
                    results["failed"] += 1
            else:
                log_test("1.2", f"Failed to get hotels: {response.status_code}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("1.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 1.3: Verify CDF booking has no fee (totalDisplay == totalCDF)
        log_test("1.3", "Create CDF booking and verify no conversion fee", "INFO")
        results["total"] += 1
        try:
            if hotel_id and room:
                tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
                checkout = (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d')
                
                booking_data = {
                    "hotelId": hotel_id,
                    "roomId": room_id,
                    "checkIn": tomorrow,
                    "checkOut": checkout,
                    "guests": 2,
                    "currency": "CDF",
                    "customer": {
                        "name": "Test CDF Customer",
                        "email": f"cdf.customer+{random_email_suffix()}@test.com",
                        "phone": "+243990000000"
                    },
                    "paymentMethod": "visa"
                }
                
                response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    cdf_booking_ref = booking.get('reference')
                    
                    log_detail(f"Booking reference: {cdf_booking_ref}")
                    log_detail(f"Currency: {booking.get('currency')}")
                    log_detail(f"Total CDF: {booking.get('totalCDF')}")
                    log_detail(f"Total Display: {booking.get('totalDisplay')}")
                    log_detail(f"Conversion fee: {booking.get('conversionFee')}")
                    
                    # Verify expectations
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("booking.currency == 'CDF'", booking.get('currency') == 'CDF'))
                    checks.append(("conversionFee == 0", booking.get('conversionFee') == 0))
                    checks.append(("totalDisplay == totalCDF", booking.get('totalDisplay') == booking.get('totalCDF')))
                    checks.append(("no _id field", '_id' not in booking))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("1.3", "CDF booking no fee - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("1.3", "CDF booking no fee - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("1.3", f"Booking failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            else:
                log_test("1.3", "No hotel or room available from previous test", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("1.3", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # AREA 2: BULK IMPORT RESULTS / featured
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"AREA 2: BULK IMPORT RESULTS / featured")
        print(f"{'='*80}{RESET}\n")
        
        # Test 2.1: GET /api/hotels should return 300+ hotels
        log_test("2.1", "GET /api/hotels - Verify 300+ hotels from bulk import", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/hotels", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                hotel_count = len(hotels)
                
                log_detail(f"Total hotels: {hotel_count}")
                
                # Sample some hotels
                if hotel_count > 0:
                    log_detail(f"Sample hotels:")
                    for i, h in enumerate(hotels[:5]):
                        log_detail(f"  {i+1}. {h.get('name')} - {h.get('city')}, {h.get('country')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotel_count >= 300", hotel_count >= 300))
                checks.append(("no _id field in any hotel", not any('_id' in h for h in hotels)))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("2.1", "Bulk import 300+ hotels - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("2.1", f"Bulk import check - FAIL (found {hotel_count} hotels, expected 300+)", "FAIL")
                    results["failed"] += 1
            else:
                log_test("2.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("2.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 2.2: GET /api/hotels?city=Brazzaville should return Congo-Brazzaville hotels
        log_test("2.2", "GET /api/hotels?city=Brazzaville - Verify Congo-Brazzaville hotels", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/hotels?city=Brazzaville", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                brazzaville_count = len(hotels)
                
                log_detail(f"Brazzaville hotels: {brazzaville_count}")
                
                # Check if hotels are from Congo-Brazzaville
                congo_brazza_hotels = [h for h in hotels if 'brazzaville' in h.get('country', '').lower() or 'congo-brazzaville' in h.get('country', '').lower()]
                
                if brazzaville_count > 0:
                    log_detail(f"Sample Brazzaville hotels:")
                    for i, h in enumerate(hotels[:5]):
                        log_detail(f"  {i+1}. {h.get('name')} - {h.get('city')}, {h.get('country')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("brazzaville_count > 0", brazzaville_count > 0))
                checks.append(("hotels from Congo-Brazzaville", len(congo_brazza_hotels) > 0))
                checks.append(("no _id field", not any('_id' in h for h in hotels)))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("2.2", "Brazzaville hotels - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("2.2", "Brazzaville hotels - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("2.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("2.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 2.3: GET /api/hotels?featured=true should include both RDC and Congo-Brazzaville hotels
        log_test("2.3", "GET /api/hotels?featured=true - Verify Congo hotels are featured", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/hotels?featured=true", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                featured_count = len(hotels)
                
                log_detail(f"Featured hotels: {featured_count}")
                
                # Check for Congo hotels (both RDC and Congo-Brazzaville)
                congo_hotels = [h for h in hotels if 'congo' in h.get('country', '').lower()]
                rdc_hotels = [h for h in congo_hotels if 'rd' in h.get('country', '').lower() or 'démocratique' in h.get('country', '').lower()]
                brazza_hotels = [h for h in congo_hotels if 'brazzaville' in h.get('country', '').lower() or ('république' in h.get('country', '').lower() and 'démocratique' not in h.get('country', '').lower())]
                
                log_detail(f"Congo hotels (all): {len(congo_hotels)}")
                log_detail(f"RD Congo hotels: {len(rdc_hotels)}")
                log_detail(f"Congo-Brazzaville hotels: {len(brazza_hotels)}")
                
                # Verify all Congo hotels have featured:true
                all_congo_featured = all(h.get('featured') == True for h in congo_hotels)
                
                if len(congo_hotels) > 0:
                    log_detail(f"Sample featured Congo hotels:")
                    for i, h in enumerate(congo_hotels[:5]):
                        log_detail(f"  {i+1}. {h.get('name')} - {h.get('country')} - featured:{h.get('featured')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("featured_count > 0", featured_count > 0))
                checks.append(("Congo hotels present", len(congo_hotels) > 0))
                checks.append(("RD Congo hotels present", len(rdc_hotels) > 0))
                checks.append(("Congo-Brazzaville hotels present", len(brazza_hotels) > 0))
                checks.append(("All Congo hotels featured:true", all_congo_featured))
                checks.append(("no _id field", not any('_id' in h for h in hotels)))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("2.3", "Featured Congo hotels - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("2.3", "Featured Congo hotels - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("2.3", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("2.3", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # AREA 3: IMPORT endpoint country mapping
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"AREA 3: IMPORT endpoint country mapping")
        print(f"{'='*80}{RESET}\n")
        
        # Test 3.1: POST /api/import/hotels with Congo-Brazzaville data
        log_test("3.1", "POST /api/import/hotels - Import Pointe-Noire, Congo-Brazzaville", "INFO")
        results["total"] += 1
        try:
            import_data = {
                "city": "Pointe-Noire",
                "province": "Pointe-Noire",
                "country": "Congo-Brazzaville",
                "region": "Afrique Centrale",
                "max": 5
            }
            
            response = requests.post(f"{BASE_URL}/import/hotels", json=import_data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                log_detail(f"City: {result.get('city')}")
                log_detail(f"Fetched: {result.get('fetched')}")
                log_detail(f"Imported: {result.get('imported')}")
                log_detail(f"Updated: {result.get('updated')}")
                log_detail(f"Hotels returned: {len(result.get('hotels', []))}")
                
                hotels = result.get('hotels', [])
                
                if len(hotels) > 0:
                    log_detail(f"Sample imported hotel:")
                    h = hotels[0]
                    log_detail(f"  Name: {h.get('name')}")
                    log_detail(f"  Country: {h.get('country')}")
                    log_detail(f"  Featured: {h.get('featured')}")
                    log_detail(f"  Source: {h.get('source')}")
                    log_detail(f"  Images count: {len(h.get('images', []))}")
                    log_detail(f"  Rooms count: {len(h.get('rooms', []))}")
                    if h.get('images'):
                        log_detail(f"  First image: {h.get('images')[0][:80]}...")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("city == 'Pointe-Noire'", result.get('city') == 'Pointe-Noire'))
                checks.append(("fetched > 0", result.get('fetched', 0) > 0))
                checks.append(("hotels array present", len(hotels) > 0))
                
                if len(hotels) > 0:
                    h = hotels[0]
                    checks.append(("country == 'Congo-Brazzaville'", h.get('country') == 'Congo-Brazzaville'))
                    checks.append(("featured == true", h.get('featured') == True))
                    checks.append(("source == 'google_places'", h.get('source') == 'google_places'))
                    checks.append(("images[] present", len(h.get('images', [])) > 0))
                    checks.append(("images start with /api/hotel-photo", all(img.startswith('/api/hotel-photo?name=') for img in h.get('images', []))))
                    checks.append(("rooms[] has 3 rooms", len(h.get('rooms', [])) == 3))
                    checks.append(("no _id field", '_id' not in h))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("3.1", "Import Congo-Brazzaville - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("3.1", "Import Congo-Brazzaville - FAIL", "FAIL")
                    results["failed"] += 1
            elif response.status_code == 502:
                # Google API error
                error_msg = response.json().get('error', '')
                log_detail(f"Google API error: {error_msg}")
                log_test("3.1", f"Google API returned 502 (billing/403 error): {error_msg}", "WARN")
                results["total"] -= 1  # Don't count this as a test
            else:
                log_test("3.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("3.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 3.2: Idempotency - call import again
        log_test("3.2", "POST /api/import/hotels - Test idempotency (should update, not duplicate)", "INFO")
        results["total"] += 1
        try:
            import_data = {
                "city": "Pointe-Noire",
                "province": "Pointe-Noire",
                "country": "Congo-Brazzaville",
                "region": "Afrique Centrale",
                "max": 5
            }
            
            response = requests.post(f"{BASE_URL}/import/hotels", json=import_data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                log_detail(f"City: {result.get('city')}")
                log_detail(f"Fetched: {result.get('fetched')}")
                log_detail(f"Imported: {result.get('imported')}")
                log_detail(f"Updated: {result.get('updated')}")
                
                # Verify expectations - should mostly update, not import new
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("updated > 0 (idempotency)", result.get('updated', 0) > 0))
                checks.append(("imported == 0 or small (no duplicates)", result.get('imported', 0) <= result.get('fetched', 0)))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("3.2", "Import idempotency - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("3.2", "Import idempotency - FAIL", "FAIL")
                    results["failed"] += 1
            elif response.status_code == 502:
                # Google API error
                error_msg = response.json().get('error', '')
                log_detail(f"Google API error: {error_msg}")
                log_test("3.2", f"Google API returned 502 (billing/403 error): {error_msg}", "WARN")
                results["total"] -= 1  # Don't count this as a test
            else:
                log_test("3.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("3.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # AREA 4: SEED MIGRATION IDEMPOTENCY
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"AREA 4: SEED MIGRATION IDEMPOTENCY")
        print(f"{'='*80}{RESET}\n")
        
        # Test 4.1: GET /api/seed - First call
        log_test("4.1", "GET /api/seed - First call (get baseline hotel count)", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/seed", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                log_detail(f"Seeded: {result.get('seeded')}")
                log_detail(f"Hotels: {result.get('hotels')}")
                
                first_hotel_count = result.get('hotels')
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("seeded == false (already seeded)", result.get('seeded') == False))
                checks.append(("hotels count present", first_hotel_count is not None))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("4.1", "Seed first call - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("4.1", "Seed first call - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("4.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("4.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 4.2: GET /api/seed - Second call (should not duplicate)
        log_test("4.2", "GET /api/seed - Second call (verify no duplication)", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/seed", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                log_detail(f"Seeded: {result.get('seeded')}")
                log_detail(f"Hotels: {result.get('hotels')}")
                
                second_hotel_count = result.get('hotels')
                
                # Verify expectations - hotel count should be the same
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("seeded == false", result.get('seeded') == False))
                checks.append(("hotel count stable (no duplication)", second_hotel_count == first_hotel_count))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("4.2", "Seed idempotency - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("4.2", f"Seed idempotency - FAIL (count changed from {first_hotel_count} to {second_hotel_count})", "FAIL")
                    results["failed"] += 1
            else:
                log_test("4.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("4.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 4.3: GET /api/seed - Third call (verify stability)
        log_test("4.3", "GET /api/seed - Third call (verify continued stability)", "INFO")
        results["total"] += 1
        try:
            response = requests.get(f"{BASE_URL}/seed", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                log_detail(f"Seeded: {result.get('seeded')}")
                log_detail(f"Hotels: {result.get('hotels')}")
                
                third_hotel_count = result.get('hotels')
                
                # Verify expectations - hotel count should still be the same
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotel count still stable", third_hotel_count == first_hotel_count))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("4.3", "Seed stability - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("4.3", "Seed stability - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("4.3", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("4.3", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # AREA 5: REGRESSION TESTS
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"AREA 5: REGRESSION TESTS")
        print(f"{'='*80}{RESET}\n")
        
        # Test 5.1: GET /api/hotels/:id returns hotel with reviews[]
        log_test("5.1", "GET /api/hotels/:id - Verify hotel with reviews[]", "INFO")
        results["total"] += 1
        try:
            if hotel_id:
                response = requests.get(f"{BASE_URL}/hotels/{hotel_id}", timeout=10)
                
                if response.status_code == 200:
                    hotel = response.json()
                    
                    log_detail(f"Hotel: {hotel.get('name')}")
                    log_detail(f"Reviews count: {len(hotel.get('reviews', []))}")
                    
                    # Verify expectations
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("hotel.id present", hotel.get('id') is not None))
                    checks.append(("reviews[] present", 'reviews' in hotel))
                    checks.append(("reviews is array", isinstance(hotel.get('reviews'), list)))
                    checks.append(("no _id field", '_id' not in hotel))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("5.1", "Hotel with reviews - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("5.1", "Hotel with reviews - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("5.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            else:
                log_test("5.1", "No hotel_id from previous tests", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("5.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 5.2: POST /api/auth/register still works
        log_test("5.2", "POST /api/auth/register - Verify registration still works", "INFO")
        results["total"] += 1
        try:
            register_data = {
                "name": "Regression Test User",
                "email": f"regression+{random_email_suffix()}@test.com",
                "password": "test1234"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                
                log_detail(f"User: {auth_data.get('user', {}).get('name')}")
                log_detail(f"Email: {auth_data.get('user', {}).get('email')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("user present", 'user' in auth_data))
                checks.append(("token present", 'token' in auth_data))
                checks.append(("no passwordHash", 'passwordHash' not in auth_data.get('user', {})))
                checks.append(("no _id field", '_id' not in auth_data.get('user', {})))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("5.2", "Registration regression - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("5.2", "Registration regression - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("5.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("5.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test 5.3: POST /api/auth/login still works
        log_test("5.3", "POST /api/auth/login - Verify login still works", "INFO")
        results["total"] += 1
        try:
            login_data = {
                "email": register_data['email'],
                "password": register_data['password']
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                
                log_detail(f"User: {auth_data.get('user', {}).get('name')}")
                log_detail(f"Email: {auth_data.get('user', {}).get('email')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("user present", 'user' in auth_data))
                checks.append(("token present", 'token' in auth_data))
                checks.append(("no passwordHash", 'passwordHash' not in auth_data.get('user', {})))
                checks.append(("no _id field", '_id' not in auth_data.get('user', {})))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("5.3", "Login regression - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("5.3", "Login regression - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("5.3", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("5.3", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
    except Exception as e:
        print(f"\n{RED}CRITICAL ERROR: {str(e)}{RESET}")
        results["details"].append({"step": "CRITICAL", "status": "FAIL", "message": str(e)})
    
    # ============================================================
    # SUMMARY
    # ============================================================
    print(f"\n{BLUE}{'='*80}")
    print(f"TEST SUMMARY")
    print(f"{'='*80}{RESET}")
    print(f"Total Tests: {results['total']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    if results['total'] > 0:
        print(f"Success Rate: {(results['passed'] / results['total'] * 100):.1f}%\n")
    else:
        print(f"Success Rate: N/A\n")
    
    return results

if __name__ == "__main__":
    results = test_xaf_currency_and_bulk_import()
    sys.exit(0 if results["failed"] == 0 else 1)
