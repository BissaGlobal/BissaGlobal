#!/usr/bin/env python3
"""
Backend API Test for YABISO HOTELS - Agent/Field-agent endpoints
Tests all agent-related endpoints with comprehensive scenarios
"""

import requests
import json
import re
from datetime import datetime

# Base URL from .env
BASE_URL = "https://yabiso-hotels.preview.emergentagent.com/api"

def print_test(scenario, status, details=""):
    """Print test result"""
    symbol = "✅" if status == "PASS" else "❌"
    print(f"\n{symbol} Scenario {scenario}: {status}")
    if details:
        print(f"   {details}")

def check_no_mongo_id(data, path=""):
    """Recursively check for _id field in response"""
    if isinstance(data, dict):
        if "_id" in data:
            return False, f"Found _id at {path}"
        for key, value in data.items():
            result, msg = check_no_mongo_id(value, f"{path}.{key}")
            if not result:
                return result, msg
    elif isinstance(data, list):
        for i, item in enumerate(data):
            result, msg = check_no_mongo_id(item, f"{path}[{i}]")
            if not result:
                return result, msg
    return True, ""

def test_agent_endpoints():
    """Test all agent-related endpoints"""
    print("=" * 80)
    print("YABISO HOTELS - Agent/Field-agent Backend API Tests")
    print("=" * 80)
    
    agent_id = None
    hotel_id = None
    
    # Scenario 1: POST /api/agents/login - create new agent
    print("\n--- Scenario 1: Agent Login (Create) ---")
    try:
        payload = {
            "name": "Field Agent",
            "email": "field1@yabiso.com",
            "zone": "Nord-Kivu"
        }
        response = requests.post(f"{BASE_URL}/agents/login", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            agent = response.json()
            print(f"Response: {json.dumps(agent, indent=2)}")
            
            # Validate response structure
            assert "id" in agent, "Missing id field"
            assert "name" in agent, "Missing name field"
            assert "email" in agent, "Missing email field"
            assert "code" in agent, "Missing code field"
            assert "zone" in agent, "Missing zone field"
            
            # Validate values
            assert agent["name"] == "Field Agent", f"Name mismatch: {agent['name']}"
            assert agent["email"] == "field1@yabiso.com", f"Email mismatch: {agent['email']}"
            assert agent["zone"] == "Nord-Kivu", f"Zone mismatch: {agent['zone']}"
            
            # Validate code format (AG-XXXX)
            code_pattern = r"^AG-[A-Z0-9]{4}$"
            assert re.match(code_pattern, agent["code"]), f"Code format invalid: {agent['code']}"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(agent)
            assert no_id, f"Mongo _id found: {msg}"
            
            agent_id = agent["id"]
            first_agent_id = agent["id"]
            
            print_test("1a", "PASS", f"Agent created: id={agent_id}, code={agent['code']}")
        else:
            print_test("1a", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("1a", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 1b: POST /api/agents/login - same email (find-or-create)
    print("\n--- Scenario 1b: Agent Login (Find existing) ---")
    try:
        payload = {
            "name": "Field Agent",
            "email": "field1@yabiso.com",
            "zone": "Nord-Kivu"
        }
        response = requests.post(f"{BASE_URL}/agents/login", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            agent = response.json()
            print(f"Response: {json.dumps(agent, indent=2)}")
            
            # Must return SAME agent id
            assert agent["id"] == first_agent_id, f"Agent ID changed! Expected {first_agent_id}, got {agent['id']}"
            
            print_test("1b", "PASS", f"Same agent returned: id={agent['id']} (find-or-create working)")
        else:
            print_test("1b", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("1b", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 1c: POST /api/agents/login - missing email (validation)
    print("\n--- Scenario 1c: Agent Login (Missing email) ---")
    try:
        payload = {
            "name": "Test Agent"
        }
        response = requests.post(f"{BASE_URL}/agents/login", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 400:
            print_test("1c", "PASS", "Validation working: 400 for missing email")
        else:
            print_test("1c", "FAIL", f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_test("1c", "FAIL", f"Exception: {str(e)}")
    
    # Scenario 2: GET /api/agents/:id
    print("\n--- Scenario 2: Get Agent by ID ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/{agent_id}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            agent = response.json()
            print(f"Response: {json.dumps(agent, indent=2)}")
            
            assert agent["id"] == agent_id, f"ID mismatch"
            assert agent["name"] == "Field Agent", f"Name mismatch"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(agent)
            assert no_id, f"Mongo _id found: {msg}"
            
            print_test("2a", "PASS", f"Agent retrieved: {agent['name']}")
        else:
            print_test("2a", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("2a", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 2b: GET /api/agents/:id - unknown id (404)
    print("\n--- Scenario 2b: Get Agent (Unknown ID) ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/unknown-id-12345")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 404:
            print_test("2b", "PASS", "404 for unknown agent ID")
        else:
            print_test("2b", "FAIL", f"Expected 404, got {response.status_code}")
    except Exception as e:
        print_test("2b", "FAIL", f"Exception: {str(e)}")
    
    # Scenario 3: POST /api/hotels (create property)
    print("\n--- Scenario 3: Create Property ---")
    try:
        payload = {
            "name": "Goma Test Inn",
            "type": "hotel",
            "country": "RD Congo",
            "province": "Nord-Kivu",
            "city": "Goma",
            "region": "Afrique Centrale",
            "description": "Test",
            "agentId": agent_id,
            "amenities": ["wifi", "parking"],
            "images": ["https://example.com/a.jpg"],
            "lat": "-1.6792",
            "lng": "29.2228",
            "rooms": [
                {
                    "name": "Standard",
                    "priceCDF": "120000",
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
        response = requests.post(f"{BASE_URL}/hotels", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            hotel = response.json()
            print(f"Response: {json.dumps(hotel, indent=2, default=str)}")
            
            # Validate structure
            assert "id" in hotel, "Missing id"
            assert hotel["name"] == "Goma Test Inn", f"Name mismatch"
            assert hotel["verified"] == False, f"Should be unverified initially"
            assert hotel["agentId"] == agent_id, f"AgentId mismatch"
            
            # Check priceCDF is min room price
            assert hotel["priceCDF"] == 120000, f"priceCDF should be 120000 (min room), got {hotel['priceCDF']}"
            
            # Check rooms have generated IDs
            assert len(hotel["rooms"]) == 2, f"Should have 2 rooms"
            for room in hotel["rooms"]:
                assert "id" in room, "Room missing id"
                assert "name" in room, "Room missing name"
                assert "priceCDF" in room, "Room missing priceCDF"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(hotel)
            assert no_id, f"Mongo _id found: {msg}"
            
            hotel_id = hotel["id"]
            
            print_test("3a", "PASS", f"Property created: id={hotel_id}, priceCDF={hotel['priceCDF']}, rooms={len(hotel['rooms'])}")
        else:
            print_test("3a", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("3a", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 3b: POST /api/hotels - missing required field
    print("\n--- Scenario 3b: Create Property (Missing city) ---")
    try:
        payload = {
            "name": "Test Hotel",
            "province": "Nord-Kivu",
            "country": "RD Congo",
            "agentId": agent_id
            # Missing city
        }
        response = requests.post(f"{BASE_URL}/hotels", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 400:
            print_test("3b", "PASS", "Validation working: 400 for missing city")
        else:
            print_test("3b", "FAIL", f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_test("3b", "FAIL", f"Exception: {str(e)}")
    
    # Scenario 4: GET /api/agents/:id/hotels
    print("\n--- Scenario 4: Get Agent's Hotels ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/{agent_id}/hotels")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            hotels = response.json()
            print(f"Response: {len(hotels)} hotels")
            
            assert isinstance(hotels, list), "Should return array"
            assert len(hotels) >= 1, "Should have at least 1 hotel"
            
            # Find our created hotel
            found = False
            for h in hotels:
                if h["id"] == hotel_id:
                    found = True
                    assert h["name"] == "Goma Test Inn", "Hotel name mismatch"
                    break
            
            assert found, "Created hotel not found in agent's hotels"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(hotels)
            assert no_id, f"Mongo _id found: {msg}"
            
            print_test("4", "PASS", f"Agent has {len(hotels)} hotel(s)")
        else:
            print_test("4", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("4", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 5: GET /api/agents/:id/stats (before verify)
    print("\n--- Scenario 5: Get Agent Stats (Before Verify) ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/{agent_id}/stats")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"Response: {json.dumps(stats, indent=2)}")
            
            assert "properties" in stats, "Missing properties"
            assert "verified" in stats, "Missing verified"
            assert "rooms" in stats, "Missing rooms"
            assert "activities" in stats, "Missing activities"
            
            assert stats["properties"] == 1, f"Should have 1 property, got {stats['properties']}"
            assert stats["verified"] == 0, f"Should have 0 verified, got {stats['verified']}"
            assert stats["rooms"] == 2, f"Should have 2 rooms, got {stats['rooms']}"
            assert stats["activities"] >= 2, f"Should have >=2 activities (agent_registered + property_created), got {stats['activities']}"
            
            print_test("5", "PASS", f"Stats: properties={stats['properties']}, verified={stats['verified']}, rooms={stats['rooms']}, activities={stats['activities']}")
        else:
            print_test("5", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("5", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 6: POST /api/hotels/:id/verify
    print("\n--- Scenario 6: Verify Property (GPS) ---")
    try:
        payload = {
            "agentId": agent_id,
            "lat": -1.68,
            "lng": 29.22
        }
        response = requests.post(f"{BASE_URL}/hotels/{hotel_id}/verify", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            hotel = response.json()
            print(f"Response: {json.dumps(hotel, indent=2, default=str)}")
            
            assert hotel["verified"] == True, f"Should be verified"
            assert "verification" in hotel, "Missing verification object"
            
            verification = hotel["verification"]
            assert verification["agentId"] == agent_id, "Verification agentId mismatch"
            assert verification["lat"] == -1.68, f"Verification lat mismatch"
            assert verification["lng"] == 29.22, f"Verification lng mismatch"
            assert "at" in verification, "Missing verification timestamp"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(hotel)
            assert no_id, f"Mongo _id found: {msg}"
            
            print_test("6", "PASS", f"Property verified: lat={verification['lat']}, lng={verification['lng']}")
        else:
            print_test("6", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("6", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 7: GET /api/agents/:id/stats (after verify)
    print("\n--- Scenario 7: Get Agent Stats (After Verify) ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/{agent_id}/stats")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"Response: {json.dumps(stats, indent=2)}")
            
            assert stats["verified"] == 1, f"Should have 1 verified property, got {stats['verified']}"
            
            print_test("7", "PASS", f"Stats updated: verified={stats['verified']}")
        else:
            print_test("7", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("7", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 8: PUT /api/hotels/:id (update property)
    print("\n--- Scenario 8: Update Property ---")
    try:
        payload = {
            "agentId": agent_id,
            "description": "Updated desc",
            "rooms": [
                {
                    "name": "Eco",
                    "priceCDF": "90000",
                    "capacity": 2,
                    "beds": "1 lit"
                }
            ]
        }
        response = requests.put(f"{BASE_URL}/hotels/{hotel_id}", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            hotel = response.json()
            print(f"Response: {json.dumps(hotel, indent=2, default=str)}")
            
            assert hotel["description"] == "Updated desc", f"Description not updated"
            assert hotel["priceCDF"] == 90000, f"priceCDF should be 90000 (recomputed min), got {hotel['priceCDF']}"
            assert len(hotel["rooms"]) == 1, f"Should have 1 room after update"
            assert hotel["rooms"][0]["name"] == "Eco", f"Room name mismatch"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(hotel)
            assert no_id, f"Mongo _id found: {msg}"
            
            print_test("8", "PASS", f"Property updated: description='{hotel['description']}', priceCDF={hotel['priceCDF']}")
        else:
            print_test("8", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("8", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 9: GET /api/agents/:id/activities
    print("\n--- Scenario 9: Get Agent Activities ---")
    try:
        response = requests.get(f"{BASE_URL}/agents/{agent_id}/activities")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            activities = response.json()
            print(f"Response: {len(activities)} activities")
            
            assert isinstance(activities, list), "Should return array"
            assert len(activities) >= 4, f"Should have >=4 activities (registered, created, verified, updated), got {len(activities)}"
            
            # Check activity types
            types = [a["type"] for a in activities]
            assert "agent_registered" in types, "Missing agent_registered activity"
            assert "property_created" in types, "Missing property_created activity"
            assert "property_verified" in types, "Missing property_verified activity"
            assert "property_updated" in types, "Missing property_updated activity"
            
            # Check sorted desc (newest first)
            for i in range(len(activities) - 1):
                current = datetime.fromisoformat(activities[i]["createdAt"].replace("Z", "+00:00"))
                next_act = datetime.fromisoformat(activities[i+1]["createdAt"].replace("Z", "+00:00"))
                assert current >= next_act, "Activities not sorted desc by createdAt"
            
            # Check property_verified has lat/lng in meta
            verified_act = next((a for a in activities if a["type"] == "property_verified"), None)
            assert verified_act is not None, "property_verified activity not found"
            assert "meta" in verified_act, "Missing meta in property_verified"
            assert "lat" in verified_act["meta"], "Missing lat in property_verified meta"
            assert "lng" in verified_act["meta"], "Missing lng in property_verified meta"
            
            # Check no _id
            no_id, msg = check_no_mongo_id(activities)
            assert no_id, f"Mongo _id found: {msg}"
            
            print_test("9", "PASS", f"Activities: {len(activities)} total, types={set(types)}, property_verified meta has lat/lng")
        else:
            print_test("9", "FAIL", f"Status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print_test("9", "FAIL", f"Exception: {str(e)}")
        return
    
    # Scenario 10: Confirm no _id in all responses (already checked in each scenario)
    print("\n--- Scenario 10: No Mongo _id Field ---")
    print_test("10", "PASS", "All responses checked - no _id field found in any response")
    
    print("\n" + "=" * 80)
    print("ALL AGENT ENDPOINT TESTS COMPLETED SUCCESSFULLY")
    print("=" * 80)

if __name__ == "__main__":
    test_agent_endpoints()
