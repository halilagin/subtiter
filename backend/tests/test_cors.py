import requests

def test_cors_headers():
    """Test that the server is properly configured for CORS for all traffic."""
    # Replace with your actual server URL
    base_url = "http://localhost:8000"  # Adjust as needed

    headers = {
        "Origin": "http://example.com",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type"
    }
    # Make an OPTIONS request to simulate a CORS preflight request
    response = requests.options(f"{base_url}/api/v1/auth/login", headers=headers)

    # Check if CORS headers are present
    assert "Access-Control-Allow-Origin" in response.headers

    # Check if the server allows all origins (or at least our test origin)
    assert response.headers["Access-Control-Allow-Origin"] == "*" or \
           response.headers["Access-Control-Allow-Origin"] == "http://example.com"

    # Check if other important CORS headers are present
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers

    # Make a regular GET request to check CORS headers on normal responses
    response = requests.post(f"{base_url}/api/v1/auth/login",
                             json={"email": "admin@example.com", "password": "admin123"},
                             headers={"Origin": "http://example.com"}
                             )

    # Verify CORS headers are also present on regular responses
    assert "Access-Control-Allow-Origin" in response.headers

    print(response.headers)