#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - Email Integration (Resend)
Tests that email notifications do NOT break register and booking flows
"""

import requests
import json
import sys
import random
import string
import time
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
    print(f"{color}[{status}] Step {step}: {message}{RESET}")

def log_detail(message):
    print(f"  → {message}")

def random_email_suffix():
    """Generate random suffix for email to avoid duplicates"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

def test_email_integration():
    """Test that email integration does NOT break register and booking flows"""
    
    print(f"\n{BLUE}{'='*80}")
    print(f"YABISO HOTELS - Email Integration Test (Resend)")
    print(f"Testing that email notifications do NOT break existing flows")
    print(f"{'='*80}{RESET}\n")
    
    results = {
        "total": 5,
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    # Variables to store across steps
    token = None
    user_id = None
    hotel_id = None
    room_id = None
    booking_reference = None
    
    try:
        # ============================================================
        # STEP 1: POST /api/auth/register - Verify registration still works
        # ============================================================
        log_test(1, "POST /api/auth/register - Verify registration still works with email integration", "INFO")
        try:
            rand_suffix = random_email_suffix()
            test_email = f"emailtest+{rand_suffix}@yabiso.test"
            register_data = {
                "name": "Email Test User",
                "email": test_email,
                "password": "test1234"
            }
            
            start_time = time.time()
            response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=15)
            elapsed_time = time.time() - start_time
            
            log_detail(f"Response time: {elapsed_time:.2f}s")
            
            if response.status_code == 200:
                auth_data = response.json()
                token = auth_data.get('token')
                user = auth_data.get('user', {})
                user_id = user.get('id')
                user_name = user.get('name')
                user_email = user.get('email')
                
                log_detail(f"User registered: {user_name} ({user_email})")
                log_detail(f"User ID: {user_id}")
                log_detail(f"Token: {token[:20]}..." if token else "No token")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("Response time < 5s (non-blocking)", elapsed_time < 5.0))
                checks.append(("token present", token is not None))
                checks.append(("user.id present", user_id is not None))
                checks.append(("user.name correct", user_name == "Email Test User"))
                checks.append(("user.email correct", user_email == test_email.lower()))
                checks.append(("no _id field", '_id' not in user))
                checks.append(("no passwordHash field", 'passwordHash' not in user))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(1, "Registration with email integration - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(1, "Registration with email integration - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(1, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(1, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        if not token or not user_id:
            log_test("ABORT", "Cannot continue without token and user_id", "FAIL")
            return results
        
        # ============================================================
        # STEP 2: Verify user was actually created - GET /api/auth/me
        # ============================================================
        log_test(2, "GET /api/auth/me - Verify user was actually created", "INFO")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user = response.json()
                
                log_detail(f"User retrieved: {user.get('name')} ({user.get('email')})")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("user.id matches", user.get('id') == user_id))
                checks.append(("user.name matches", user.get('name') == "Email Test User"))
                checks.append(("no passwordHash field", 'passwordHash' not in user))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(2, "User verification - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(2, "User verification - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(2, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(2, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # STEP 3: GET /api/hotels - Pick a valid hotel and room
        # ============================================================
        log_test(3, "GET /api/hotels - Pick a valid hotel and room for booking", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/hotels", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                
                if len(hotels) > 0:
                    # Pick the first hotel with rooms
                    hotel = hotels[0]
                    hotel_id = hotel.get('id')
                    hotel_name = hotel.get('name')
                    
                    if hotel.get('rooms') and len(hotel['rooms']) > 0:
                        room = hotel['rooms'][0]
                        room_id = room.get('id')
                        room_name = room.get('name')
                        room_price = room.get('priceCDF')
                        
                        log_detail(f"Selected hotel: {hotel_name} (ID: {hotel_id})")
                        log_detail(f"Selected room: {room_name} (ID: {room_id}, Price: {room_price} CDF)")
                        
                        log_test(3, "Hotel and room selection - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test(3, "Hotel has no rooms", "FAIL")
                        results["failed"] += 1
                else:
                    log_test(3, "No hotels found", "FAIL")
                    results["failed"] += 1
            else:
                log_test(3, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(3, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        if not hotel_id or not room_id:
            log_test("ABORT", "Cannot continue without hotel_id and room_id", "FAIL")
            return results
        
        # ============================================================
        # STEP 4: POST /api/bookings - Verify booking still works with email integration
        # ============================================================
        log_test(4, "POST /api/bookings - Verify booking still works with email integration", "INFO")
        try:
            # Create booking with future dates
            check_in = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            check_out = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")
            
            booking_data = {
                "hotelId": hotel_id,
                "roomId": room_id,
                "checkIn": check_in,
                "checkOut": check_out,
                "guests": 2,
                "currency": "USD",
                "customer": {
                    "name": "Email Test Customer",
                    "email": f"customer+{random_email_suffix()}@yabiso.test",
                    "phone": "+243990123456"
                },
                "paymentMethod": "visa"
            }
            
            start_time = time.time()
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=15)
            elapsed_time = time.time() - start_time
            
            log_detail(f"Response time: {elapsed_time:.2f}s")
            
            if response.status_code == 200:
                booking = response.json()
                booking_reference = booking.get('reference')
                booking_status = booking.get('status')
                booking_total_cdf = booking.get('totalCDF')
                booking_total_display = booking.get('totalDisplay')
                booking_currency = booking.get('currency')
                
                log_detail(f"Booking created: {booking_reference}")
                log_detail(f"Status: {booking_status}")
                log_detail(f"Total: {booking_total_display} {booking_currency} ({booking_total_cdf} CDF)")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("Response time < 5s (non-blocking)", elapsed_time < 5.0))
                checks.append(("booking.reference present", booking_reference is not None))
                checks.append(("reference format YBS-XXXXXX", booking_reference and booking_reference.startswith('YBS-') and len(booking_reference) == 10))
                checks.append(("booking.status present", booking_status is not None))
                checks.append(("booking.totalCDF present", booking_total_cdf is not None))
                checks.append(("booking.totalDisplay present", booking_total_display is not None))
                checks.append(("no _id field", '_id' not in booking))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(4, "Booking with email integration - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(4, "Booking with email integration - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(4, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(4, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        if not booking_reference:
            log_test("ABORT", "Cannot continue without booking_reference", "FAIL")
            return results
        
        # ============================================================
        # STEP 5: GET /api/bookings/:reference - Verify booking was persisted
        # ============================================================
        log_test(5, "GET /api/bookings/:reference - Verify booking was persisted", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/bookings/{booking_reference}", timeout=10)
            
            if response.status_code == 200:
                booking = response.json()
                
                log_detail(f"Booking retrieved: {booking.get('reference')}")
                log_detail(f"Hotel: {booking.get('hotelName')}")
                log_detail(f"Status: {booking.get('status')}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("booking.reference matches", booking.get('reference') == booking_reference))
                checks.append(("booking.hotelId matches", booking.get('hotelId') == hotel_id))
                checks.append(("booking.roomId matches", booking.get('roomId') == room_id))
                checks.append(("no _id field", '_id' not in booking))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(5, "Booking persistence verification - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test(5, "Booking persistence verification - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test(5, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(5, f"Error: {str(e)}", "FAIL")
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
    results = test_email_integration()
    sys.exit(0 if results["failed"] == 0 else 1)
