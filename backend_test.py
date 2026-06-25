#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - Hotel Owner Endpoints
Tests the NEW /api/owner/* endpoints for hotel owners
"""

import requests
import json
import sys
import random
import string
from datetime import datetime

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
    print(f"{color}[{status}] Step {step}: {message}{RESET}")

def log_detail(message):
    print(f"  → {message}")

def random_email_suffix():
    """Generate random suffix for email to avoid duplicates"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

def test_hotel_owner_endpoints():
    """Test the complete hotel owner endpoints flow"""
    
    print(f"\n{BLUE}{'='*80}")
    print(f"YABISO HOTELS - Hotel Owner Endpoints Test")
    print(f"{'='*80}{RESET}\n")
    
    results = {
        "total": 8,
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    # Variables to store across steps
    tokenA = None
    userA_id = None
    ownerA_email = None
    hotel_id = None
    tokenB = None
    userB_id = None
    booking_id = None
    
    try:
        # ============================================================
        # STEP 0: Seed database
        # ============================================================
        log_test(0, "Seeding database with demo data", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/seed", timeout=10)
            if response.status_code == 200:
                data = response.json()
                log_detail(f"Seed response: {data}")
                log_test(0, "Database seeded successfully", "PASS")
            else:
                log_test(0, f"Seed failed with status {response.status_code}", "WARN")
        except Exception as e:
            log_test(0, f"Seed error: {str(e)}", "WARN")
        
        # ============================================================
        # STEP 1: Register owner A and capture tokenA + userA.id
        # ============================================================
        log_test(1, "Register owner A and capture tokenA + userA.id", "INFO")
        try:
            rand_suffix = random_email_suffix()
            ownerA_email = f"ownerA+{rand_suffix}@test.com"
            register_data = {
                "name": "Owner A",
                "email": ownerA_email,
                "password": "pass1234"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                tokenA = auth_data.get('token')
                userA_id = auth_data.get('user', {}).get('id')
                user_name = auth_data.get('user', {}).get('name')
                user_email = auth_data.get('user', {}).get('email')
                
                log_detail(f"Owner A registered: {user_name} ({user_email})")
                log_detail(f"User ID: {userA_id}")
                log_detail(f"Token: {tokenA[:20]}..." if tokenA else "No token")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("token present", tokenA is not None))
                checks.append(("user.id present", userA_id is not None))
                checks.append(("user.name == 'Owner A'", user_name == "Owner A"))
                checks.append(("user.email matches", user_email == ownerA_email.lower()))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(1, "Owner A registration - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(1, "Owner A registration - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(1, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(1, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        if not tokenA or not userA_id:
            log_test("ABORT", "Cannot continue without tokenA and userA_id", "FAIL")
            return results
        
        # ============================================================
        # STEP 2: POST /api/owner/hotels with tokenA - Create hotel
        # ============================================================
        log_test(2, "POST /api/owner/hotels - Create hotel with tokenA", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            hotel_data = {
                "name": "Owner A Lodge",
                "type": "lodge",
                "country": "RD Congo",
                "province": "Nord-Kivu",
                "city": "Goma",
                "description": "Test lodge for owner A",
                "amenities": ["wifi", "pool"],
                "rooms": [
                    {
                        "name": "Std",
                        "priceCDF": "100000",
                        "capacity": 2,
                        "beds": "1 lit"
                    },
                    {
                        "name": "Suite",
                        "priceCDF": "250000",
                        "capacity": 4,
                        "beds": "2 lits"
                    }
                ]
            }
            
            response = requests.post(f"{BASE_URL}/owner/hotels", json=hotel_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                hotel = response.json()
                hotel_id = hotel.get('id')
                
                log_detail(f"Hotel created: {hotel.get('name')} (ID: {hotel_id})")
                log_detail(f"Owner ID: {hotel.get('ownerId')}")
                log_detail(f"Verified: {hotel.get('verified')}")
                log_detail(f"Active: {hotel.get('active')}")
                log_detail(f"Price CDF: {hotel.get('priceCDF')}")
                log_detail(f"Rooms count: {len(hotel.get('rooms', []))}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotel.id present", hotel_id is not None))
                checks.append(("hotel.ownerId == userA.id", hotel.get('ownerId') == userA_id))
                checks.append(("hotel.verified == false", hotel.get('verified') == False))
                checks.append(("hotel.active == true", hotel.get('active') == True))
                checks.append(("hotel.priceCDF == 100000 (min)", hotel.get('priceCDF') == 100000))
                checks.append(("2 rooms with ids", len(hotel.get('rooms', [])) == 2 and all(r.get('id') for r in hotel.get('rooms', []))))
                checks.append(("no _id field", '_id' not in hotel))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(2, "Create hotel - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(2, "Create hotel - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(2, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(2, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # Test missing city -> 400
        log_test("2.1", "POST /api/owner/hotels - Missing city should return 400", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            bad_hotel_data = {
                "name": "Bad Hotel",
                "type": "hotel",
                "country": "RD Congo",
                "province": "Nord-Kivu"
                # Missing city
            }
            
            response = requests.post(f"{BASE_URL}/owner/hotels", json=bad_hotel_data, headers=headers, timeout=10)
            
            if response.status_code == 400:
                log_detail("Correctly returned 400 for missing city")
                log_test("2.1", "Validation (missing city) - PASS", "PASS")
            else:
                log_test("2.1", f"Expected 400, got {response.status_code}", "FAIL")
        except Exception as e:
            log_test("2.1", f"Error: {str(e)}", "FAIL")
        
        # Test no token -> 401
        log_test("2.2", "POST /api/owner/hotels - No token should return 401", "INFO")
        try:
            response = requests.post(f"{BASE_URL}/owner/hotels", json=hotel_data, timeout=10)
            
            if response.status_code == 401:
                log_detail("Correctly returned 401 for missing token")
                log_test("2.2", "Authorization (no token) - PASS", "PASS")
            else:
                log_test("2.2", f"Expected 401, got {response.status_code}", "FAIL")
        except Exception as e:
            log_test("2.2", f"Error: {str(e)}", "FAIL")
        
        if not hotel_id:
            log_test("ABORT", "Cannot continue without hotel_id", "FAIL")
            return results
        
        # ============================================================
        # STEP 3: GET /api/owner/hotels with tokenA - List owner's hotels
        # ============================================================
        log_test(3, "GET /api/owner/hotels - List owner A's hotels", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            response = requests.get(f"{BASE_URL}/owner/hotels", headers=headers, timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                
                log_detail(f"Total hotels: {len(hotels)}")
                
                # Find our created hotel
                found_hotel = None
                for h in hotels:
                    if h.get('id') == hotel_id:
                        found_hotel = h
                        break
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotels is array", isinstance(hotels, list)))
                checks.append(("created hotel in list", found_hotel is not None))
                if found_hotel:
                    checks.append(("hotel.ownerId == userA.id", found_hotel.get('ownerId') == userA_id))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(3, "List owner hotels - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(3, "List owner hotels - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(3, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(3, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 4: PUT /api/owner/hotels/:id - Update hotel (active=false, then rooms)
        # ============================================================
        log_test(4, "PUT /api/owner/hotels/:id - Update active=false", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            update_data = {"active": False}
            
            response = requests.put(f"{BASE_URL}/owner/hotels/{hotel_id}", json=update_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                updated_hotel = response.json()
                
                log_detail(f"Hotel active: {updated_hotel.get('active')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotel.active == false", updated_hotel.get('active') == False))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(4, "Update active=false - PASS", "PASS")
                else:
                    log_test(4, "Update active=false - FAIL", "FAIL")
            else:
                log_test(4, f"Failed with status {response.status_code}: {response.text}", "FAIL")
        except Exception as e:
            log_test(4, f"Error: {str(e)}", "FAIL")
        
        log_test("4.1", "PUT /api/owner/hotels/:id - Update rooms (recompute priceCDF)", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            update_data = {
                "rooms": [
                    {
                        "name": "Eco",
                        "priceCDF": "80000",
                        "capacity": 2,
                        "beds": "1"
                    }
                ]
            }
            
            response = requests.put(f"{BASE_URL}/owner/hotels/{hotel_id}", json=update_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                updated_hotel = response.json()
                
                log_detail(f"Hotel priceCDF: {updated_hotel.get('priceCDF')}")
                log_detail(f"Rooms count: {len(updated_hotel.get('rooms', []))}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotel.priceCDF == 80000 (recomputed)", updated_hotel.get('priceCDF') == 80000))
                checks.append(("1 room", len(updated_hotel.get('rooms', [])) == 1))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("4.1", "Update rooms - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("4.1", "Update rooms - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("4.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("4.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 5: OWNERSHIP ISOLATION - Register owner B and test access
        # ============================================================
        log_test(5, "OWNERSHIP ISOLATION - Register owner B", "INFO")
        try:
            rand_suffix = random_email_suffix()
            ownerB_email = f"ownerB+{rand_suffix}@test.com"
            register_data = {
                "name": "Owner B",
                "email": ownerB_email,
                "password": "pass1234"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                tokenB = auth_data.get('token')
                userB_id = auth_data.get('user', {}).get('id')
                
                log_detail(f"Owner B registered: {auth_data.get('user', {}).get('name')} ({ownerB_email})")
                log_detail(f"User ID: {userB_id}")
                
                if tokenB and userB_id:
                    log_test(5, "Owner B registration - PASS", "PASS")
                else:
                    log_test(5, "Owner B registration - FAIL", "FAIL")
            else:
                log_test(5, f"Failed with status {response.status_code}: {response.text}", "FAIL")
        except Exception as e:
            log_test(5, f"Error: {str(e)}", "FAIL")
        
        if not tokenB:
            log_test("ABORT", "Cannot continue without tokenB", "FAIL")
            return results
        
        log_test("5.1", "PUT /api/owner/hotels/:id with tokenB - Should return 404", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenB}"}
            update_data = {"active": True}
            
            response = requests.put(f"{BASE_URL}/owner/hotels/{hotel_id}", json=update_data, headers=headers, timeout=10)
            
            if response.status_code == 404:
                log_detail("Correctly returned 404 (not owner)")
                log_test("5.1", "Ownership isolation (PUT) - PASS", "PASS")
            else:
                log_test("5.1", f"Expected 404, got {response.status_code}", "FAIL")
        except Exception as e:
            log_test("5.1", f"Error: {str(e)}", "FAIL")
        
        log_test("5.2", "GET /api/owner/hotels with tokenB - Should NOT include owner A's hotel", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenB}"}
            response = requests.get(f"{BASE_URL}/owner/hotels", headers=headers, timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                
                log_detail(f"Owner B hotels count: {len(hotels)}")
                
                # Check if owner A's hotel is in the list
                found_ownerA_hotel = any(h.get('id') == hotel_id for h in hotels)
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("Owner A's hotel NOT in list", not found_ownerA_hotel))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("5.2", "Ownership isolation (GET) - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("5.2", "Ownership isolation (GET) - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("5.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("5.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 6: Create a booking for owner A's hotel
        # ============================================================
        log_test(6, "Create booking for owner A's hotel", "INFO")
        try:
            # Get the room ID from owner A's hotel
            headers = {"Authorization": f"Bearer {tokenA}"}
            response = requests.get(f"{BASE_URL}/owner/hotels", headers=headers, timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                owner_hotel = next((h for h in hotels if h.get('id') == hotel_id), None)
                
                if owner_hotel and owner_hotel.get('rooms'):
                    room_id = owner_hotel['rooms'][0]['id']
                    
                    booking_data = {
                        "hotelId": hotel_id,
                        "roomId": room_id,
                        "checkIn": "2025-09-01",
                        "checkOut": "2025-09-04",
                        "guests": 2,
                        "currency": "USD",
                        "customer": {
                            "name": "Test Customer",
                            "email": "customer@test.com",
                            "phone": "+243990123456"
                        },
                        "paymentMethod": "visa"
                    }
                    
                    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
                    
                    if response.status_code == 200:
                        booking = response.json()
                        booking_id = booking.get('id')
                        
                        log_detail(f"Booking created: {booking.get('reference')}")
                        log_detail(f"Hotel ID: {booking.get('hotelId')}")
                        log_detail(f"Total CDF: {booking.get('totalCDF')}")
                        log_detail(f"Payout CDF: {booking.get('payoutCDF')}")
                        
                        # Verify expectations
                        checks = []
                        checks.append(("HTTP 200", True))
                        checks.append(("booking.id present", booking_id is not None))
                        checks.append(("booking.hotelId matches", booking.get('hotelId') == hotel_id))
                        checks.append(("booking.payoutCDF present", booking.get('payoutCDF') is not None))
                        
                        all_passed = all(check[1] for check in checks)
                        
                        for check_name, check_result in checks:
                            status = "✓" if check_result else "✗"
                            log_detail(f"{status} {check_name}")
                        
                        if all_passed:
                            log_test(6, "Create booking - PASS", "PASS")
                            results["passed"] += 1
                        else:
                            log_test(6, "Create booking - FAIL", "FAIL")
                            results["failed"] += 1
                    else:
                        log_test(6, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                        results["failed"] += 1
                else:
                    log_test(6, "Could not get room ID from hotel", "FAIL")
                    results["failed"] += 1
            else:
                log_test(6, f"Failed to get hotels: {response.status_code}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(6, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 7: GET /api/owner/bookings and GET /api/owner/stats
        # ============================================================
        log_test(7, "GET /api/owner/bookings - List owner A's bookings", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            response = requests.get(f"{BASE_URL}/owner/bookings", headers=headers, timeout=10)
            
            if response.status_code == 200:
                bookings = response.json()
                
                log_detail(f"Total bookings: {len(bookings)}")
                
                # Find our created booking
                found_booking = None
                for b in bookings:
                    if b.get('id') == booking_id:
                        found_booking = b
                        break
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("bookings is array", isinstance(bookings, list)))
                checks.append(("created booking in list", found_booking is not None))
                if found_booking:
                    checks.append(("booking.hotelId matches", found_booking.get('hotelId') == hotel_id))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(7, "List owner bookings - PASS", "PASS")
                else:
                    log_test(7, "List owner bookings - FAIL", "FAIL")
            else:
                log_test(7, f"Failed with status {response.status_code}: {response.text}", "FAIL")
        except Exception as e:
            log_test(7, f"Error: {str(e)}", "FAIL")
        
        log_test("7.1", "GET /api/owner/stats - Get owner A's statistics", "INFO")
        try:
            headers = {"Authorization": f"Bearer {tokenA}"}
            response = requests.get(f"{BASE_URL}/owner/stats", headers=headers, timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                
                log_detail(f"Properties: {stats.get('properties')}")
                log_detail(f"Rooms: {stats.get('rooms')}")
                log_detail(f"Bookings: {stats.get('bookings')}")
                log_detail(f"Pending: {stats.get('pending')}")
                log_detail(f"Payout CDF: {stats.get('payoutCDF')}")
                log_detail(f"Revenue CDF: {stats.get('revenueCDF')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("properties == 1", stats.get('properties') == 1))
                checks.append(("rooms == 1 (after step 4.1)", stats.get('rooms') == 1))
                checks.append(("bookings == 1", stats.get('bookings') == 1))
                checks.append(("pending present", stats.get('pending') is not None))
                checks.append(("payoutCDF > 0", stats.get('payoutCDF', 0) > 0))
                checks.append(("revenueCDF > 0", stats.get('revenueCDF', 0) > 0))
                
                # Verify payoutCDF matches booking.payoutCDF
                if found_booking:
                    expected_payout = found_booking.get('payoutCDF')
                    actual_payout = stats.get('payoutCDF')
                    checks.append(("payoutCDF == booking.payoutCDF", expected_payout == actual_payout))
                    log_detail(f"Expected payout: {expected_payout}, Actual: {actual_payout}")
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("7.1", "Owner stats - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("7.1", "Owner stats - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("7.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("7.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 8: Confirm no Mongo _id in responses
        # ============================================================
        log_test(8, "Confirm no Mongo _id in all responses", "INFO")
        try:
            # Check hotel response
            headers = {"Authorization": f"Bearer {tokenA}"}
            response = requests.get(f"{BASE_URL}/owner/hotels", headers=headers, timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                has_id_leak = any('_id' in h for h in hotels)
                
                log_detail(f"Hotels have _id field: {has_id_leak}")
                
                # Check booking response
                response = requests.get(f"{BASE_URL}/owner/bookings", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    bookings = response.json()
                    has_booking_id_leak = any('_id' in b for b in bookings)
                    
                    log_detail(f"Bookings have _id field: {has_booking_id_leak}")
                    
                    # Verify expectations
                    checks = []
                    checks.append(("No _id in hotels", not has_id_leak))
                    checks.append(("No _id in bookings", not has_booking_id_leak))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test(8, "No Mongo _id leak - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test(8, "Mongo _id leak detected - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test(8, f"Failed to fetch bookings: {response.status_code}", "FAIL")
                    results["failed"] += 1
            else:
                log_test(8, f"Failed to fetch hotels: {response.status_code}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(8, f"Error: {str(e)}", "FAIL")
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
    print(f"Success Rate: {(results['passed'] / results['total'] * 100):.1f}%\n")
    
    return results

if __name__ == "__main__":
    results = test_hotel_owner_endpoints()
    sys.exit(0 if results["failed"] == 0 else 1)
