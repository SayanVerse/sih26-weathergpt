import asyncio
from fastapi.testclient import TestClient
from main import app
import httpx
import json
import os

client = TestClient(app)

def test_location_endpoints():
    print("Testing Location Search...")
    resp = client.get("/api/locations/search?q=Kolkata")
    print("Search Kolkata:", resp.status_code, resp.json()[:2] if resp.status_code == 200 else resp.text)
    
    print("\nTesting Legacy Location Search...")
    resp2 = client.get("/api/location/search?query=Kolkata")
    print("Search Legacy Kolkata:", resp2.status_code, resp2.json()[:2] if resp2.status_code == 200 else resp2.text)

    print("\nTesting Reverse Geocoding...")
    resp3 = client.get("/api/location/reverse?lat=22.57&lon=88.36")
    print("Reverse Geocode Kolkata:", resp3.status_code, resp3.json() if resp3.status_code == 200 else resp3.text)

    print("\nTesting IP Geolocation (Detect)...")
    resp4 = client.get("/api/location/detect")
    print("IP Detect:", resp4.status_code, resp4.json() if resp4.status_code == 200 else resp4.text)
    
    print("\nTesting Saved Locations...")
    resp5 = client.get("/api/locations/saved")
    print("Get Saved Locations:", resp5.status_code, resp5.json() if resp5.status_code == 200 else resp5.text)
    
    print("\nTesting Save Location...")
    save_payload = {
        "id": "123",
        "name": "Kolkata",
        "region": "West Bengal",
        "country": "India",
        "latitude": 22.57,
        "longitude": 88.36
    }
    resp6 = client.post("/api/locations/saved", json=save_payload)
    print("Save Location:", resp6.status_code, resp6.json() if resp6.status_code == 200 else resp6.text)
    
    print("\nTesting Get Saved Locations after save...")
    resp7 = client.get("/api/locations/saved")
    print("Get Saved Locations:", resp7.status_code, resp7.json() if resp7.status_code == 200 else resp7.text)
    
    print("\nTesting Delete Saved Location...")
    resp8 = client.delete("/api/locations/saved/123")
    print("Delete Saved Location:", resp8.status_code, resp8.json() if resp8.status_code == 200 else resp8.text)

if __name__ == "__main__":
    test_location_endpoints()
