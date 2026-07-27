#!/usr/bin/env python3
"""
Backend API Test for YABISO HOTELS - White-Label Multi-Tenant Feature
Tests the NEW white-label/branding functionality ONLY
"""

import requests
import json
import os
import random
import string
from datetime import datetime

# Base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://yabiso-hotels.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@yabiso.com"
ADMIN_PASSWORD = "yabiso2025"

# Test results tracking
test_results = []
test_data = {}

def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f": {details}"
    test_results.append(result)
    print(result)
    return passed

def random_string(length=8):
    """Generate random string"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# ============================================================================
# TEST SCENARIO 1: SEED + MIGRATION IDEMPOTENCY
# ============================================================================

def test_seed_idempotency():
    """Test 1.1: GET /api/seed - idempotent, returns seeded and hotels count"""
    print("\n=== TEST 1.1: Seed idempotency ===")
    try:
        # First call
        response1 = requests.get(f"{API_BASE}/seed", timeout=15)
        
        if response1.status_code != 200:
            return log_test("Seed call 1", False, f"HTTP {response1.status_code}")
        
        data1 = response1.json()
        
        if 'seeded' not in data1 or 'hotels' not in data1:
            return log_test("Seed call 1", False, f"Missing fields in response: {data1.keys()}")
        
        hotels1 = data1['hotels']
        log_test("Seed call 1", True, f"seeded={data1['seeded']}, hotels={hotels1}")
        
        # Second call - should be idempotent
        response2 = requests.get(f"{API_BASE}/seed", timeout=15)
        
        if response2.status_code != 200:
            return log_test("Seed call 2", False, f"HTTP {response2.status_code}")
        
        data2 = response2.json()
        
        # Second call should return seeded:false (already seeded)
        if data2.get('seeded') != False:
            log_test("Seed call 2", False, f"Expected seeded=false, got {data2.get('seeded')}")
        else:
            log_test("Seed call 2", True, f"seeded=false (idempotent)")
        
        # Hotels count should be stable
        hotels2 = data2['hotels']
        if hotels1 != hotels2:
            return log_test("Seed idempotency", False, f"Hotels count changed: {hotels1} -> {hotels2}")
        
        log_test("Seed idempotency", True, f"Hotels stable at {hotels1}")
        
        # Store for later tests
        test_data['hotels_count'] = hotels1
        
        return True
        
    except Exception as e:
        return log_test("Seed idempotency", False, f"Exception: {str(e)}")

def test_hotels_have_slug_branding():
    """Test 1.2: Verify all hotels have slug and branding after migration"""
    print("\n=== TEST 1.2: Hotels have slug and branding ===")
    try:
        response = requests.get(f"{API_BASE}/hotels", timeout=15)
        
        if response.status_code != 200:
            return log_test("Hotels list", False, f"HTTP {response.status_code}")
        
        hotels = response.json()
        
        if not hotels:
            return log_test("Hotels list", False, "No hotels returned")
        
        log_test("Hotels list", True, f"Retrieved {len(hotels)} hotels")
        
        # Check first few hotels for slug and branding
        hotels_to_check = hotels[:5]
        
        all_passed = True
        for hotel in hotels_to_check:
            hotel_name = hotel.get('name', 'Unknown')
            
            # Check slug exists and is non-empty
            slug = hotel.get('slug')
            if not slug or not isinstance(slug, str) or len(slug) == 0:
                log_test(f"Hotel '{hotel_name}' has slug", False, f"slug={slug}")
                all_passed = False
                continue
            
            log_test(f"Hotel '{hotel_name}' has slug", True, f"slug='{slug}'")
            
            # Check branding exists
            branding = hotel.get('branding')
            if not branding or not isinstance(branding, dict):
                log_test(f"Hotel '{hotel_name}' has branding", False, f"branding={branding}")
                all_passed = False
                continue
            
            # Check branding has expected default colors
            primary = branding.get('primaryColor')
            secondary = branding.get('secondaryColor')
            
            if primary != '#0A1F5C':
                log_test(f"Hotel '{hotel_name}' primaryColor", False, f"Expected #0A1F5C, got {primary}")
                all_passed = False
            else:
                log_test(f"Hotel '{hotel_name}' primaryColor", True, f"{primary}")
            
            if secondary != '#F5A623':
                log_test(f"Hotel '{hotel_name}' secondaryColor", False, f"Expected #F5A623, got {secondary}")
                all_passed = False
            else:
                log_test(f"Hotel '{hotel_name}' secondaryColor", True, f"{secondary}")
        
        # Store a sample slug for later tests
        if hotels:
            test_data['sample_slug'] = hotels[0].get('slug')
            test_data['sample_hotel_name'] = hotels[0].get('name')
        
        return all_passed
        
    except Exception as e:
        return log_test("Hotels slug/branding check", False, f"Exception: {str(e)}")

# ============================================================================
# TEST SCENARIO 2: PUBLIC TENANT ENDPOINT
# ============================================================================

def test_tenant_endpoint_valid_slug():
    """Test 2.1: GET /api/tenant/:slug with valid slug"""
    print("\n=== TEST 2.1: Tenant endpoint with valid slug ===")
    try:
        slug = test_data.get('sample_slug')
        if not slug:
            return log_test("Tenant endpoint (valid)", False, "No sample slug available")
        
        response = requests.get(f"{API_BASE}/tenant/{slug}", timeout=15)
        
        if response.status_code != 200:
            return log_test("Tenant endpoint (valid)", False, f"HTTP {response.status_code}")
        
        data = response.json()
        
        # Check structure
        required_fields = ['hotel', 'reviews', 'rates', 'fee']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return log_test("Tenant endpoint structure", False, f"Missing fields: {missing}")
        
        log_test("Tenant endpoint structure", True, f"All required fields present")
        
        # Check hotel object
        hotel = data['hotel']
        if not isinstance(hotel, dict):
            return log_test("Tenant hotel object", False, f"hotel is not a dict: {type(hotel)}")
        
        # Check hotel has required fields
        hotel_required = ['name', 'city', 'rooms', 'branding']
        hotel_missing = [f for f in hotel_required if f not in hotel]
        if hotel_missing:
            return log_test("Tenant hotel fields", False, f"Missing: {hotel_missing}")
        
        log_test("Tenant hotel fields", True, f"name={hotel.get('name')}, city={hotel.get('city')}")
        
        # Check branding object
        branding = hotel.get('branding')
        if not isinstance(branding, dict):
            return log_test("Tenant branding", False, f"branding is not a dict")
        
        if 'primaryColor' not in branding or 'secondaryColor' not in branding:
            return log_test("Tenant branding colors", False, f"Missing color fields")
        
        log_test("Tenant branding", True, f"primaryColor={branding.get('primaryColor')}, secondaryColor={branding.get('secondaryColor')}")
        
        # Check NO ownerId or tenantId leak
        if 'ownerId' in hotel:
            return log_test("Tenant NO ownerId leak", False, "ownerId found in hotel")
        
        if 'tenantId' in hotel:
            return log_test("Tenant NO tenantId leak", False, "tenantId found in hotel")
        
        log_test("Tenant NO ownerId/tenantId leak", True, "Sensitive fields not exposed")
        
        # Check reviews array
        reviews = data['reviews']
        if not isinstance(reviews, list):
            return log_test("Tenant reviews", False, f"reviews is not a list")
        
        log_test("Tenant reviews", True, f"{len(reviews)} reviews")
        
        # Check rates object
        rates = data['rates']
        if not isinstance(rates, dict):
            return log_test("Tenant rates", False, f"rates is not a dict")
        
        log_test("Tenant rates", True, f"USD={rates.get('USD')}, XAF={rates.get('XAF')}")
        
        # Check fee
        fee = data['fee']
        if not isinstance(fee, (int, float)):
            return log_test("Tenant fee", False, f"fee is not a number: {fee}")
        
        log_test("Tenant fee", True, f"fee={fee}")
        
        return True
        
    except Exception as e:
        return log_test("Tenant endpoint (valid)", False, f"Exception: {str(e)}")

def test_tenant_endpoint_invalid_slug():
    """Test 2.2: GET /api/tenant/:slug with invalid slug returns 404"""
    print("\n=== TEST 2.2: Tenant endpoint with invalid slug ===")
    try:
        invalid_slug = "this-slug-does-not-exist-xyz-" + random_string()
        
        response = requests.get(f"{API_BASE}/tenant/{invalid_slug}", timeout=15)
        
        if response.status_code != 404:
            return log_test("Tenant endpoint (invalid)", False, f"Expected 404, got {response.status_code}")
        
        data = response.json()
        
        # Should have error message
        if 'error' not in data:
            return log_test("Tenant endpoint (invalid) error msg", False, "No error field in response")
        
        return log_test("Tenant endpoint (invalid)", True, f"404 with error: {data.get('error')}")
        
    except Exception as e:
        return log_test("Tenant endpoint (invalid)", False, f"Exception: {str(e)}")

# ============================================================================
# TEST SCENARIO 3: OWNER REGISTRATION + HOTEL CREATION
# ============================================================================

def test_owner_registration():
    """Test 3.1: Register a new hotel owner"""
    print("\n=== TEST 3.1: Owner registration ===")
    try:
        email = f"owner+{random_string()}@test.com"
        
        payload = {
            "name": "Test Hotel Owner",
            "email": email,
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=payload, timeout=15)
        
        if response.status_code != 200:
            return log_test("Owner registration", False, f"HTTP {response.status_code}: {response.text}")
        
        data = response.json()
        
        # Check response structure
        if 'user' not in data or 'token' not in data:
            return log_test("Owner registration", False, f"Missing user or token in response")
        
        user = data['user']
        token = data['token']
        
        if not token:
            return log_test("Owner registration", False, "Empty token")
        
        # Store for later tests
        test_data['owner1_email'] = email
        test_data['owner1_token'] = token
        test_data['owner1_id'] = user.get('id')
        
        return log_test("Owner registration", True, f"email={email}, userId={user.get('id')}")
        
    except Exception as e:
        return log_test("Owner registration", False, f"Exception: {str(e)}")

def test_owner_create_hotel():
    """Test 3.2: Owner creates a hotel with auto-generated slug and branding"""
    print("\n=== TEST 3.2: Owner creates hotel ===")
    try:
        token = test_data.get('owner1_token')
        owner_id = test_data.get('owner1_id')
        
        if not token or not owner_id:
            return log_test("Owner create hotel", False, "No owner token/id available")
        
        payload = {
            "name": "Test Brand Hotel",
            "city": "Kinshasa",
            "province": "Kinshasa",
            "country": "RD Congo",
            "priceCDF": 100000,
            "rooms": [
                {
                    "name": "Std",
                    "priceCDF": 100000,
                    "capacity": 2
                }
            ]
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{API_BASE}/owner/hotels", json=payload, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return log_test("Owner create hotel", False, f"HTTP {response.status_code}: {response.text}")
        
        hotel = response.json()
        
        # Check slug exists and is non-empty
        slug = hotel.get('slug')
        if not slug or not isinstance(slug, str) or len(slug) == 0:
            return log_test("Hotel has slug", False, f"slug={slug}")
        
        log_test("Hotel has slug", True, f"slug='{slug}'")
        
        # Check branding exists with default colors
        branding = hotel.get('branding')
        if not branding or not isinstance(branding, dict):
            return log_test("Hotel has branding", False, f"branding={branding}")
        
        primary = branding.get('primaryColor')
        secondary = branding.get('secondaryColor')
        
        if primary != '#0A1F5C':
            log_test("Hotel branding primaryColor", False, f"Expected #0A1F5C, got {primary}")
        else:
            log_test("Hotel branding primaryColor", True, f"{primary}")
        
        if secondary != '#F5A623':
            log_test("Hotel branding secondaryColor", False, f"Expected #F5A623, got {secondary}")
        else:
            log_test("Hotel branding secondaryColor", True, f"{secondary}")
        
        # Check tenantId equals owner id
        tenant_id = hotel.get('tenantId')
        if tenant_id != owner_id:
            return log_test("Hotel tenantId", False, f"Expected {owner_id}, got {tenant_id}")
        
        log_test("Hotel tenantId", True, f"tenantId={tenant_id} (matches owner)")
        
        # Check ownerId equals owner id
        hotel_owner_id = hotel.get('ownerId')
        if hotel_owner_id != owner_id:
            return log_test("Hotel ownerId", False, f"Expected {owner_id}, got {hotel_owner_id}")
        
        log_test("Hotel ownerId", True, f"ownerId={hotel_owner_id} (matches owner)")
        
        # Store for later tests
        test_data['owner1_hotel_id'] = hotel.get('id')
        test_data['owner1_hotel_slug'] = slug
        
        return True
        
    except Exception as e:
        return log_test("Owner create hotel", False, f"Exception: {str(e)}")

def test_tenant_endpoint_new_hotel():
    """Test 3.3: Verify new hotel is accessible via tenant endpoint"""
    print("\n=== TEST 3.3: Tenant endpoint for new hotel ===")
    try:
        slug = test_data.get('owner1_hotel_slug')
        if not slug:
            return log_test("Tenant endpoint (new hotel)", False, "No hotel slug available")
        
        response = requests.get(f"{API_BASE}/tenant/{slug}", timeout=15)
        
        if response.status_code != 200:
            return log_test("Tenant endpoint (new hotel)", False, f"HTTP {response.status_code}")
        
        data = response.json()
        
        # Check hotel name
        hotel = data.get('hotel', {})
        if hotel.get('name') != 'Test Brand Hotel':
            return log_test("Tenant endpoint (new hotel)", False, f"Wrong hotel name: {hotel.get('name')}")
        
        return log_test("Tenant endpoint (new hotel)", True, f"Hotel accessible at /api/tenant/{slug}")
        
    except Exception as e:
        return log_test("Tenant endpoint (new hotel)", False, f"Exception: {str(e)}")

# ============================================================================
# TEST SCENARIO 4: OWNER BRANDING UPDATE
# ============================================================================

def test_owner_update_branding():
    """Test 4.1: Owner updates hotel branding and slug"""
    print("\n=== TEST 4.1: Owner updates branding ===")
    try:
        token = test_data.get('owner1_token')
        hotel_id = test_data.get('owner1_hotel_id')
        
        if not token or not hotel_id:
            return log_test("Owner update branding", False, "No token/hotel_id available")
        
        custom_slug = f"my-custom-slug-{random_string(4)}"
        
        payload = {
            "branding": {
                "primaryColor": "#123456",
                "secondaryColor": "#abcdef",
                "tagline": "My tagline",
                "poweredBy": False,
                "contactEmail": "x@y.com"
            },
            "slug": custom_slug
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.put(f"{API_BASE}/owner/hotels/{hotel_id}/branding", json=payload, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return log_test("Owner update branding", False, f"HTTP {response.status_code}: {response.text}")
        
        hotel = response.json()
        
        # Check branding updated
        branding = hotel.get('branding', {})
        
        if branding.get('primaryColor') != '#123456':
            return log_test("Branding primaryColor updated", False, f"Expected #123456, got {branding.get('primaryColor')}")
        
        log_test("Branding primaryColor updated", True, "#123456")
        
        if branding.get('secondaryColor') != '#abcdef':
            return log_test("Branding secondaryColor updated", False, f"Expected #abcdef, got {branding.get('secondaryColor')}")
        
        log_test("Branding secondaryColor updated", True, "#abcdef")
        
        if branding.get('tagline') != 'My tagline':
            return log_test("Branding tagline updated", False, f"Expected 'My tagline', got {branding.get('tagline')}")
        
        log_test("Branding tagline updated", True, "My tagline")
        
        if branding.get('poweredBy') != False:
            return log_test("Branding poweredBy updated", False, f"Expected False, got {branding.get('poweredBy')}")
        
        log_test("Branding poweredBy updated", True, "False")
        
        # Check slug updated
        new_slug = hotel.get('slug')
        if not new_slug or not new_slug.startswith('my-custom-slug'):
            return log_test("Slug updated", False, f"Expected slug starting with 'my-custom-slug', got {new_slug}")
        
        log_test("Slug updated", True, f"slug={new_slug}")
        
        # Store new slug for later tests
        test_data['owner1_hotel_slug_updated'] = new_slug
        
        return True
        
    except Exception as e:
        return log_test("Owner update branding", False, f"Exception: {str(e)}")

def test_owner_update_branding_invalid_color():
    """Test 4.2: Owner updates branding with invalid color - should sanitize"""
    print("\n=== TEST 4.2: Owner updates branding with invalid color ===")
    try:
        token = test_data.get('owner1_token')
        hotel_id = test_data.get('owner1_hotel_id')
        
        if not token or not hotel_id:
            return log_test("Owner update branding (invalid color)", False, "No token/hotel_id available")
        
        payload = {
            "branding": {
                "primaryColor": "not-a-color",
                "secondaryColor": "also-invalid"
            }
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.put(f"{API_BASE}/owner/hotels/{hotel_id}/branding", json=payload, headers=headers, timeout=15)
        
        # Should NOT crash - should return 200
        if response.status_code != 200:
            return log_test("Owner update branding (invalid color) - no crash", False, f"HTTP {response.status_code}")
        
        log_test("Owner update branding (invalid color) - no crash", True, "200 returned")
        
        hotel = response.json()
        branding = hotel.get('branding', {})
        
        # Colors should remain valid hex (not the invalid values)
        primary = branding.get('primaryColor')
        if primary == 'not-a-color':
            return log_test("Invalid color sanitized", False, f"primaryColor not sanitized: {primary}")
        
        # Should be a valid hex color (starts with #)
        if not primary or not primary.startswith('#'):
            return log_test("Invalid color sanitized", False, f"primaryColor not a valid hex: {primary}")
        
        return log_test("Invalid color sanitized", True, f"primaryColor remains valid: {primary}")
        
    except Exception as e:
        return log_test("Owner update branding (invalid color)", False, f"Exception: {str(e)}")

def test_tenant_endpoint_updated_branding():
    """Test 4.3: Verify updated branding is visible via tenant endpoint"""
    print("\n=== TEST 4.3: Tenant endpoint shows updated branding ===")
    try:
        slug = test_data.get('owner1_hotel_slug_updated')
        if not slug:
            return log_test("Tenant endpoint (updated branding)", False, "No updated slug available")
        
        response = requests.get(f"{API_BASE}/tenant/{slug}", timeout=15)
        
        if response.status_code != 200:
            return log_test("Tenant endpoint (updated branding)", False, f"HTTP {response.status_code}")
        
        data = response.json()
        hotel = data.get('hotel', {})
        branding = hotel.get('branding', {})
        
        # Check updated branding
        if branding.get('primaryColor') != '#123456':
            return log_test("Tenant shows updated primaryColor", False, f"Expected #123456, got {branding.get('primaryColor')}")
        
        log_test("Tenant shows updated primaryColor", True, "#123456")
        
        if branding.get('poweredBy') != False:
            return log_test("Tenant shows updated poweredBy", False, f"Expected False, got {branding.get('poweredBy')}")
        
        return log_test("Tenant shows updated poweredBy", True, "False")
        
    except Exception as e:
        return log_test("Tenant endpoint (updated branding)", False, f"Exception: {str(e)}")

# ============================================================================
# TEST SCENARIO 5: TENANT ISOLATION / AUTHZ
# ============================================================================

def test_register_second_owner():
    """Test 5.1: Register a second owner"""
    print("\n=== TEST 5.1: Register second owner ===")
    try:
        email = f"owner2+{random_string()}@test.com"
        
        payload = {
            "name": "Second Hotel Owner",
            "email": email,
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=payload, timeout=15)
        
        if response.status_code != 200:
            return log_test("Owner2 registration", False, f"HTTP {response.status_code}")
        
        data = response.json()
        token = data.get('token')
        
        # Store for later tests
        test_data['owner2_token'] = token
        test_data['owner2_id'] = data.get('user', {}).get('id')
        
        return log_test("Owner2 registration", True, f"email={email}")
        
    except Exception as e:
        return log_test("Owner2 registration", False, f"Exception: {str(e)}")

def test_owner2_cannot_update_owner1_hotel():
    """Test 5.2: Owner2 cannot update Owner1's hotel branding"""
    print("\n=== TEST 5.2: Owner2 cannot update Owner1's hotel ===")
    try:
        owner2_token = test_data.get('owner2_token')
        owner1_hotel_id = test_data.get('owner1_hotel_id')
        
        if not owner2_token or not owner1_hotel_id:
            return log_test("Owner2 update Owner1 hotel", False, "No token/hotel_id available")
        
        payload = {
            "branding": {
                "primaryColor": "#ff0000"
            }
        }
        
        headers = {"Authorization": f"Bearer {owner2_token}"}
        response = requests.put(f"{API_BASE}/owner/hotels/{owner1_hotel_id}/branding", json=payload, headers=headers, timeout=15)
        
        # Should be rejected with 404 or 403
        if response.status_code not in [403, 404]:
            return log_test("Owner2 update Owner1 hotel", False, f"Expected 403/404, got {response.status_code}")
        
        data = response.json()
        error = data.get('error', '')
        
        return log_test("Owner2 update Owner1 hotel", True, f"Rejected with {response.status_code}: {error}")
        
    except Exception as e:
        return log_test("Owner2 update Owner1 hotel", False, f"Exception: {str(e)}")

def test_no_auth_cannot_update_branding():
    """Test 5.3: Cannot update branding without authorization"""
    print("\n=== TEST 5.3: No auth cannot update branding ===")
    try:
        hotel_id = test_data.get('owner1_hotel_id')
        
        if not hotel_id:
            return log_test("No auth update branding", False, "No hotel_id available")
        
        payload = {
            "branding": {
                "primaryColor": "#ff0000"
            }
        }
        
        # No Authorization header
        response = requests.put(f"{API_BASE}/owner/hotels/{hotel_id}/branding", json=payload, timeout=15)
        
        # Should be rejected with 401
        if response.status_code != 401:
            return log_test("No auth update branding", False, f"Expected 401, got {response.status_code}")
        
        return log_test("No auth update branding", True, "401 Unauthorized")
        
    except Exception as e:
        return log_test("No auth update branding", False, f"Exception: {str(e)}")

# ============================================================================
# TEST SCENARIO 6: REGRESSION
# ============================================================================

def test_regression_hotels_list():
    """Test 6.1: GET /api/hotels still works"""
    print("\n=== TEST 6.1: Regression - hotels list ===")
    try:
        response = requests.get(f"{API_BASE}/hotels", timeout=15)
        
        if response.status_code != 200:
            return log_test("Regression: hotels list", False, f"HTTP {response.status_code}")
        
        hotels = response.json()
        
        if not isinstance(hotels, list):
            return log_test("Regression: hotels list", False, "Response is not an array")
        
        return log_test("Regression: hotels list", True, f"{len(hotels)} hotels")
        
    except Exception as e:
        return log_test("Regression: hotels list", False, f"Exception: {str(e)}")

def test_regression_settings_rates():
    """Test 6.2: GET /api/settings/rates still works"""
    print("\n=== TEST 6.2: Regression - settings/rates ===")
    try:
        response = requests.get(f"{API_BASE}/settings/rates", timeout=15)
        
        if response.status_code != 200:
            return log_test("Regression: settings/rates", False, f"HTTP {response.status_code}")
        
        data = response.json()
        rates = data.get('rates', {})
        
        if 'USD' not in rates:
            return log_test("Regression: USD in rates", False, "USD not found")
        
        if 'XAF' not in rates:
            return log_test("Regression: XAF in rates", False, "XAF not found")
        
        return log_test("Regression: settings/rates", True, f"USD={rates['USD']}, XAF={rates['XAF']}")
        
    except Exception as e:
        return log_test("Regression: settings/rates", False, f"Exception: {str(e)}")

def test_regression_admin_login():
    """Test 6.3: Admin login still works"""
    print("\n=== TEST 6.3: Regression - admin login ===")
    try:
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=payload, timeout=15)
        
        if response.status_code != 200:
            return log_test("Regression: admin login", False, f"HTTP {response.status_code}")
        
        data = response.json()
        
        if 'token' not in data:
            return log_test("Regression: admin login", False, "No token in response")
        
        user = data.get('user', {})
        if user.get('role') != 'admin':
            return log_test("Regression: admin role", False, f"Expected role=admin, got {user.get('role')}")
        
        return log_test("Regression: admin login", True, f"role={user.get('role')}")
        
    except Exception as e:
        return log_test("Regression: admin login", False, f"Exception: {str(e)}")

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def main():
    """Run all tests"""
    print("=" * 80)
    print("YABISO HOTELS - White-Label Multi-Tenant Backend Test")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 80)
    
    # SCENARIO 1: SEED + MIGRATION IDEMPOTENCY
    print("\n" + "=" * 80)
    print("SCENARIO 1: SEED + MIGRATION IDEMPOTENCY")
    print("=" * 80)
    test_seed_idempotency()
    test_hotels_have_slug_branding()
    
    # SCENARIO 2: PUBLIC TENANT ENDPOINT
    print("\n" + "=" * 80)
    print("SCENARIO 2: PUBLIC TENANT ENDPOINT")
    print("=" * 80)
    test_tenant_endpoint_valid_slug()
    test_tenant_endpoint_invalid_slug()
    
    # SCENARIO 3: OWNER REGISTRATION + HOTEL CREATION
    print("\n" + "=" * 80)
    print("SCENARIO 3: OWNER REGISTRATION + HOTEL CREATION")
    print("=" * 80)
    test_owner_registration()
    test_owner_create_hotel()
    test_tenant_endpoint_new_hotel()
    
    # SCENARIO 4: OWNER BRANDING UPDATE
    print("\n" + "=" * 80)
    print("SCENARIO 4: OWNER BRANDING UPDATE")
    print("=" * 80)
    test_owner_update_branding()
    test_owner_update_branding_invalid_color()
    test_tenant_endpoint_updated_branding()
    
    # SCENARIO 5: TENANT ISOLATION / AUTHZ
    print("\n" + "=" * 80)
    print("SCENARIO 5: TENANT ISOLATION / AUTHZ")
    print("=" * 80)
    test_register_second_owner()
    test_owner2_cannot_update_owner1_hotel()
    test_no_auth_cannot_update_branding()
    
    # SCENARIO 6: REGRESSION
    print("\n" + "=" * 80)
    print("SCENARIO 6: REGRESSION")
    print("=" * 80)
    test_regression_hotels_list()
    test_regression_settings_rates()
    test_regression_admin_login()
    
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
    print(f"TOTAL: {passed}/{total} tests passed ({100*passed//total if total else 0}%), {failed} failed")
    print("=" * 80)
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
