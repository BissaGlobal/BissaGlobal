#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - NEW Features
Tests 3 NEW features:
A) CITY FILTER on hotels list
B) CUSTOMER REVIEW submission
C) CUSTOMER CANCELLATION
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

def test_new_features():
    """Test the 3 NEW features"""
    
    print(f"\n{BLUE}{'='*80}")
    print(f"YABISO HOTELS - NEW Features Test")
    print(f"A) CITY FILTER on hotels list")
    print(f"B) CUSTOMER REVIEW submission")
    print(f"C) CUSTOMER CANCELLATION")
    print(f"{'='*80}{RESET}\n")
    
    results = {
        "total_steps": 0,
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    # Variables to store across steps
    user_token = None
    user_email = None
    user_id = None
    hotel_id = None
    room_id = None
    review_id = None
    orange_booking_ref = None
    visa_booking_ref = None
    user2_token = None
    
    try:
        # ============================================================
        # STEP 0: Seed database
        # ============================================================
        log_test(0, "Seeding database with demo data", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/seed", timeout=10)
            if response.status_code == 200:
                data = response.json()
                log_detail(f"Seed response: seeded={data.get('seeded')}, hotels={data.get('hotels')}")
                log_test(0, "Database seeded successfully", "PASS")
            else:
                log_test(0, f"Seed failed with status {response.status_code}", "WARN")
        except Exception as e:
            log_test(0, f"Seed error: {str(e)}", "WARN")
        
        # ============================================================
        # A) CITY FILTER on hotels list
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"A) CITY FILTER on hotels list")
        print(f"{'='*80}{RESET}\n")
        
        # A.1: GET /api/hotels?city=Kinshasa
        results["total_steps"] += 1
        log_test("A.1", "GET /api/hotels?city=Kinshasa - Filter by city", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/hotels?city=Kinshasa", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                
                log_detail(f"Total hotels returned: {len(hotels)}")
                
                # Verify all hotels have city containing "Kinshasa" (case-insensitive)
                all_match = all('kinshasa' in (h.get('city') or '').lower() for h in hotels)
                
                # Log sample hotels
                for h in hotels[:3]:
                    log_detail(f"  - {h.get('name')} in {h.get('city')}")
                
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotels is array", isinstance(hotels, list)))
                checks.append(("hotels count > 0", len(hotels) > 0))
                checks.append(("all hotels city contains 'Kinshasa'", all_match))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("A.1", "City filter Kinshasa - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("A.1", "City filter Kinshasa - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("A.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("A.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # A.2: GET /api/hotels?city=Goma
        results["total_steps"] += 1
        log_test("A.2", "GET /api/hotels?city=Goma - Filter by city", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/hotels?city=Goma", timeout=10)
            
            if response.status_code == 200:
                hotels = response.json()
                
                log_detail(f"Total hotels returned: {len(hotels)}")
                
                # Verify all hotels have city containing "Goma" (case-insensitive)
                all_match = all('goma' in (h.get('city') or '').lower() for h in hotels)
                
                # Log sample hotels
                for h in hotels[:3]:
                    log_detail(f"  - {h.get('name')} in {h.get('city')}")
                
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("hotels is array", isinstance(hotels, list)))
                checks.append(("hotels count > 0", len(hotels) > 0))
                checks.append(("all hotels city contains 'Goma'", all_match))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("A.2", "City filter Goma - PASS", "PASS")
                    results["passed"] += 1
                    # Store hotel_id for later use
                    if hotels:
                        hotel_id = hotels[0].get('id')
                        log_detail(f"Stored hotel_id: {hotel_id}")
                else:
                    log_test("A.2", "City filter Goma - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("A.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("A.2", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # If no hotel_id from Goma, get from all hotels
        if not hotel_id:
            log_test("A.2.1", "Getting hotel_id from all hotels", "INFO")
            try:
                response = requests.get(f"{BASE_URL}/hotels", timeout=10)
                if response.status_code == 200:
                    hotels = response.json()
                    if hotels:
                        hotel_id = hotels[0].get('id')
                        room_id = hotels[0].get('rooms', [{}])[0].get('id')
                        log_detail(f"Stored hotel_id: {hotel_id}")
                        log_detail(f"Stored room_id: {room_id}")
            except Exception as e:
                log_test("A.2.1", f"Error: {str(e)}", "WARN")
        
        # ============================================================
        # B) CUSTOMER REVIEW submission
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"B) CUSTOMER REVIEW submission")
        print(f"{'='*80}{RESET}\n")
        
        if not hotel_id:
            log_test("B", "Cannot test reviews without hotel_id", "FAIL")
            results["failed"] += 4
            results["total_steps"] += 4
        else:
            # B.1: POST /api/reviews with valid data
            results["total_steps"] += 1
            log_test("B.1", "POST /api/reviews - Create review with valid data", "INFO")
            try:
                review_data = {
                    "hotelId": hotel_id,
                    "author": "QA Reviewer",
                    "rating": 5,
                    "comment": "Super séjour test"
                }
                
                response = requests.post(f"{BASE_URL}/reviews", json=review_data, timeout=10)
                
                if response.status_code == 200:
                    review = response.json()
                    review_id = review.get('id')
                    
                    log_detail(f"Review created: ID={review_id}")
                    log_detail(f"Author: {review.get('author')}")
                    log_detail(f"Rating: {review.get('rating')}")
                    log_detail(f"Comment: {review.get('comment')}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("review.id present", review_id is not None))
                    checks.append(("review.author == 'QA Reviewer'", review.get('author') == "QA Reviewer"))
                    checks.append(("review.rating == 5", review.get('rating') == 5))
                    checks.append(("review.comment matches", review.get('comment') == "Super séjour test"))
                    checks.append(("no _id field", '_id' not in review))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("B.1", "Create review - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("B.1", "Create review - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("B.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("B.1", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # B.2: GET /api/hotels/:id - Verify review is in reviews array
            results["total_steps"] += 1
            log_test("B.2", "GET /api/hotels/:id - Verify review in reviews array", "INFO")
            try:
                response = requests.get(f"{BASE_URL}/hotels/{hotel_id}", timeout=10)
                
                if response.status_code == 200:
                    hotel = response.json()
                    reviews = hotel.get('reviews', [])
                    
                    log_detail(f"Total reviews: {len(reviews)}")
                    
                    # Find our review
                    found_review = None
                    for r in reviews:
                        if r.get('author') == "QA Reviewer":
                            found_review = r
                            break
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("reviews is array", isinstance(reviews, list)))
                    checks.append(("review with author 'QA Reviewer' found", found_review is not None))
                    if found_review:
                        checks.append(("review.rating == 5", found_review.get('rating') == 5))
                        checks.append(("review.comment matches", found_review.get('comment') == "Super séjour test"))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("B.2", "Review in hotel reviews array - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("B.2", "Review in hotel reviews array - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("B.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("B.2", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # B.3: POST /api/reviews without rating -> 400
            results["total_steps"] += 1
            log_test("B.3", "POST /api/reviews - Missing rating should return 400", "INFO")
            try:
                review_data = {
                    "hotelId": hotel_id,
                    "author": "Test Author",
                    "comment": "Test comment"
                    # Missing rating
                }
                
                response = requests.post(f"{BASE_URL}/reviews", json=review_data, timeout=10)
                
                if response.status_code == 400:
                    log_detail("Correctly returned 400 for missing rating")
                    log_test("B.3", "Validation (missing rating) - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("B.3", f"Expected 400, got {response.status_code}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("B.3", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # B.4: POST /api/reviews without hotelId -> 400
            results["total_steps"] += 1
            log_test("B.4", "POST /api/reviews - Missing hotelId should return 400", "INFO")
            try:
                review_data = {
                    "author": "Test Author",
                    "rating": 5,
                    "comment": "Test comment"
                    # Missing hotelId
                }
                
                response = requests.post(f"{BASE_URL}/reviews", json=review_data, timeout=10)
                
                if response.status_code == 400:
                    log_detail("Correctly returned 400 for missing hotelId")
                    log_test("B.4", "Validation (missing hotelId) - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("B.4", f"Expected 400, got {response.status_code}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("B.4", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
        
        # ============================================================
        # C) CUSTOMER CANCELLATION
        # ============================================================
        print(f"\n{BLUE}{'='*80}")
        print(f"C) CUSTOMER CANCELLATION")
        print(f"{'='*80}{RESET}\n")
        
        # C.1: Register user
        results["total_steps"] += 1
        log_test("C.1", "Register user for cancellation tests", "INFO")
        try:
            rand_suffix = random_email_suffix()
            user_email = f"cancel+{rand_suffix}@test.com"
            register_data = {
                "name": "Cancel User",
                "email": user_email,
                "password": "pass1234"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                user_token = auth_data.get('token')
                user_id = auth_data.get('user', {}).get('id')
                
                log_detail(f"User registered: {auth_data.get('user', {}).get('name')} ({user_email})")
                log_detail(f"User ID: {user_id}")
                log_detail(f"Token: {user_token[:20]}..." if user_token else "No token")
                
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("token present", user_token is not None))
                checks.append(("user.id present", user_id is not None))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test("C.1", "User registration - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("C.1", "User registration - FAIL", "FAIL")
                    results["failed"] += 1
            else:
                log_test("C.1", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test("C.1", f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        if not user_token or not hotel_id:
            log_test("C", "Cannot continue without user_token and hotel_id", "FAIL")
            results["failed"] += 8
            results["total_steps"] += 8
        else:
            # Get room_id if not already set
            if not room_id:
                try:
                    response = requests.get(f"{BASE_URL}/hotels/{hotel_id}", timeout=10)
                    if response.status_code == 200:
                        hotel = response.json()
                        room_id = hotel.get('rooms', [{}])[0].get('id')
                        log_detail(f"Stored room_id: {room_id}")
                except Exception as e:
                    log_test("C.1.1", f"Error getting room_id: {str(e)}", "WARN")
            
            # C.2: Create booking with orange (mobile money) -> status "pending_payment"
            results["total_steps"] += 1
            log_test("C.2", "Create booking with orange (mobile money) - status should be 'pending_payment'", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                booking_data = {
                    "hotelId": hotel_id,
                    "roomId": room_id,
                    "checkIn": "2025-10-01",
                    "checkOut": "2025-10-03",
                    "guests": 2,
                    "currency": "USD",
                    "customer": {
                        "name": "Cancel User",
                        "email": user_email,
                        "phone": "+243990000000"
                    },
                    "paymentMethod": "orange",
                    "payment": {
                        "txId": "X1",
                        "payerPhone": "+243990000000"
                    }
                }
                
                response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    orange_booking_ref = booking.get('reference')
                    
                    log_detail(f"Booking created: {orange_booking_ref}")
                    log_detail(f"Status: {booking.get('status')}")
                    log_detail(f"Payment status: {booking.get('payment', {}).get('status')}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("booking.reference present", orange_booking_ref is not None))
                    checks.append(("booking.status == 'pending_payment'", booking.get('status') == 'pending_payment'))
                    checks.append(("payment.status == 'pending'", booking.get('payment', {}).get('status') == 'pending'))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("C.2", "Orange booking (pending_payment) - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.2", "Orange booking (pending_payment) - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.2", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.2", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.3: Cancel orange booking -> status "cancelled"
            results["total_steps"] += 1
            log_test("C.3", "POST /api/bookings/:ref/cancel - Cancel pending payment booking", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                response = requests.post(f"{BASE_URL}/bookings/{orange_booking_ref}/cancel", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    
                    log_detail(f"Booking status: {booking.get('status')}")
                    log_detail(f"Status history length: {len(booking.get('statusHistory', []))}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("booking.status == 'cancelled'", booking.get('status') == 'cancelled'))
                    checks.append(("statusHistory has 'cancelled' entry", any(h.get('key') == 'cancelled' for h in booking.get('statusHistory', []))))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("C.3", "Cancel pending payment booking - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.3", "Cancel pending payment booking - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.3", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.3", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.4: Create booking with visa (instant) -> status "payment_received"
            results["total_steps"] += 1
            log_test("C.4", "Create booking with visa (instant) - status should be 'payment_received'", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                booking_data = {
                    "hotelId": hotel_id,
                    "roomId": room_id,
                    "checkIn": "2025-10-05",
                    "checkOut": "2025-10-07",
                    "guests": 2,
                    "currency": "USD",
                    "customer": {
                        "name": "Cancel User",
                        "email": user_email,
                        "phone": "+243990000000"
                    },
                    "paymentMethod": "visa"
                }
                
                response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    visa_booking_ref = booking.get('reference')
                    
                    log_detail(f"Booking created: {visa_booking_ref}")
                    log_detail(f"Status: {booking.get('status')}")
                    log_detail(f"Payment status: {booking.get('payment', {}).get('status')}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("booking.reference present", visa_booking_ref is not None))
                    checks.append(("booking.status == 'payment_received'", booking.get('status') == 'payment_received'))
                    checks.append(("payment.status == 'approved'", booking.get('payment', {}).get('status') == 'approved'))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("C.4", "Visa booking (payment_received) - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.4", "Visa booking (payment_received) - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.4", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.4", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.5: Cancel visa booking -> status "refunded"
            results["total_steps"] += 1
            log_test("C.5", "POST /api/bookings/:ref/cancel - Cancel approved payment booking", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                response = requests.post(f"{BASE_URL}/bookings/{visa_booking_ref}/cancel", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    
                    log_detail(f"Booking status: {booking.get('status')}")
                    log_detail(f"Status history length: {len(booking.get('statusHistory', []))}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("booking.status == 'refunded'", booking.get('status') == 'refunded'))
                    checks.append(("statusHistory has 'refunded' entry", any(h.get('key') == 'refunded' for h in booking.get('statusHistory', []))))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("C.5", "Cancel approved payment booking (refunded) - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.5", "Cancel approved payment booking (refunded) - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.5", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.5", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.6: SECURITY - Cancel without token -> 401
            results["total_steps"] += 1
            log_test("C.6", "SECURITY - Cancel without token should return 401", "INFO")
            try:
                # Create a new booking first
                headers = {"Authorization": f"Bearer {user_token}"}
                booking_data = {
                    "hotelId": hotel_id,
                    "roomId": room_id,
                    "checkIn": "2025-10-10",
                    "checkOut": "2025-10-12",
                    "guests": 2,
                    "currency": "USD",
                    "customer": {
                        "name": "Cancel User",
                        "email": user_email,
                        "phone": "+243990000000"
                    },
                    "paymentMethod": "orange",
                    "payment": {"txId": "X2"}
                }
                
                response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    test_ref = booking.get('reference')
                    
                    # Try to cancel without token
                    response = requests.post(f"{BASE_URL}/bookings/{test_ref}/cancel", timeout=10)
                    
                    if response.status_code == 401:
                        log_detail("Correctly returned 401 for missing token")
                        log_test("C.6", "Security (no token) - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.6", f"Expected 401, got {response.status_code}", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.6", f"Failed to create test booking: {response.status_code}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.6", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.7: SECURITY - Cancel with different user token -> 403
            results["total_steps"] += 1
            log_test("C.7", "SECURITY - Cancel with different user token should return 403", "INFO")
            try:
                # Register second user
                rand_suffix2 = random_email_suffix()
                user2_email = f"cancel2+{rand_suffix2}@test.com"
                register_data = {
                    "name": "Cancel User 2",
                    "email": user2_email,
                    "password": "pass1234"
                }
                
                response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
                
                if response.status_code == 200:
                    auth_data = response.json()
                    user2_token = auth_data.get('token')
                    
                    # Create booking with user 1
                    headers = {"Authorization": f"Bearer {user_token}"}
                    booking_data = {
                        "hotelId": hotel_id,
                        "roomId": room_id,
                        "checkIn": "2025-10-15",
                        "checkOut": "2025-10-17",
                        "guests": 2,
                        "currency": "USD",
                        "customer": {
                            "name": "Cancel User",
                            "email": user_email,
                            "phone": "+243990000000"
                        },
                        "paymentMethod": "orange",
                        "payment": {"txId": "X3"}
                    }
                    
                    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        booking = response.json()
                        test_ref = booking.get('reference')
                        
                        # Try to cancel with user 2 token
                        headers2 = {"Authorization": f"Bearer {user2_token}"}
                        response = requests.post(f"{BASE_URL}/bookings/{test_ref}/cancel", headers=headers2, timeout=10)
                        
                        if response.status_code == 403:
                            log_detail("Correctly returned 403 for different user")
                            log_test("C.7", "Security (different user) - PASS", "PASS")
                            results["passed"] += 1
                        else:
                            log_test("C.7", f"Expected 403, got {response.status_code}", "FAIL")
                            results["failed"] += 1
                    else:
                        log_test("C.7", f"Failed to create test booking: {response.status_code}", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.7", f"Failed to register user 2: {response.status_code}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.7", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.8: Cancel already cancelled booking -> 400
            results["total_steps"] += 1
            log_test("C.8", "Cancel already cancelled booking should return 400", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                # Try to cancel the already cancelled orange booking
                response = requests.post(f"{BASE_URL}/bookings/{orange_booking_ref}/cancel", headers=headers, timeout=10)
                
                if response.status_code == 400:
                    log_detail("Correctly returned 400 for already cancelled booking")
                    log_test("C.8", "Cancel already cancelled - PASS", "PASS")
                    results["passed"] += 1
                else:
                    log_test("C.8", f"Expected 400, got {response.status_code}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.8", f"Error: {str(e)}", "FAIL")
                results["failed"] += 1
            
            # C.9: Confirm no Mongo _id leaks
            results["total_steps"] += 1
            log_test("C.9", "Confirm no Mongo _id in booking responses", "INFO")
            try:
                headers = {"Authorization": f"Bearer {user_token}"}
                response = requests.get(f"{BASE_URL}/bookings/{visa_booking_ref}", timeout=10)
                
                if response.status_code == 200:
                    booking = response.json()
                    
                    has_id_leak = '_id' in booking
                    
                    log_detail(f"Booking has _id field: {has_id_leak}")
                    
                    checks = []
                    checks.append(("HTTP 200", True))
                    checks.append(("No _id in booking", not has_id_leak))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test("C.9", "No Mongo _id leak - PASS", "PASS")
                        results["passed"] += 1
                    else:
                        log_test("C.9", "Mongo _id leak detected - FAIL", "FAIL")
                        results["failed"] += 1
                else:
                    log_test("C.9", f"Failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
            except Exception as e:
                log_test("C.9", f"Error: {str(e)}", "FAIL")
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
    print(f"Total Tests: {results['total_steps']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    if results['total_steps'] > 0:
        print(f"Success Rate: {(results['passed'] / results['total_steps'] * 100):.1f}%\n")
    else:
        print(f"Success Rate: 0.0%\n")
    
    return results

if __name__ == "__main__":
    results = test_new_features()
    sys.exit(0 if results["failed"] == 0 else 1)
