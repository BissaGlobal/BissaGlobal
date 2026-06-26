#!/usr/bin/env python3
"""
Backend API Test for YABISO HOTELS - Phase 2 Travel Services Feature
Tests the new services collection and service_requests endpoints
"""

import requests
import json
import os
from datetime import datetime

# Base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://yabiso-hotels.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@yabiso.com"
ADMIN_PASSWORD = "yabiso2025"

# Test results tracking
test_results = []

def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f": {details}"
    test_results.append(result)
    print(result)
    return passed

def test_get_all_services():
    """Test 1: GET /api/services - returns ~16 services with correct structure"""
    print("\n=== TEST 1: GET /api/services (list all services) ===")
    try:
        response = requests.get(f"{API_BASE}/services", timeout=10)
        
        if response.status_code != 200:
            return log_test("GET /api/services", False, f"HTTP {response.status_code}")
        
        services = response.json()
        
        # Check count (~16 services)
        if len(services) < 15 or len(services) > 17:
            return log_test("GET /api/services", False, f"Expected ~16 services, got {len(services)}")
        
        # Check structure of first service
        if not services:
            return log_test("GET /api/services", False, "Empty services array")
        
        s = services[0]
        required_fields = ['id', 'type', 'name', 'nameEn', 'city', 'country', 'priceCDF', 'unit', 'image', 'description']
        missing = [f for f in required_fields if f not in s]
        if missing:
            return log_test("GET /api/services", False, f"Missing fields: {missing}")
        
        # Check no Mongo _id leak
        if '_id' in s:
            return log_test("GET /api/services", False, "Mongo _id leaked in response")
        
        # Count by type
        types = {}
        for svc in services:
            t = svc.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1
        
        return log_test("GET /api/services", True, f"Returned {len(services)} services. Types: {types}")
        
    except Exception as e:
        return log_test("GET /api/services", False, f"Exception: {str(e)}")

def test_filter_by_type():
    """Test 2: Filter services by type (excursion, transfer, taxi, car_rental)"""
    print("\n=== TEST 2: Filter services by type ===")
    
    types_to_test = [
        ('excursion', 4),
        ('transfer', 4),
        ('taxi', 4),
        ('car_rental', 4)
    ]
    
    all_passed = True
    
    for service_type, expected_count in types_to_test:
        try:
            response = requests.get(f"{API_BASE}/services?type={service_type}", timeout=10)
            
            if response.status_code != 200:
                log_test(f"Filter type={service_type}", False, f"HTTP {response.status_code}")
                all_passed = False
                continue
            
            services = response.json()
            
            # Check count
            if len(services) != expected_count:
                log_test(f"Filter type={service_type}", False, f"Expected {expected_count}, got {len(services)}")
                all_passed = False
                continue
            
            # Verify all have matching type
            wrong_type = [s for s in services if s.get('type') != service_type]
            if wrong_type:
                log_test(f"Filter type={service_type}", False, f"{len(wrong_type)} services with wrong type")
                all_passed = False
                continue
            
            log_test(f"Filter type={service_type}", True, f"{len(services)} services, all type={service_type}")
            
        except Exception as e:
            log_test(f"Filter type={service_type}", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_filter_by_city():
    """Test 2b: Filter services by type and city"""
    print("\n=== TEST 2b: Filter by type and city ===")
    try:
        response = requests.get(f"{API_BASE}/services?type=transfer&city=Kinshasa", timeout=10)
        
        if response.status_code != 200:
            return log_test("Filter type+city", False, f"HTTP {response.status_code}")
        
        services = response.json()
        
        # Should have at least 1 transfer in Kinshasa
        if len(services) == 0:
            return log_test("Filter type+city", False, "No transfers found in Kinshasa")
        
        # Verify all are transfers in Kinshasa
        for s in services:
            if s.get('type') != 'transfer':
                return log_test("Filter type+city", False, f"Service {s.get('name')} is not a transfer")
            if 'kinshasa' not in s.get('city', '').lower():
                return log_test("Filter type+city", False, f"Service {s.get('name')} not in Kinshasa")
        
        return log_test("Filter type+city", True, f"{len(services)} transfers in Kinshasa")
        
    except Exception as e:
        return log_test("Filter type+city", False, f"Exception: {str(e)}")

def test_get_single_service():
    """Test 3: GET /api/services/:id - single service and 404 for invalid"""
    print("\n=== TEST 3: GET /api/services/:id (single service) ===")
    
    try:
        # First get list to get a valid ID
        response = requests.get(f"{API_BASE}/services?type=taxi", timeout=10)
        if response.status_code != 200:
            return log_test("GET single service", False, "Could not fetch services list")
        
        services = response.json()
        if not services:
            return log_test("GET single service", False, "No services found")
        
        valid_id = services[0]['id']
        
        # Test valid ID
        response = requests.get(f"{API_BASE}/services/{valid_id}", timeout=10)
        if response.status_code != 200:
            return log_test("GET single service (valid)", False, f"HTTP {response.status_code}")
        
        service = response.json()
        
        # Check structure
        if service.get('id') != valid_id:
            return log_test("GET single service (valid)", False, "ID mismatch")
        
        # Check no _id leak
        if '_id' in service:
            return log_test("GET single service (valid)", False, "Mongo _id leaked")
        
        log_test("GET single service (valid)", True, f"Service: {service.get('name')}")
        
        # Test invalid ID (404)
        response = requests.get(f"{API_BASE}/services/invalid-id-12345", timeout=10)
        if response.status_code != 404:
            return log_test("GET single service (invalid)", False, f"Expected 404, got {response.status_code}")
        
        return log_test("GET single service (invalid)", True, "404 for invalid ID")
        
    except Exception as e:
        return log_test("GET single service", False, f"Exception: {str(e)}")

def test_create_service_request():
    """Test 4: POST /api/service-requests - create service request"""
    print("\n=== TEST 4: POST /api/service-requests (create request) ===")
    
    try:
        # Get a valid taxi service ID
        response = requests.get(f"{API_BASE}/services?type=taxi", timeout=10)
        if response.status_code != 200:
            return log_test("Create service request", False, "Could not fetch services")
        
        services = response.json()
        if not services:
            return log_test("Create service request", False, "No taxi services found")
        
        taxi = services[0]
        taxi_id = taxi['id']
        taxi_price = taxi['priceCDF']
        
        # Create service request
        payload = {
            "serviceId": taxi_id,
            "date": "2025-09-01",
            "quantity": 2,
            "currency": "USD",
            "customer": {
                "name": "QA Tester",
                "email": "bissa@bgsrdc.com",
                "phone": "+243900000000"
            },
            "notes": "test"
        }
        
        response = requests.post(f"{API_BASE}/service-requests", json=payload, timeout=10)
        
        if response.status_code != 200:
            return log_test("Create service request", False, f"HTTP {response.status_code}: {response.text}")
        
        req = response.json()
        
        # Check reference format (SRV-XXXXXX)
        if not req.get('reference', '').startswith('SRV-'):
            return log_test("Create service request", False, f"Invalid reference format: {req.get('reference')}")
        
        # Check status
        if req.get('status') != 'pending':
            return log_test("Create service request", False, f"Expected status 'pending', got {req.get('status')}")
        
        # Check totalCDF calculation
        expected_total_cdf = taxi_price * 2
        if req.get('totalCDF') != expected_total_cdf:
            return log_test("Create service request", False, f"totalCDF mismatch: expected {expected_total_cdf}, got {req.get('totalCDF')}")
        
        # Check totalDisplay for USD (should be computed with conversion)
        total_display = req.get('totalDisplay')
        if not total_display or total_display <= 0:
            return log_test("Create service request", False, f"Invalid totalDisplay: {total_display}")
        
        # Check no _id leak
        if '_id' in req:
            return log_test("Create service request", False, "Mongo _id leaked")
        
        log_test("Create service request", True, f"Reference: {req.get('reference')}, totalCDF: {req.get('totalCDF')}, totalDisplay: {total_display} USD")
        
        # Store for later tests
        global created_request_id
        created_request_id = req.get('id')
        
        return True
        
    except Exception as e:
        return log_test("Create service request", False, f"Exception: {str(e)}")

def test_service_request_validation():
    """Test 4b: Validation for service requests"""
    print("\n=== TEST 4b: Service request validation ===")
    
    all_passed = True
    
    # Test missing customer.email
    try:
        payload = {
            "serviceId": "some-id",
            "customer": {
                "name": "Test"
            }
        }
        response = requests.post(f"{API_BASE}/service-requests", json=payload, timeout=10)
        
        if response.status_code != 400:
            log_test("Validation: missing email", False, f"Expected 400, got {response.status_code}")
            all_passed = False
        else:
            log_test("Validation: missing email", True, "400 returned")
    except Exception as e:
        log_test("Validation: missing email", False, f"Exception: {str(e)}")
        all_passed = False
    
    # Test invalid serviceId
    try:
        payload = {
            "serviceId": "invalid-service-id-12345",
            "customer": {
                "name": "Test",
                "email": "test@test.com"
            }
        }
        response = requests.post(f"{API_BASE}/service-requests", json=payload, timeout=10)
        
        if response.status_code != 404:
            log_test("Validation: invalid serviceId", False, f"Expected 404, got {response.status_code}")
            all_passed = False
        else:
            log_test("Validation: invalid serviceId", True, "404 returned")
    except Exception as e:
        log_test("Validation: invalid serviceId", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed

def test_admin_auth():
    """Test 5: Admin endpoints authentication"""
    print("\n=== TEST 5: Admin endpoints authentication ===")
    
    # Test GET /api/service-requests without token (should be 403)
    try:
        response = requests.get(f"{API_BASE}/service-requests", timeout=10)
        
        if response.status_code != 403:
            log_test("Admin auth: no token", False, f"Expected 403, got {response.status_code}")
            return False
        
        log_test("Admin auth: no token", True, "403 returned")
        
        # Login as admin
        login_payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_payload, timeout=10)
        
        if response.status_code != 200:
            log_test("Admin login", False, f"HTTP {response.status_code}")
            return False
        
        data = response.json()
        token = data.get('token')
        
        if not token:
            log_test("Admin login", False, "No token in response")
            return False
        
        log_test("Admin login", True, f"Token obtained")
        
        # Store token for later tests
        global admin_token
        admin_token = token
        
        # Test GET /api/service-requests with admin token
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/service-requests", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("Admin GET service-requests", False, f"HTTP {response.status_code}")
            return False
        
        reqs = response.json()
        
        # Should be an array
        if not isinstance(reqs, list):
            log_test("Admin GET service-requests", False, "Response is not an array")
            return False
        
        # Check no _id leak
        if reqs and '_id' in reqs[0]:
            log_test("Admin GET service-requests", False, "Mongo _id leaked")
            return False
        
        log_test("Admin GET service-requests", True, f"Returned {len(reqs)} requests")
        
        return True
        
    except Exception as e:
        log_test("Admin auth", False, f"Exception: {str(e)}")
        return False

def test_admin_update_status():
    """Test 5b: Admin update service request status"""
    print("\n=== TEST 5b: Admin update service request status ===")
    
    try:
        if not admin_token:
            return log_test("Admin update status", False, "No admin token available")
        
        # Get service requests to find one to update
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_BASE}/service-requests", headers=headers, timeout=10)
        
        if response.status_code != 200:
            return log_test("Admin update status", False, "Could not fetch service requests")
        
        reqs = response.json()
        if not reqs:
            return log_test("Admin update status", False, "No service requests to update")
        
        req_id = reqs[0]['id']
        
        # Test without token (should be 403)
        payload = {"status": "confirmed"}
        response = requests.put(f"{API_BASE}/service-requests/{req_id}", json=payload, timeout=10)
        
        if response.status_code != 403:
            log_test("Admin update: no token", False, f"Expected 403, got {response.status_code}")
            return False
        
        log_test("Admin update: no token", True, "403 returned")
        
        # Update with admin token
        response = requests.put(f"{API_BASE}/service-requests/{req_id}", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return log_test("Admin update: with token", False, f"HTTP {response.status_code}")
        
        updated = response.json()
        
        # Check status updated
        if updated.get('status') != 'confirmed':
            return log_test("Admin update: with token", False, f"Status not updated: {updated.get('status')}")
        
        # Check statusHistory has new entry
        history = updated.get('statusHistory', [])
        if not history:
            return log_test("Admin update: with token", False, "No statusHistory")
        
        # Find confirmed entry
        confirmed_entry = [h for h in history if h.get('key') == 'confirmed']
        if not confirmed_entry:
            return log_test("Admin update: with token", False, "No 'confirmed' entry in statusHistory")
        
        return log_test("Admin update: with token", True, f"Status updated to 'confirmed', statusHistory has {len(history)} entries")
        
    except Exception as e:
        return log_test("Admin update status", False, f"Exception: {str(e)}")

def test_regression():
    """Test 6: Regression tests"""
    print("\n=== TEST 6: Regression tests ===")
    
    all_passed = True
    
    # Test seed idempotency
    try:
        response1 = requests.get(f"{API_BASE}/seed", timeout=10)
        if response1.status_code != 200:
            log_test("Regression: seed call 1", False, f"HTTP {response1.status_code}")
            all_passed = False
        else:
            data1 = response1.json()
            hotels1 = data1.get('hotels', 0)
            log_test("Regression: seed call 1", True, f"Hotels: {hotels1}")
            
            # Second call
            response2 = requests.get(f"{API_BASE}/seed", timeout=10)
            if response2.status_code != 200:
                log_test("Regression: seed call 2", False, f"HTTP {response2.status_code}")
                all_passed = False
            else:
                data2 = response2.json()
                hotels2 = data2.get('hotels', 0)
                
                if hotels1 != hotels2:
                    log_test("Regression: seed idempotent", False, f"Hotels changed: {hotels1} -> {hotels2}")
                    all_passed = False
                else:
                    log_test("Regression: seed idempotent", True, f"Hotels stable at {hotels1}")
                
                # Check services not duplicated
                services_response = requests.get(f"{API_BASE}/services", timeout=10)
                if services_response.status_code == 200:
                    services = services_response.json()
                    if len(services) > 20:
                        log_test("Regression: services not duplicated", False, f"Too many services: {len(services)}")
                        all_passed = False
                    else:
                        log_test("Regression: services not duplicated", True, f"Services count: {len(services)}")
    except Exception as e:
        log_test("Regression: seed", False, f"Exception: {str(e)}")
        all_passed = False
    
    # Test hotels still work
    try:
        response = requests.get(f"{API_BASE}/hotels?category=apartment", timeout=10)
        if response.status_code != 200:
            log_test("Regression: hotels filter", False, f"HTTP {response.status_code}")
            all_passed = False
        else:
            hotels = response.json()
            log_test("Regression: hotels filter", True, f"Apartments: {len(hotels)}")
    except Exception as e:
        log_test("Regression: hotels", False, f"Exception: {str(e)}")
        all_passed = False
    
    # Test settings/rates still has XAF
    try:
        response = requests.get(f"{API_BASE}/settings/rates", timeout=10)
        if response.status_code != 200:
            log_test("Regression: settings/rates", False, f"HTTP {response.status_code}")
            all_passed = False
        else:
            data = response.json()
            rates = data.get('rates', {})
            if 'XAF' not in rates:
                log_test("Regression: XAF in rates", False, "XAF not found")
                all_passed = False
            else:
                log_test("Regression: XAF in rates", True, f"XAF: {rates['XAF']}")
    except Exception as e:
        log_test("Regression: settings", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed

# Global variables for test data
admin_token = None
created_request_id = None

def main():
    """Run all tests"""
    print("=" * 80)
    print("YABISO HOTELS - Phase 2 Travel Services Backend Test")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 80)
    
    # Run all tests
    test_get_all_services()
    test_filter_by_type()
    test_filter_by_city()
    test_get_single_service()
    test_create_service_request()
    test_service_request_validation()
    test_admin_auth()
    test_admin_update_status()
    test_regression()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for r in test_results if "✅ PASS" in r)
    failed = sum(1 for r in test_results if "❌ FAIL" in r)
    total = len(test_results)
    
    for result in test_results:
        print(result)
    
    print("\n" + "=" * 80)
    print(f"TOTAL: {passed}/{total} tests passed, {failed} failed")
    print("=" * 80)
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
