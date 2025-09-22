#!/usr/bin/env python3
"""
Backend API Tests for Summit IT Services
Tests all backend endpoints including appointment booking, admin auth, and services
"""

import requests
import json
import uuid
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mobile-tech-hub-5.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test data
ADMIN_CREDENTIALS = {
    "username": "yRoot",
    "password": "password123"
}

SAMPLE_APPOINTMENT = {
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "+1-555-0123",
    "service_type": "PC/Laptop Repair & Support",
    "location": "Downtown Office",
    "preferred_date": "2024-01-15",
    "preferred_time": "10:00",
    "description": "My laptop is running very slow and needs optimization"
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def log_pass(self, test_name):
        print(f"✅ PASS: {test_name}")
        self.passed += 1
        
    def log_fail(self, test_name, error):
        print(f"❌ FAIL: {test_name} - {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        print(f"{'='*60}")
        if self.errors:
            print("FAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

def test_api_root():
    """Test API root endpoint"""
    results = TestResults()
    
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            data = response.json()
            if "Summit IT Services API" in data.get("message", ""):
                results.log_pass("API Root endpoint")
            else:
                results.log_fail("API Root endpoint", f"Unexpected message: {data}")
        else:
            results.log_fail("API Root endpoint", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("API Root endpoint", f"Connection error: {str(e)}")
    
    return results

def test_services_api():
    """Test services endpoint"""
    results = TestResults()
    
    try:
        response = requests.get(f"{API_BASE}/services")
        if response.status_code == 200:
            services = response.json()
            
            # Check if we get 5 services
            if len(services) == 5:
                results.log_pass("Services API - Count")
            else:
                results.log_fail("Services API - Count", f"Expected 5 services, got {len(services)}")
            
            # Check expected service names
            expected_services = [
                "PC/Laptop Repair & Support",
                "Wi-Fi & Networking", 
                "Custom PC Builds",
                "Business IT Support",
                "Data Recovery"
            ]
            
            service_names = [s.get("name", "") for s in services]
            missing_services = []
            for expected in expected_services:
                if expected not in service_names:
                    missing_services.append(expected)
            
            if not missing_services:
                results.log_pass("Services API - Content")
            else:
                results.log_fail("Services API - Content", f"Missing services: {missing_services}")
                
        else:
            results.log_fail("Services API", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Services API", f"Error: {str(e)}")
    
    return results

def test_admin_authentication():
    """Test admin login and token verification"""
    results = TestResults()
    
    # Test valid login
    try:
        response = requests.post(f"{API_BASE}/admin/login", json=ADMIN_CREDENTIALS)
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "message" in data:
                token = data["token"]
                results.log_pass("Admin Login - Valid credentials")
                
                # Test token verification
                headers = {"Authorization": f"Bearer {token}"}
                verify_response = requests.get(f"{API_BASE}/admin/verify", headers=headers)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    if verify_data.get("username") == "yRoot":
                        results.log_pass("Admin Token Verification")
                        return results, token  # Return token for other tests
                    else:
                        results.log_fail("Admin Token Verification", f"Wrong username: {verify_data}")
                else:
                    results.log_fail("Admin Token Verification", f"Status code: {verify_response.status_code}")
            else:
                results.log_fail("Admin Login - Valid credentials", f"Missing token/message: {data}")
        else:
            results.log_fail("Admin Login - Valid credentials", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Admin Login - Valid credentials", f"Error: {str(e)}")
    
    # Test invalid login
    try:
        invalid_creds = {"username": "wrong", "password": "wrong"}
        response = requests.post(f"{API_BASE}/admin/login", json=invalid_creds)
        if response.status_code == 401:
            results.log_pass("Admin Login - Invalid credentials")
        else:
            results.log_fail("Admin Login - Invalid credentials", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.log_fail("Admin Login - Invalid credentials", f"Error: {str(e)}")
    
    # Test invalid token
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{API_BASE}/admin/verify", headers=headers)
        if response.status_code == 401:
            results.log_pass("Admin Token - Invalid token")
        else:
            results.log_fail("Admin Token - Invalid token", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.log_fail("Admin Token - Invalid token", f"Error: {str(e)}")
    
    return results, None

def test_appointment_booking(admin_token=None):
    """Test appointment creation and management"""
    results = TestResults()
    appointment_id = None
    
    # Test appointment creation
    try:
        response = requests.post(f"{API_BASE}/appointments", json=SAMPLE_APPOINTMENT)
        if response.status_code == 200:
            appointment = response.json()
            if all(key in appointment for key in ["id", "name", "email", "status"]):
                appointment_id = appointment["id"]
                results.log_pass("Appointment Creation")
                
                # Verify appointment data
                if (appointment["name"] == SAMPLE_APPOINTMENT["name"] and
                    appointment["email"] == SAMPLE_APPOINTMENT["email"] and
                    appointment["status"] == "pending"):
                    results.log_pass("Appointment Data Integrity")
                else:
                    results.log_fail("Appointment Data Integrity", "Data mismatch")
            else:
                results.log_fail("Appointment Creation", f"Missing required fields: {appointment}")
        else:
            results.log_fail("Appointment Creation", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Appointment Creation", f"Error: {str(e)}")
    
    # Test appointment creation with missing fields
    try:
        incomplete_appointment = {"name": "Test User", "email": "test@test.com"}
        response = requests.post(f"{API_BASE}/appointments", json=incomplete_appointment)
        if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
            results.log_pass("Appointment Validation - Missing fields")
        else:
            results.log_fail("Appointment Validation - Missing fields", f"Expected 400/422, got {response.status_code}")
    except Exception as e:
        results.log_fail("Appointment Validation - Missing fields", f"Error: {str(e)}")
    
    # Admin-only tests
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test getting all appointments
        try:
            response = requests.get(f"{API_BASE}/appointments", headers=headers)
            if response.status_code == 200:
                appointments = response.json()
                if isinstance(appointments, list):
                    results.log_pass("Get All Appointments")
                    
                    # Check if our created appointment is in the list
                    if appointment_id:
                        found = any(apt.get("id") == appointment_id for apt in appointments)
                        if found:
                            results.log_pass("Appointment Persistence")
                        else:
                            results.log_fail("Appointment Persistence", "Created appointment not found in list")
                else:
                    results.log_fail("Get All Appointments", f"Expected list, got: {type(appointments)}")
            else:
                results.log_fail("Get All Appointments", f"Status code: {response.status_code}")
        except Exception as e:
            results.log_fail("Get All Appointments", f"Error: {str(e)}")
        
        # Test appointment status update
        if appointment_id:
            try:
                update_data = {
                    "status": "confirmed",
                    "admin_notes": "Confirmed for next week",
                    "confirmed_date": "2024-01-15",
                    "confirmed_time": "10:00"
                }
                response = requests.put(f"{API_BASE}/appointments/{appointment_id}", 
                                      json=update_data, headers=headers)
                if response.status_code == 200:
                    updated_appointment = response.json()
                    if updated_appointment.get("status") == "confirmed":
                        results.log_pass("Appointment Status Update")
                    else:
                        results.log_fail("Appointment Status Update", f"Status not updated: {updated_appointment}")
                else:
                    results.log_fail("Appointment Status Update", f"Status code: {response.status_code}")
            except Exception as e:
                results.log_fail("Appointment Status Update", f"Error: {str(e)}")
        
        # Test unauthorized access (without token)
        try:
            response = requests.get(f"{API_BASE}/appointments")
            if response.status_code == 401:
                results.log_pass("Appointment Authorization - No token")
            else:
                results.log_fail("Appointment Authorization - No token", f"Expected 401, got {response.status_code}")
        except Exception as e:
            results.log_fail("Appointment Authorization - No token", f"Error: {str(e)}")
    
    return results

def main():
    """Run all backend tests"""
    print("🚀 Starting Summit IT Services Backend API Tests")
    print(f"Testing against: {API_BASE}")
    print("="*60)
    
    all_results = TestResults()
    
    # Test 1: API Root
    print("\n📍 Testing API Root...")
    root_results = test_api_root()
    all_results.passed += root_results.passed
    all_results.failed += root_results.failed
    all_results.errors.extend(root_results.errors)
    
    # Test 2: Services API
    print("\n🛠️ Testing Services API...")
    services_results = test_services_api()
    all_results.passed += services_results.passed
    all_results.failed += services_results.failed
    all_results.errors.extend(services_results.errors)
    
    # Test 3: Admin Authentication
    print("\n🔐 Testing Admin Authentication...")
    auth_results, admin_token = test_admin_authentication()
    all_results.passed += auth_results.passed
    all_results.failed += auth_results.failed
    all_results.errors.extend(auth_results.errors)
    
    # Test 4: Appointment Booking
    print("\n📅 Testing Appointment Booking...")
    booking_results = test_appointment_booking(admin_token)
    all_results.passed += booking_results.passed
    all_results.failed += booking_results.failed
    all_results.errors.extend(booking_results.errors)
    
    # Final summary
    success = all_results.summary()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
        return 0
    else:
        print(f"\n⚠️ {all_results.failed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())