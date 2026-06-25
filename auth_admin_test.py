#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - Auth + Admin endpoints
Tests authentication, favorites, user bookings, and admin dashboard
"""
import requests
import json
import time

# Base URL from .env
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

# Test data
user_token = None
admin_token = None
test_hotel_id = None
test_room_id = None
test_booking_id = None

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_step(step_num, description):
    print(f"\n[STEP {step_num}] {description}")

def print_pass(message):
    print(f"✅ PASS - {message}")

def print_fail(message):
    print(f"❌ FAIL - {message}")

def print_info(message):
    print(f"   {message}")

def test_seed():
    """Step 0: Call GET /api/seed to ensure default admin exists"""
    print_step(0, "Calling GET /api/seed to ensure default admin exists")
    try:
        response = requests.get(f"{BASE_URL}/seed", timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print_info(f"Response: {json.dumps(data, indent=2)}")
        print_pass(f"Seed endpoint called successfully. Hotels: {data.get('hotels', 0)}")
        return True
        
    except Exception as e:
        print_fail(f"Seed error: {str(e)}")
        return False

def test_auth_register():
    """Step 1: POST /api/auth/register - new user and duplicate email"""
    global user_token, test_hotel_id, test_room_id
    
    print_step(1, "POST /api/auth/register - new user registration")
    
    # First, get a hotel ID for later use
    try:
        response = requests.get(f"{BASE_URL}/hotels", timeout=30)
        if response.status_code == 200:
            hotels = response.json()
            if len(hotels) > 0:
                test_hotel_id = hotels[0]['id']
                test_room_id = hotels[0]['rooms'][0]['id']
                print_info(f"Got test hotel ID: {test_hotel_id}, room ID: {test_room_id}")
    except:
        pass
    
    # Register new user
    try:
        payload = {
            "name": "Test User",
            "email": "user1@yabiso.com",
            "password": "pass1234"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Validate response structure
        if 'user' not in data or 'token' not in data:
            print_fail("Response missing 'user' or 'token'")
            return False
        
        user = data['user']
        user_token = data['token']
        
        # Check user fields
        required_fields = ['id', 'name', 'email', 'role', 'favorites']
        for field in required_fields:
            if field not in user:
                print_fail(f"User missing required field: {field}")
                return False
        
        # Check that passwordHash and _id are NOT present
        if 'passwordHash' in user:
            print_fail("User contains passwordHash (should be removed)")
            return False
        
        if '_id' in user:
            print_fail("User contains _id (should be removed)")
            return False
        
        # Validate role
        if user['role'] != 'user':
            print_fail(f"Expected role 'user', got '{user['role']}'")
            return False
        
        # Validate favorites is empty array
        if not isinstance(user['favorites'], list) or len(user['favorites']) != 0:
            print_fail(f"Expected favorites to be empty array, got {user['favorites']}")
            return False
        
        print_pass(f"User registered successfully")
        print_info(f"User: {json.dumps(user, indent=2)}")
        print_info(f"Token: {user_token[:20]}...")
        
    except Exception as e:
        print_fail(f"Registration error: {str(e)}")
        return False
    
    # Try to register same email again (should get 409)
    print_step("1b", "POST /api/auth/register - duplicate email (should return 409)")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 409:
            print_fail(f"Expected 409, got {response.status_code}")
            return False
        
        print_pass("Duplicate email correctly rejected with 409")
        
    except Exception as e:
        print_fail(f"Duplicate email test error: {str(e)}")
        return False
    
    return True

def test_auth_login():
    """Step 2: POST /api/auth/login - correct and wrong password"""
    global user_token
    
    print_step(2, "POST /api/auth/login - correct password")
    
    try:
        payload = {
            "email": "user1@yabiso.com",
            "password": "pass1234"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        if 'user' not in data or 'token' not in data:
            print_fail("Response missing 'user' or 'token'")
            return False
        
        user = data['user']
        user_token = data['token']
        
        # Check no passwordHash or _id
        if 'passwordHash' in user or '_id' in user:
            print_fail("User contains passwordHash or _id")
            return False
        
        print_pass(f"Login successful")
        print_info(f"User: {user['name']} ({user['email']})")
        print_info(f"Token: {user_token[:20]}...")
        
    except Exception as e:
        print_fail(f"Login error: {str(e)}")
        return False
    
    # Try wrong password (should get 401)
    print_step("2b", "POST /api/auth/login - wrong password (should return 401)")
    try:
        payload = {
            "email": "user1@yabiso.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 401:
            print_fail(f"Expected 401, got {response.status_code}")
            return False
        
        print_pass("Wrong password correctly rejected with 401")
        
    except Exception as e:
        print_fail(f"Wrong password test error: {str(e)}")
        return False
    
    return True

def test_auth_me():
    """Step 3: GET /api/auth/me - with and without token"""
    
    print_step(3, "GET /api/auth/me - with Bearer token")
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        user = response.json()
        
        # Check no passwordHash or _id
        if 'passwordHash' in user or '_id' in user:
            print_fail("User contains passwordHash or _id")
            return False
        
        print_pass(f"Auth/me successful")
        print_info(f"User: {user['name']} ({user['email']})")
        
    except Exception as e:
        print_fail(f"Auth/me error: {str(e)}")
        return False
    
    # Try without token (should get 401)
    print_step("3b", "GET /api/auth/me - without token (should return 401)")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 401:
            print_fail(f"Expected 401, got {response.status_code}")
            return False
        
        print_pass("No token correctly rejected with 401")
        
    except Exception as e:
        print_fail(f"No token test error: {str(e)}")
        return False
    
    # Try with bad token (should get 401)
    print_step("3c", "GET /api/auth/me - with bad token (should return 401)")
    try:
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 401:
            print_fail(f"Expected 401, got {response.status_code}")
            return False
        
        print_pass("Bad token correctly rejected with 401")
        
    except Exception as e:
        print_fail(f"Bad token test error: {str(e)}")
        return False
    
    return True

def test_auth_favorites():
    """Step 4: PUT /api/auth/favorites - toggle hotel favorites"""
    
    if not test_hotel_id:
        print_fail("No test hotel ID available")
        return False
    
    print_step(4, f"PUT /api/auth/favorites - add hotel {test_hotel_id}")
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        payload = {"hotelId": test_hotel_id}
        response = requests.put(f"{BASE_URL}/auth/favorites", json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if 'favorites' not in data:
            print_fail("Response missing 'favorites'")
            return False
        
        favorites = data['favorites']
        
        if not isinstance(favorites, list):
            print_fail(f"Favorites should be array, got {type(favorites)}")
            return False
        
        if test_hotel_id not in favorites:
            print_fail(f"Hotel ID {test_hotel_id} not in favorites")
            return False
        
        print_pass(f"Hotel added to favorites")
        print_info(f"Favorites: {favorites}")
        
    except Exception as e:
        print_fail(f"Add favorites error: {str(e)}")
        return False
    
    # Toggle off (call again with same hotelId)
    print_step("4b", f"PUT /api/auth/favorites - toggle off (remove hotel)")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        payload = {"hotelId": test_hotel_id}
        response = requests.put(f"{BASE_URL}/auth/favorites", json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        favorites = data['favorites']
        
        if test_hotel_id in favorites:
            print_fail(f"Hotel ID {test_hotel_id} still in favorites (should be removed)")
            return False
        
        print_pass(f"Hotel removed from favorites (toggle working)")
        print_info(f"Favorites: {favorites}")
        
    except Exception as e:
        print_fail(f"Toggle favorites error: {str(e)}")
        return False
    
    return True

def test_user_bookings():
    """Step 5: POST /api/bookings + GET /api/auth/bookings"""
    global test_booking_id
    
    if not test_hotel_id or not test_room_id:
        print_fail("No test hotel/room ID available")
        return False
    
    print_step(5, "POST /api/bookings - create booking as user")
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        payload = {
            "hotelId": test_hotel_id,
            "roomId": test_room_id,
            "checkIn": "2025-06-01",
            "checkOut": "2025-06-03",
            "guests": 2,
            "currency": "USD",
            "customer": {
                "name": "Test User",
                "email": "user1@yabiso.com",
                "phone": "+243900000000"
            },
            "paymentMethod": "card"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
        
        booking = response.json()
        test_booking_id = booking.get('id')
        
        print_pass(f"Booking created successfully")
        print_info(f"Booking ID: {test_booking_id}")
        print_info(f"Reference: {booking.get('reference')}")
        print_info(f"Total CDF: {booking.get('totalCDF')}")
        print_info(f"Total Display: {booking.get('totalDisplay')} {booking.get('currency')}")
        
    except Exception as e:
        print_fail(f"Create booking error: {str(e)}")
        return False
    
    # Get user bookings
    print_step("5b", "GET /api/auth/bookings - get user's bookings")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{BASE_URL}/auth/bookings", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        bookings = response.json()
        
        if not isinstance(bookings, list):
            print_fail(f"Expected array, got {type(bookings)}")
            return False
        
        # Check if our booking is in the list
        found = False
        for b in bookings:
            if b.get('id') == test_booking_id or b.get('customer', {}).get('email') == 'user1@yabiso.com':
                found = True
                break
        
        if not found:
            print_fail(f"Booking not found in user's bookings")
            return False
        
        print_pass(f"User bookings retrieved successfully")
        print_info(f"Total bookings: {len(bookings)}")
        
    except Exception as e:
        print_fail(f"Get user bookings error: {str(e)}")
        return False
    
    return True

def test_admin_login():
    """Step 6: POST /api/auth/login - admin login"""
    global admin_token
    
    print_step(6, "POST /api/auth/login - admin login (admin@yabiso.com / yabiso2025)")
    
    try:
        payload = {
            "email": "admin@yabiso.com",
            "password": "yabiso2025"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        if 'user' not in data or 'token' not in data:
            print_fail("Response missing 'user' or 'token'")
            return False
        
        user = data['user']
        admin_token = data['token']
        
        # Check role is admin
        if user.get('role') != 'admin':
            print_fail(f"Expected role 'admin', got '{user.get('role')}'")
            return False
        
        print_pass(f"Admin login successful")
        print_info(f"Admin: {user['name']} ({user['email']})")
        print_info(f"Role: {user['role']}")
        print_info(f"Token: {admin_token[:20]}...")
        
    except Exception as e:
        print_fail(f"Admin login error: {str(e)}")
        return False
    
    return True

def test_admin_stats():
    """Step 7-8: GET /api/admin/stats - with admin, user, and no token"""
    
    print_step(7, "GET /api/admin/stats - with admin Bearer token")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        stats = response.json()
        
        # Check all required fields are numeric
        required_fields = ['users', 'agents', 'hotels', 'verifiedHotels', 'importedHotels', 
                          'bookings', 'revenueCDF', 'commissionCDF']
        
        for field in required_fields:
            if field not in stats:
                print_fail(f"Stats missing field: {field}")
                return False
            
            if not isinstance(stats[field], (int, float)):
                print_fail(f"Field {field} should be numeric, got {type(stats[field])}")
                return False
        
        # Check byStatus
        if 'byStatus' not in stats or not isinstance(stats['byStatus'], dict):
            print_fail("Stats missing 'byStatus' or not a dict")
            return False
        
        print_pass(f"Admin stats retrieved successfully")
        print_info(f"Stats: {json.dumps(stats, indent=2)}")
        
    except Exception as e:
        print_fail(f"Admin stats error: {str(e)}")
        return False
    
    # Try with user token (should get 403)
    print_step(8, "GET /api/admin/stats - with NON-admin user token (should return 403)")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 403:
            print_fail(f"Expected 403, got {response.status_code}")
            return False
        
        print_pass("Non-admin user correctly rejected with 403")
        
    except Exception as e:
        print_fail(f"User token test error: {str(e)}")
        return False
    
    # Try without token (should get 403)
    print_step("8b", "GET /api/admin/stats - without token (should return 403)")
    try:
        response = requests.get(f"{BASE_URL}/admin/stats", timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 403:
            print_fail(f"Expected 403, got {response.status_code}")
            return False
        
        print_pass("No token correctly rejected with 403")
        
    except Exception as e:
        print_fail(f"No token test error: {str(e)}")
        return False
    
    return True

def test_admin_users():
    """Step 9: GET /api/admin/users"""
    
    print_step(9, "GET /api/admin/users - with admin token")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        users = response.json()
        
        if not isinstance(users, list):
            print_fail(f"Expected array, got {type(users)}")
            return False
        
        # Check that no user contains passwordHash
        for user in users:
            if 'passwordHash' in user:
                print_fail(f"User {user.get('email')} contains passwordHash")
                return False
        
        print_pass(f"Admin users retrieved successfully")
        print_info(f"Total users: {len(users)}")
        print_info(f"Sample user: {users[0].get('email')} (role: {users[0].get('role')})")
        
    except Exception as e:
        print_fail(f"Admin users error: {str(e)}")
        return False
    
    return True

def test_admin_bookings():
    """Step 10: GET /api/admin/bookings + PUT /api/admin/bookings/:id/status"""
    
    print_step(10, "GET /api/admin/bookings - with admin token")
    
    booking_id_to_update = None
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/bookings", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        bookings = response.json()
        
        if not isinstance(bookings, list):
            print_fail(f"Expected array, got {type(bookings)}")
            return False
        
        if len(bookings) > 0:
            booking_id_to_update = bookings[0].get('id')
        
        print_pass(f"Admin bookings retrieved successfully")
        print_info(f"Total bookings: {len(bookings)}")
        
    except Exception as e:
        print_fail(f"Admin bookings error: {str(e)}")
        return False
    
    # Update booking status
    if not booking_id_to_update:
        print_info("No bookings available to update status")
        return True
    
    print_step("10b", f"PUT /api/admin/bookings/{booking_id_to_update}/status - update status")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        payload = {"status": "confirmed_by_hotel"}
        response = requests.put(f"{BASE_URL}/admin/bookings/{booking_id_to_update}/status", 
                               json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        booking = response.json()
        
        # Check status updated
        if booking.get('status') != 'confirmed_by_hotel':
            print_fail(f"Status not updated, got {booking.get('status')}")
            return False
        
        # Check statusHistory has new entry
        status_history = booking.get('statusHistory', [])
        if not isinstance(status_history, list):
            print_fail("statusHistory is not an array")
            return False
        
        # Find the new status in history
        found = False
        for entry in status_history:
            if entry.get('key') == 'confirmed_by_hotel':
                found = True
                break
        
        if not found:
            print_fail("New status not found in statusHistory")
            return False
        
        print_pass(f"Booking status updated successfully")
        print_info(f"New status: {booking.get('status')}")
        print_info(f"Status history entries: {len(status_history)}")
        
    except Exception as e:
        print_fail(f"Update booking status error: {str(e)}")
        return False
    
    return True

def test_admin_agents():
    """Step 11: GET /api/admin/agents"""
    
    print_step(11, "GET /api/admin/agents - with admin token")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/agents", headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        agents = response.json()
        
        if not isinstance(agents, list):
            print_fail(f"Expected array, got {type(agents)}")
            return False
        
        print_pass(f"Admin agents retrieved successfully")
        print_info(f"Total agents: {len(agents)}")
        
    except Exception as e:
        print_fail(f"Admin agents error: {str(e)}")
        return False
    
    return True

def test_admin_hotel_feature():
    """Step 12: PUT /api/admin/hotels/:id/feature"""
    
    if not test_hotel_id:
        print_fail("No test hotel ID available")
        return False
    
    print_step(12, f"PUT /api/admin/hotels/{test_hotel_id}/feature - set featured=true")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        payload = {"featured": True}
        response = requests.put(f"{BASE_URL}/admin/hotels/{test_hotel_id}/feature", 
                               json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get('featured') != True:
            print_fail(f"Featured should be True, got {data.get('featured')}")
            return False
        
        print_pass(f"Hotel featured status updated successfully")
        print_info(f"Featured: {data.get('featured')}")
        
    except Exception as e:
        print_fail(f"Update hotel feature error: {str(e)}")
        return False
    
    return True

def test_commission_settings():
    """Step 13: PUT /api/settings/rates - commission settings and validation"""
    
    print_step(13, "PUT /api/settings/rates - set commission to 0.25")
    
    try:
        payload = {"commission": 0.25}
        response = requests.put(f"{BASE_URL}/settings/rates", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get('commission') != 0.25:
            print_fail(f"Commission should be 0.25, got {data.get('commission')}")
            return False
        
        print_pass(f"Commission updated successfully")
        print_info(f"Commission: {data.get('commission')}")
        
    except Exception as e:
        print_fail(f"Update commission error: {str(e)}")
        return False
    
    # Create a booking to verify commission calculation
    print_step("13b", "POST /api/bookings - verify commission calculation with 0.25 rate")
    
    if not test_hotel_id or not test_room_id:
        print_info("Skipping booking verification (no hotel/room ID)")
        return True
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        payload = {
            "hotelId": test_hotel_id,
            "roomId": test_room_id,
            "checkIn": "2025-07-01",
            "checkOut": "2025-07-03",
            "guests": 2,
            "currency": "USD",
            "customer": {
                "name": "Test User",
                "email": "user1@yabiso.com",
                "phone": "+243900000000"
            },
            "paymentMethod": "card"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        booking = response.json()
        
        total_cdf = booking.get('totalCDF', 0)
        commission_cdf = booking.get('commissionCDF', 0)
        expected_commission = round(total_cdf * 0.25)
        
        if commission_cdf != expected_commission:
            print_fail(f"Commission calculation wrong. Expected {expected_commission}, got {commission_cdf}")
            return False
        
        print_pass(f"Commission calculation correct")
        print_info(f"Total CDF: {total_cdf}, Commission CDF: {commission_cdf} (25%)")
        
    except Exception as e:
        print_fail(f"Booking verification error: {str(e)}")
        return False
    
    # Test commission cap at 0.5
    print_step("13c", "PUT /api/settings/rates - set commission to 0.9 (should cap at 0.5)")
    try:
        payload = {"commission": 0.9}
        response = requests.put(f"{BASE_URL}/settings/rates", json=payload, timeout=30)
        print_info(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_fail(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get('commission') != 0.5:
            print_fail(f"Commission should be capped at 0.5, got {data.get('commission')}")
            return False
        
        print_pass(f"Commission capping working correctly")
        print_info(f"Commission: {data.get('commission')} (capped at 0.5)")
        
    except Exception as e:
        print_fail(f"Commission cap test error: {str(e)}")
        return False
    
    return True

def run_all_tests():
    """Run all auth and admin tests"""
    print_section("YABISO HOTELS - AUTH + ADMIN BACKEND TESTS")
    
    tests = [
        ("Seed", test_seed),
        ("Auth Register", test_auth_register),
        ("Auth Login", test_auth_login),
        ("Auth Me", test_auth_me),
        ("Auth Favorites", test_auth_favorites),
        ("User Bookings", test_user_bookings),
        ("Admin Login", test_admin_login),
        ("Admin Stats", test_admin_stats),
        ("Admin Users", test_admin_users),
        ("Admin Bookings", test_admin_bookings),
        ("Admin Agents", test_admin_agents),
        ("Admin Hotel Feature", test_admin_hotel_feature),
        ("Commission Settings", test_commission_settings),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
            if not result:
                print_fail(f"{name} test failed")
        except Exception as e:
            print_fail(f"{name} test exception: {str(e)}")
            results.append((name, False))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'='*80}")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
