import requests
import sys
import json
from datetime import datetime

class PFAAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json().get('detail', 'No error detail')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_result(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@pfa.org", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"🔑 Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "wrong@email.com", "password": "wrongpass"}
        )

    def test_get_current_admin(self):
        """Test get current admin profile"""
        return self.run_test("Get Current Admin", "GET", "auth/me", 200)

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        return self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_incidents_crud(self):
        """Test incidents CRUD operations"""
        # Get incidents
        success, incidents = self.run_test("Get Incidents", "GET", "incidents", 200)
        
        # Create incident
        incident_data = {
            "type": "Animal Cruelty",
            "description": "Test incident for API testing",
            "location": "Test Location",
            "severity": "high",
            "reported_by": "Test Reporter"
        }
        
        success, created = self.run_test(
            "Create Incident", "POST", "incidents", 200, data=incident_data
        )
        
        if success and 'id' in created:
            incident_id = created['id']
            
            # Update incident status
            success, updated = self.run_test(
                "Update Incident Status",
                "PUT",
                f"incidents/{incident_id}?status=investigating",
                200
            )
            
            return success
        
        return False

    def test_activities_crud(self):
        """Test activities CRUD operations"""
        # Get activities
        success, activities = self.run_test("Get Activities", "GET", "activities", 200)
        
        # Create activity
        activity_data = {
            "type": "Feeding",
            "description": "Test activity for API testing",
            "location": "Test Location",
            "volunteer_id": "test-volunteer-123",
            "volunteer_name": "Test Volunteer"
        }
        
        success, created = self.run_test(
            "Create Activity", "POST", "activities", 200, data=activity_data
        )
        
        return success

    def test_missing_reports_crud(self):
        """Test missing reports CRUD operations"""
        # Get missing reports
        success, reports = self.run_test("Get Missing Reports", "GET", "missing", 200)
        
        # Create missing report
        report_data = {
            "animal_type": "Dog",
            "description": "Test missing report for API testing",
            "location": "Test Location",
            "contact": "test@example.com",
            "reported_by": "Test Reporter"
        }
        
        success, created = self.run_test(
            "Create Missing Report", "POST", "missing", 200, data=report_data
        )
        
        if success and 'id' in created:
            report_id = created['id']
            
            # Update report status
            success, updated = self.run_test(
                "Update Missing Report Status",
                "PUT",
                f"missing/{report_id}?status=found",
                200
            )
            
            return success
        
        return False

    def test_sos_alerts_crud(self):
        """Test SOS alerts CRUD operations"""
        # Get SOS alerts
        success, alerts = self.run_test("Get SOS Alerts", "GET", "sos", 200)
        
        # Create SOS alert
        alert_data = {
            "description": "Test SOS alert for API testing",
            "location": "Test Location",
            "urgency": "high",
            "reported_by": "Test Reporter"
        }
        
        success, created = self.run_test(
            "Create SOS Alert", "POST", "sos", 200, data=alert_data
        )
        
        if success and 'id' in created:
            alert_id = created['id']
            
            # Resolve SOS alert
            success, resolved = self.run_test(
                "Resolve SOS Alert",
                "PUT",
                f"sos/{alert_id}",
                200
            )
            
            return success
        
        return False

    def test_volunteers_crud(self):
        """Test volunteers CRUD operations"""
        # Get volunteers
        success, volunteers = self.run_test("Get Volunteers", "GET", "volunteers", 200)
        
        # Create volunteer (this endpoint doesn't require auth)
        volunteer_data = {
            "name": "Test Volunteer",
            "email": "test.volunteer@example.com",
            "phone": "+1234567890",
            "location": "Test Location"
        }
        
        # Test without auth first
        old_token = self.token
        self.token = None
        success, created = self.run_test(
            "Create Volunteer (No Auth)", "POST", "volunteers", 200, data=volunteer_data
        )
        self.token = old_token
        
        if success and 'id' in created:
            volunteer_id = created['id']
            
            # Update volunteer status
            success, updated = self.run_test(
                "Update Volunteer Status",
                "PUT",
                f"volunteers/{volunteer_id}",
                200,
                data={"status": "approved"}
            )
            
            if success:
                # Delete volunteer
                success, deleted = self.run_test(
                    "Delete Volunteer",
                    "DELETE",
                    f"volunteers/{volunteer_id}",
                    200
                )
                
                return success
        
        return False

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        old_token = self.token
        self.token = None
        
        # Test accessing protected endpoint without token
        success, _ = self.run_test(
            "Unauthorized Dashboard Access", "GET", "dashboard/stats", 403
        )
        
        self.token = old_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting PFA Admin API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication
        if not self.test_admin_login():
            print("❌ Login failed - stopping tests")
            return False
        
        self.test_invalid_login()
        self.test_get_current_admin()
        self.test_unauthorized_access()
        
        # Test dashboard
        self.test_dashboard_stats()
        
        # Test CRUD operations
        self.test_incidents_crud()
        self.test_activities_crud()
        self.test_missing_reports_crud()
        self.test_sos_alerts_crud()
        self.test_volunteers_crud()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = PFAAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())