#!/usr/bin/env python3
"""
Backend test for YABISO HOTELS - Google Places Import Integration
Tests the REAL Google Places API integration
"""
import requests
import json
from urllib.parse import urlparse, parse_qs, unquote

# Base URL from .env
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

def test_google_places_import():
    """Test Google Places import integration with REAL API"""
    print("\n" + "="*80)
    print("TESTING GOOGLE PLACES IMPORT INTEGRATION")
    print("="*80)
    
    # Step 1: Create/get an agent
    print("\n[STEP 1] Creating/getting agent...")
    try:
        agent_payload = {
            "name": "Import Agent",
            "email": "import@yabiso.com",
            "zone": "Kinshasa"
        }
        response = requests.post(f"{BASE_URL}/agents/login", json=agent_payload, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL - Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        agent = response.json()
        agent_id = agent.get('id')
        print(f"✅ PASS - Agent created/retrieved: {agent.get('name')} (ID: {agent_id})")
        print(f"   Agent code: {agent.get('code')}, Zone: {agent.get('zone')}")
        
        if not agent_id:
            print("❌ FAIL - No agent ID returned")
            return False
            
    except Exception as e:
        print(f"❌ FAIL - Agent creation error: {str(e)}")
        return False
    
    # Step 2: Import hotels from Google Places
    print("\n[STEP 2] Importing hotels from Google Places (Kinshasa)...")
    try:
        import_payload = {
            "city": "Kinshasa",
            "province": "Kinshasa",
            "country": "RD Congo",
            "region": "Afrique Centrale",
            "agentId": agent_id,
            "max": 10
        }
        response = requests.post(f"{BASE_URL}/import/hotels", json=import_payload, timeout=60)
        print(f"Status: {response.status_code}")
        
        # Check for Google API errors (502 with error message)
        if response.status_code == 502:
            error_data = response.json()
            error_msg = error_data.get('error', '')
            print(f"⚠️  GOOGLE API ERROR (502): {error_msg}")
            print(f"   This indicates a Google API configuration issue:")
            print(f"   - If 'PERMISSION_DENIED' or 'REQUEST_DENIED': API key may need Places API (New) enabled")
            print(f"   - If 'billing': Billing must be enabled on Google Cloud project")
            print(f"   - Exact error: {error_msg}")
            return False
        
        if response.status_code != 200:
            print(f"❌ FAIL - Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        import_result = response.json()
        print(f"✅ PASS - Import successful!")
        print(f"   City: {import_result.get('city')}")
        print(f"   Fetched: {import_result.get('fetched')} places from Google")
        print(f"   Imported: {import_result.get('imported')} new hotels")
        print(f"   Updated: {import_result.get('updated')} existing hotels")
        print(f"   Total hotels in response: {len(import_result.get('hotels', []))}")
        
        hotels = import_result.get('hotels', [])
        if len(hotels) == 0:
            print("❌ FAIL - No hotels returned")
            return False
        
        # Step 2a: Validate hotel structure
        print("\n[STEP 2a] Validating hotel structure...")
        sample_hotel = hotels[0]
        print(f"   Sample hotel: {sample_hotel.get('name')}")
        
        required_fields = {
            'id': str,
            'name': str,
            'address': str,
            'lat': (int, float),
            'lng': (int, float),
            'rating': (int, float),
            'reviewCount': int,
            'images': list,
            'rooms': list,
            'priceCDF': (int, float),
            'source': str,
            'externalId': str,
            'verified': bool
        }
        
        validation_passed = True
        for field, expected_type in required_fields.items():
            if field not in sample_hotel:
                print(f"   ❌ Missing field: {field}")
                validation_passed = False
            elif not isinstance(sample_hotel[field], expected_type):
                print(f"   ❌ Field {field} has wrong type: {type(sample_hotel[field])} (expected {expected_type})")
                validation_passed = False
        
        # Check specific validations
        if sample_hotel.get('name', '').strip() == '':
            print(f"   ❌ Hotel name is empty")
            validation_passed = False
        
        if sample_hotel.get('address', '').strip() == '':
            print(f"   ❌ Hotel address is empty")
            validation_passed = False
        
        if sample_hotel.get('lat') == 0 or sample_hotel.get('lng') == 0:
            print(f"   ⚠️  WARNING: lat/lng is zero (lat={sample_hotel.get('lat')}, lng={sample_hotel.get('lng')})")
        
        if sample_hotel.get('source') != 'google_places':
            print(f"   ❌ Source is not 'google_places': {sample_hotel.get('source')}")
            validation_passed = False
        
        if sample_hotel.get('verified') != False:
            print(f"   ❌ Verified should be False: {sample_hotel.get('verified')}")
            validation_passed = False
        
        # Check images
        images = sample_hotel.get('images', [])
        if len(images) == 0:
            print(f"   ❌ No images in hotel")
            validation_passed = False
        else:
            first_image = images[0]
            if not isinstance(first_image, str):
                print(f"   ❌ Image is not a string: {type(first_image)}")
                validation_passed = False
            elif not first_image.startswith('/api/hotel-photo?name='):
                print(f"   ❌ Image URL doesn't start with '/api/hotel-photo?name=': {first_image}")
                validation_passed = False
            else:
                print(f"   ✅ Image URL format correct: {first_image[:50]}...")
        
        # Check rooms
        rooms = sample_hotel.get('rooms', [])
        if len(rooms) != 3:
            print(f"   ❌ Expected 3 rooms, got {len(rooms)}")
            validation_passed = False
        else:
            print(f"   ✅ Rooms count correct: 3")
        
        # Check priceCDF
        if sample_hotel.get('priceCDF', 0) <= 0:
            print(f"   ❌ priceCDF should be > 0: {sample_hotel.get('priceCDF')}")
            validation_passed = False
        
        # Check for Mongo _id
        if '_id' in sample_hotel:
            print(f"   ❌ Mongo _id field present in response")
            validation_passed = False
        
        if validation_passed:
            print(f"   ✅ PASS - Hotel structure validation passed")
            print(f"   Hotel details:")
            print(f"      Name: {sample_hotel.get('name')}")
            print(f"      Address: {sample_hotel.get('address')}")
            print(f"      Lat/Lng: {sample_hotel.get('lat')}, {sample_hotel.get('lng')}")
            print(f"      Rating: {sample_hotel.get('rating')} ({sample_hotel.get('reviewCount')} reviews)")
            print(f"      Price: {sample_hotel.get('priceCDF')} CDF")
            print(f"      External ID: {sample_hotel.get('externalId')}")
        else:
            print(f"   ❌ FAIL - Hotel structure validation failed")
            return False
        
        # Store for later tests
        first_hotel_image = images[0] if images else None
        
    except Exception as e:
        print(f"❌ FAIL - Import error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # Step 3: Test idempotency - call same import again
    print("\n[STEP 3] Testing idempotency (calling same import again)...")
    try:
        response = requests.post(f"{BASE_URL}/import/hotels", json=import_payload, timeout=60)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL - Expected 200, got {response.status_code}")
            return False
        
        import_result2 = response.json()
        print(f"   Fetched: {import_result2.get('fetched')}")
        print(f"   Imported: {import_result2.get('imported')}")
        print(f"   Updated: {import_result2.get('updated')}")
        
        # Second call should have updated > 0 (or imported smaller)
        if import_result2.get('updated', 0) > 0:
            print(f"   ✅ PASS - Idempotency working: {import_result2.get('updated')} hotels updated (not duplicated)")
        elif import_result2.get('imported', 0) < import_result.get('imported', 0):
            print(f"   ✅ PASS - Idempotency working: fewer hotels imported on second call")
        else:
            print(f"   ⚠️  WARNING - Expected updated > 0 or imported to decrease")
        
        # Step 3a: Verify no duplicates by checking externalId
        print("\n[STEP 3a] Verifying no duplicate hotels by externalId...")
        response = requests.get(f"{BASE_URL}/hotels?q=Kinshasa", timeout=30)
        if response.status_code == 200:
            all_hotels = response.json()
            external_ids = [h.get('externalId') for h in all_hotels if h.get('externalId')]
            unique_external_ids = set(external_ids)
            
            if len(external_ids) == len(unique_external_ids):
                print(f"   ✅ PASS - No duplicate externalIds found ({len(external_ids)} hotels)")
            else:
                print(f"   ❌ FAIL - Duplicate externalIds found: {len(external_ids)} total, {len(unique_external_ids)} unique")
                return False
        else:
            print(f"   ⚠️  WARNING - Could not verify duplicates (GET /hotels failed)")
        
    except Exception as e:
        print(f"❌ FAIL - Idempotency test error: {str(e)}")
        return False
    
    # Step 4: Test photo proxy
    print("\n[STEP 4] Testing photo proxy...")
    if not first_hotel_image:
        print("   ⚠️  SKIP - No image URL available from import")
    else:
        try:
            # Extract photo name from URL
            # Format: /api/hotel-photo?name=<encoded_name>&w=1000
            parsed = urlparse(first_hotel_image)
            query_params = parse_qs(parsed.query)
            photo_name = query_params.get('name', [None])[0]
            
            if not photo_name:
                print(f"   ❌ FAIL - Could not extract photo name from URL: {first_hotel_image}")
                return False
            
            # URL decode the photo name
            photo_name_decoded = unquote(photo_name)
            print(f"   Photo name (decoded): {photo_name_decoded[:60]}...")
            
            # Call photo proxy with w=400
            photo_url = f"{BASE_URL}/hotel-photo?name={photo_name}&w=400"
            response = requests.get(photo_url, timeout=30)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 502:
                print(f"   ❌ FAIL - Photo proxy returned 502")
                print(f"   Response: {response.text}")
                return False
            
            if response.status_code != 200:
                print(f"   ❌ FAIL - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text}")
                return False
            
            content_type = response.headers.get('Content-Type', '')
            print(f"   Content-Type: {content_type}")
            
            if not content_type.startswith('image/'):
                print(f"   ❌ FAIL - Content-Type should start with 'image/', got: {content_type}")
                return False
            
            content_length = len(response.content)
            print(f"   Content-Length: {content_length} bytes")
            
            if content_length < 100:
                print(f"   ❌ FAIL - Image too small, likely not a real image")
                return False
            
            print(f"   ✅ PASS - Photo proxy working correctly")
            
        except Exception as e:
            print(f"   ❌ FAIL - Photo proxy error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    # Step 5: Test validation - missing city
    print("\n[STEP 5] Testing validation (missing city)...")
    try:
        response = requests.post(f"{BASE_URL}/import/hotels", json={}, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 400:
            print(f"   ❌ FAIL - Expected 400, got {response.status_code}")
            return False
        
        error_data = response.json()
        print(f"   Error message: {error_data.get('error')}")
        print(f"   ✅ PASS - Validation working correctly")
        
    except Exception as e:
        print(f"   ❌ FAIL - Validation test error: {str(e)}")
        return False
    
    print("\n" + "="*80)
    print("✅ ALL GOOGLE PLACES IMPORT TESTS PASSED")
    print("="*80)
    return True

if __name__ == "__main__":
    try:
        success = test_google_places_import()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
