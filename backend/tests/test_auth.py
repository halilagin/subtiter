
# from fastapi.testclient import TestClient
# from app.main import app




def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@example.com", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "john_doe", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_register_success(client, auth_headers):
    new_user = {
        "username": "new_user",
        "email": "new_user@example.com",
        "password": "newpassword123",
        "subscription_plan": "VOLUME_BASED_PAYMENT"
    }
    response = client.post("/api/v1/auth/register", json=new_user)
    assert response.status_code == 200
    # assert response.json()["username"] == new_user["username"]
    assert response.json()["email"] == new_user["email"]
    assert "hashed_password" not in response.json()

    response = client.post("/api/v1/users/delete", json={"email": new_user["email"]})
    assert response.status_code == 200


def test_register_duplicate_email(client):
    duplicate_user = {
        "username": "john_doe",  # Existing username from seed data
        "email": "another@example.com",
        "password": "password123",
        "subscription_plan": "VOLUME_BASED_PAYMENT"
    }
    response = client.post("/api/v1/auth/register", json=duplicate_user)
    assert response.status_code == 200
    response = client.post("/api/v1/auth/register", json=duplicate_user)
    assert response.status_code == 422



def test_logout(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"

def test_me_endpoint_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_me_endpoint_authorized(client):
    # First login to get the token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@example.com", "password": "admin123"}
    )
    token = login_response.json()["access_token"]
    # Test /me endpoint with token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == "admin"
    assert response.json()["email"] == "admin@example.com"
