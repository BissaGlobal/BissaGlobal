#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - Mobile Money Payment + Admin Verification Flow
Tests the manual payment flow (Orange Money, Bank Transfer) with admin approval/rejection
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from .env
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

# Test data
ADMIN_EMAIL = "admin@yabiso.com"
ADMIN_PASSWORD = "yabiso2025"

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

def test_mobile_money_payment_flow():
    """Test the complete mobile money payment + admin verification flow"""
    
    print(f"\n{BLUE}{'='*80}")
    print(f"YABISO HOTELS - Mobile Money Payment + Admin Verification Test")
    print(f"{'='*80}{RESET}\n")
    
    results = {
        "total": 9,
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
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
                log_test(0, f"Seed failed with status {response.status_code}", "FAIL")
                results["failed"] += 1
        except Exception as e:
            log_test(0, f"Seed error: {str(e)}", "FAIL")
            results["failed"] += 1
        
        # ============================================================
        # Get a real hotel and room ID
        # ============================================================
        log_test("0.1", "Fetching hotels to get real hotelId and roomId", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/hotels", timeout=10)
            if response.status_code == 200:
                hotels = response.json()
                if len(hotels) > 0:
                    test_hotel = hotels[0]
                    hotel_id = test_hotel['id']
                    room_id = test_hotel['rooms'][0]['id']
                    log_detail(f"Using hotel: {test_hotel['name']} (ID: {hotel_id})")
                    log_detail(f"Using room: {test_hotel['rooms'][0]['name']} (ID: {room_id})")
                    log_test("0.1", "Got real hotel and room IDs", "PASS")
                else:
                    log_test("0.1", "No hotels found in database", "FAIL")
                    return results
            else:
                log_test("0.1", f"Failed to fetch hotels: {response.status_code}", "FAIL")
                return results
        except Exception as e:
            log_test("0.1", f"Error fetching hotels: {str(e)}", "FAIL")
            return results
        
        # ============================================================
        # STEP 1: INSTANT payment (Visa)
        # ============================================================
        log_test(1, "Testing INSTANT payment with Visa", "INFO")
        try:
            booking_data = {
                "hotelId": hotel_id,
                "roomId": room_id,
                "checkIn": "2025-08-01",
                "checkOut": "2025-08-03",
                "guests": 2,
                "currency": "USD",
                "customer": {
                    "name": "Alice Johnson",
                    "email": "alice.johnson@example.com",
                    "phone": "+243990111222"
                },
                "paymentMethod": "visa"
            }
            
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
            
            if response.status_code == 200:
                booking = response.json()
                log_detail(f"Booking reference: {booking.get('reference')}")
                log_detail(f"Payment status: {booking.get('payment', {}).get('status')}")
                log_detail(f"Booking status: {booking.get('status')}")
                log_detail(f"StatusHistory length: {len(booking.get('statusHistory', []))}")
                
                # Verify expectations
                checks = []
                checks.append(("payment.status == 'approved'", booking.get('payment', {}).get('status') == 'approved'))
                checks.append(("booking.status == 'payment_received'", booking.get('status') == 'payment_received'))
                checks.append(("statusHistory length == 2", len(booking.get('statusHistory', [])) == 2))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(1, "INSTANT payment (Visa) - ALL CHECKS PASSED", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 1, "status": "PASS", "message": "Instant payment working correctly"})
                else:
                    log_test(1, "INSTANT payment (Visa) - SOME CHECKS FAILED", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 1, "status": "FAIL", "message": "Instant payment checks failed"})
            else:
                log_test(1, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 1, "status": "FAIL", "message": f"HTTP {response.status_code}"})
        except Exception as e:
            log_test(1, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 1, "status": "FAIL", "message": str(e)})
        
        # ============================================================
        # STEP 2: MOBILE MONEY (Orange Money) - Manual payment
        # ============================================================
        log_test(2, "Testing MOBILE MONEY (Orange) - Manual payment", "INFO")
        try:
            booking_data = {
                "hotelId": hotel_id,
                "roomId": room_id,
                "checkIn": "2025-08-01",
                "checkOut": "2025-08-03",
                "guests": 2,
                "currency": "USD",
                "customer": {
                    "name": "Bob Mukendi",
                    "email": "bob.mukendi@example.com",
                    "phone": "+243990000000"
                },
                "paymentMethod": "orange",
                "payment": {
                    "payerPhone": "+243990000000",
                    "txId": "OM-TEST-123",
                    "proofImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                }
            }
            
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
            
            if response.status_code == 200:
                orange_booking = response.json()
                orange_booking_id = orange_booking.get('id')
                orange_booking_ref = orange_booking.get('reference')
                
                log_detail(f"Booking ID: {orange_booking_id}")
                log_detail(f"Booking reference: {orange_booking_ref}")
                log_detail(f"Payment status: {orange_booking.get('payment', {}).get('status')}")
                log_detail(f"Booking status: {orange_booking.get('status')}")
                log_detail(f"StatusHistory length: {len(orange_booking.get('statusHistory', []))}")
                log_detail(f"Payment txId: {orange_booking.get('payment', {}).get('txId')}")
                log_detail(f"Payment payerPhone: {orange_booking.get('payment', {}).get('payerPhone')}")
                log_detail(f"Payment proofImage stored: {len(orange_booking.get('payment', {}).get('proofImage', '')) > 0}")
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("payment.status == 'pending'", orange_booking.get('payment', {}).get('status') == 'pending'))
                checks.append(("booking.status == 'pending_payment'", orange_booking.get('status') == 'pending_payment'))
                checks.append(("statusHistory length == 1", len(orange_booking.get('statusHistory', [])) == 1))
                checks.append(("payment.txId stored", orange_booking.get('payment', {}).get('txId') == 'OM-TEST-123'))
                checks.append(("payment.payerPhone stored", orange_booking.get('payment', {}).get('payerPhone') == '+243990000000'))
                checks.append(("payment.proofImage stored", len(orange_booking.get('payment', {}).get('proofImage', '')) > 0))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(2, "MOBILE MONEY (Orange) - ALL CHECKS PASSED", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 2, "status": "PASS", "message": "Mobile money payment created correctly"})
                else:
                    log_test(2, "MOBILE MONEY (Orange) - SOME CHECKS FAILED", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 2, "status": "FAIL", "message": "Mobile money payment checks failed"})
            else:
                log_test(2, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 2, "status": "FAIL", "message": f"HTTP {response.status_code}"})
                orange_booking_id = None
                orange_booking_ref = None
        except Exception as e:
            log_test(2, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 2, "status": "FAIL", "message": str(e)})
            orange_booking_id = None
            orange_booking_ref = None
        
        # ============================================================
        # STEP 3: BANK transfer - Manual payment
        # ============================================================
        log_test(3, "Testing BANK transfer - Manual payment", "INFO")
        try:
            booking_data = {
                "hotelId": hotel_id,
                "roomId": room_id,
                "checkIn": "2025-08-01",
                "checkOut": "2025-08-03",
                "guests": 2,
                "currency": "USD",
                "customer": {
                    "name": "Charlie Kabila",
                    "email": "charlie.kabila@example.com",
                    "phone": "+243990333444"
                },
                "paymentMethod": "bank",
                "payment": {
                    "txId": "BNK1"
                }
            }
            
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
            
            if response.status_code == 200:
                bank_booking = response.json()
                log_detail(f"Booking reference: {bank_booking.get('reference')}")
                log_detail(f"Payment status: {bank_booking.get('payment', {}).get('status')}")
                
                # Verify expectations
                checks = []
                checks.append(("payment.status == 'pending'", bank_booking.get('payment', {}).get('status') == 'pending'))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(3, "BANK transfer - ALL CHECKS PASSED", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 3, "status": "PASS", "message": "Bank transfer payment created correctly"})
                else:
                    log_test(3, "BANK transfer - SOME CHECKS FAILED", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 3, "status": "FAIL", "message": "Bank transfer payment checks failed"})
            else:
                log_test(3, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 3, "status": "FAIL", "message": f"HTTP {response.status_code}"})
        except Exception as e:
            log_test(3, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 3, "status": "FAIL", "message": str(e)})
        
        # ============================================================
        # STEP 4: Admin login
        # ============================================================
        log_test(4, "Admin login to get admin token", "INFO")
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                admin_token = auth_data.get('token')
                admin_role = auth_data.get('user', {}).get('role')
                
                log_detail(f"Admin role: {admin_role}")
                log_detail(f"Token received: {admin_token[:20]}..." if admin_token else "No token")
                
                if admin_token and admin_role == 'admin':
                    log_test(4, "Admin login successful", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 4, "status": "PASS", "message": "Admin login successful"})
                else:
                    log_test(4, "Admin login failed - invalid role or token", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 4, "status": "FAIL", "message": "Invalid admin credentials"})
                    admin_token = None
            else:
                log_test(4, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 4, "status": "FAIL", "message": f"HTTP {response.status_code}"})
                admin_token = None
        except Exception as e:
            log_test(4, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 4, "status": "FAIL", "message": str(e)})
            admin_token = None
        
        if not admin_token:
            log_test("ABORT", "Cannot continue without admin token", "FAIL")
            return results
        
        # ============================================================
        # STEP 5: GET /api/admin/bookings - Find mobile money booking
        # ============================================================
        log_test(5, "GET /api/admin/bookings - Find mobile money booking", "INFO")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BASE_URL}/admin/bookings", headers=headers, timeout=10)
            
            if response.status_code == 200:
                bookings = response.json()
                log_detail(f"Total bookings: {len(bookings)}")
                
                # Find the orange money booking
                orange_found = None
                for b in bookings:
                    if b.get('id') == orange_booking_id:
                        orange_found = b
                        break
                
                if orange_found:
                    log_detail(f"Found Orange Money booking: {orange_found.get('reference')}")
                    log_detail(f"Payment object present: {orange_found.get('payment') is not None}")
                    log_detail(f"Payment status: {orange_found.get('payment', {}).get('status')}")
                    log_detail(f"Payment method: {orange_found.get('payment', {}).get('method')}")
                    log_detail(f"Payment txId: {orange_found.get('payment', {}).get('txId')}")
                    log_detail(f"Payment payerPhone: {orange_found.get('payment', {}).get('payerPhone')}")
                    
                    # Verify expectations
                    checks = []
                    checks.append(("payment object exists", orange_found.get('payment') is not None))
                    checks.append(("payment.status == 'pending'", orange_found.get('payment', {}).get('status') == 'pending'))
                    checks.append(("payment.method == 'orange'", orange_found.get('payment', {}).get('method') == 'orange'))
                    checks.append(("payment.txId present", orange_found.get('payment', {}).get('txId') == 'OM-TEST-123'))
                    checks.append(("payment.payerPhone present", orange_found.get('payment', {}).get('payerPhone') == '+243990000000'))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test(5, "GET /api/admin/bookings - ALL CHECKS PASSED", "PASS")
                        results["passed"] += 1
                        results["details"].append({"step": 5, "status": "PASS", "message": "Admin bookings endpoint working correctly"})
                    else:
                        log_test(5, "GET /api/admin/bookings - SOME CHECKS FAILED", "FAIL")
                        results["failed"] += 1
                        results["details"].append({"step": 5, "status": "FAIL", "message": "Admin bookings checks failed"})
                else:
                    log_test(5, "Orange Money booking not found in admin bookings", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 5, "status": "FAIL", "message": "Booking not found"})
            else:
                log_test(5, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 5, "status": "FAIL", "message": f"HTTP {response.status_code}"})
        except Exception as e:
            log_test(5, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 5, "status": "FAIL", "message": str(e)})
        
        if not orange_booking_id:
            log_test("ABORT", "Cannot continue without orange booking ID", "FAIL")
            return results
        
        # ============================================================
        # STEP 6: APPROVE - PUT /api/admin/bookings/:id/payment
        # ============================================================
        log_test(6, "APPROVE - PUT /api/admin/bookings/:id/payment", "INFO")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            approve_data = {"action": "approve"}
            
            response = requests.put(
                f"{BASE_URL}/admin/bookings/{orange_booking_id}/payment",
                json=approve_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                approved_booking = response.json()
                log_detail(f"Booking reference: {approved_booking.get('reference')}")
                log_detail(f"Payment status: {approved_booking.get('payment', {}).get('status')}")
                log_detail(f"Payment verifiedAt: {approved_booking.get('payment', {}).get('verifiedAt')}")
                log_detail(f"Payment verifiedBy: {approved_booking.get('payment', {}).get('verifiedBy')}")
                log_detail(f"Booking status: {approved_booking.get('status')}")
                log_detail(f"StatusHistory length: {len(approved_booking.get('statusHistory', []))}")
                
                # Check if statusHistory has payment_received entry
                has_payment_received = any(
                    entry.get('key') == 'payment_received' 
                    for entry in approved_booking.get('statusHistory', [])
                )
                
                # Verify expectations
                checks = []
                checks.append(("HTTP 200", True))
                checks.append(("payment.status == 'approved'", approved_booking.get('payment', {}).get('status') == 'approved'))
                checks.append(("payment.verifiedAt set", approved_booking.get('payment', {}).get('verifiedAt') is not None))
                checks.append(("payment.verifiedBy set", approved_booking.get('payment', {}).get('verifiedBy') is not None))
                checks.append(("booking.status == 'payment_received'", approved_booking.get('status') == 'payment_received'))
                checks.append(("statusHistory has payment_received entry", has_payment_received))
                
                all_passed = all(check[1] for check in checks)
                
                for check_name, check_result in checks:
                    status = "✓" if check_result else "✗"
                    log_detail(f"{status} {check_name}")
                
                if all_passed:
                    log_test(6, "APPROVE payment - ALL CHECKS PASSED", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 6, "status": "PASS", "message": "Payment approval working correctly"})
                else:
                    log_test(6, "APPROVE payment - SOME CHECKS FAILED", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 6, "status": "FAIL", "message": "Payment approval checks failed"})
            else:
                log_test(6, f"Failed with status {response.status_code}: {response.text}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 6, "status": "FAIL", "message": f"HTTP {response.status_code}"})
        except Exception as e:
            log_test(6, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 6, "status": "FAIL", "message": str(e)})
        
        # ============================================================
        # STEP 7: REJECT flow - Create another orange booking and reject
        # ============================================================
        log_test(7, "REJECT flow - Create another orange booking and reject", "INFO")
        try:
            # Create another orange booking
            booking_data = {
                "hotelId": hotel_id,
                "roomId": room_id,
                "checkIn": "2025-08-05",
                "checkOut": "2025-08-07",
                "guests": 2,
                "currency": "USD",
                "customer": {
                    "name": "Diana Tshisekedi",
                    "email": "diana.tshisekedi@example.com",
                    "phone": "+243990555666"
                },
                "paymentMethod": "orange",
                "payment": {
                    "payerPhone": "+243990555666",
                    "txId": "OM-TEST-456",
                    "proofImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                }
            }
            
            response = requests.post(f"{BASE_URL}/bookings", json=booking_data, timeout=10)
            
            if response.status_code == 200:
                reject_booking = response.json()
                reject_booking_id = reject_booking.get('id')
                log_detail(f"Created booking for rejection: {reject_booking.get('reference')}")
                
                # Now reject it
                headers = {"Authorization": f"Bearer {admin_token}"}
                reject_data = {"action": "reject"}
                
                response = requests.put(
                    f"{BASE_URL}/admin/bookings/{reject_booking_id}/payment",
                    json=reject_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    rejected_booking = response.json()
                    log_detail(f"Payment status: {rejected_booking.get('payment', {}).get('status')}")
                    log_detail(f"Booking status: {rejected_booking.get('status')}")
                    
                    # Verify expectations
                    checks = []
                    checks.append(("payment.status == 'rejected'", rejected_booking.get('payment', {}).get('status') == 'rejected'))
                    checks.append(("booking.status == 'pending_payment'", rejected_booking.get('status') == 'pending_payment'))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, check_result in checks:
                        status = "✓" if check_result else "✗"
                        log_detail(f"{status} {check_name}")
                    
                    if all_passed:
                        log_test(7, "REJECT payment - ALL CHECKS PASSED", "PASS")
                        results["passed"] += 1
                        results["details"].append({"step": 7, "status": "PASS", "message": "Payment rejection working correctly"})
                    else:
                        log_test(7, "REJECT payment - SOME CHECKS FAILED", "FAIL")
                        results["failed"] += 1
                        results["details"].append({"step": 7, "status": "FAIL", "message": "Payment rejection checks failed"})
                else:
                    log_test(7, f"Reject failed with status {response.status_code}: {response.text}", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 7, "status": "FAIL", "message": f"HTTP {response.status_code}"})
            else:
                log_test(7, f"Failed to create booking for rejection: {response.status_code}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 7, "status": "FAIL", "message": "Failed to create booking"})
        except Exception as e:
            log_test(7, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 7, "status": "FAIL", "message": str(e)})
        
        # ============================================================
        # STEP 8: AUTHORIZATION - PUT without token should return 403
        # ============================================================
        log_test(8, "AUTHORIZATION - PUT without token should return 403", "INFO")
        try:
            reject_data = {"action": "approve"}
            
            # Try without token
            response = requests.put(
                f"{BASE_URL}/admin/bookings/{orange_booking_id}/payment",
                json=reject_data,
                timeout=10
            )
            
            if response.status_code == 403:
                log_detail("Correctly returned 403 Forbidden")
                log_test(8, "AUTHORIZATION check - PASSED", "PASS")
                results["passed"] += 1
                results["details"].append({"step": 8, "status": "PASS", "message": "Authorization check working correctly"})
            else:
                log_test(8, f"Expected 403, got {response.status_code}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 8, "status": "FAIL", "message": f"Expected 403, got {response.status_code}"})
        except Exception as e:
            log_test(8, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 8, "status": "FAIL", "message": str(e)})
        
        # ============================================================
        # STEP 9: Confirm no Mongo _id leaks in booking responses
        # ============================================================
        log_test(9, "Confirm no Mongo _id leaks in booking responses", "INFO")
        try:
            # Check the orange booking we created
            response = requests.get(f"{BASE_URL}/bookings/{orange_booking_ref}", timeout=10)
            
            if response.status_code == 200:
                booking = response.json()
                has_id_leak = '_id' in booking
                
                log_detail(f"Booking has _id field: {has_id_leak}")
                
                if not has_id_leak:
                    log_test(9, "No Mongo _id leak - PASSED", "PASS")
                    results["passed"] += 1
                    results["details"].append({"step": 9, "status": "PASS", "message": "No _id field in response"})
                else:
                    log_test(9, "Mongo _id leak detected - FAILED", "FAIL")
                    results["failed"] += 1
                    results["details"].append({"step": 9, "status": "FAIL", "message": "_id field present in response"})
            else:
                log_test(9, f"Failed to fetch booking: {response.status_code}", "FAIL")
                results["failed"] += 1
                results["details"].append({"step": 9, "status": "FAIL", "message": f"HTTP {response.status_code}"})
        except Exception as e:
            log_test(9, f"Error: {str(e)}", "FAIL")
            results["failed"] += 1
            results["details"].append({"step": 9, "status": "FAIL", "message": str(e)})
        
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
    results = test_mobile_money_payment_flow()
    sys.exit(0 if results["failed"] == 0 else 1)
