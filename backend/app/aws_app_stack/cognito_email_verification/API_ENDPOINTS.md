# Authentication API Endpoints

This document describes the authentication endpoints for user registration and email verification.

## Endpoints Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/register` | POST | Register a new user (sends verification email) |
| `/api/v1/auth/register-and-confirm` | POST | Register and optionally confirm in one call |
| `/api/v1/auth/confirm-signup` | POST | Confirm user with verification code (API) |
| `/api/v1/auth/confirm-signup/{email}/{code}` | GET | Confirm user via email link (HTML response) |

---

## 1. Register User (Standard Flow)

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Registers a new user and sends a verification email with a 6-digit code.

### Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "subscription_plan": "no_plan"
}
```

### Response (Success - 200)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "cognito-user-sub-id",
  "email": "user@example.com",
  "name": "John Doe",
  "is_active": true,
  "subscription_plan": "no_plan",
  ...
}
```

### Response (Error - 422)

```json
{
  "detail": "Email already registered"
}
```

### Workflow

1. User submits registration form
2. Backend registers user in Cognito
3. Cognito sends verification email with code
4. User receives email with:
   - Verification link: `https://subtiter.ai/api/v1/auth/confirm-signup/{email}/{code}`
   - 6-digit code: `123456`
5. User clicks link or enters code separately

---

## 2. Register and Confirm (Combined Flow) ⭐ NEW

**Endpoint:** `POST /api/v1/auth/register-and-confirm`

**Description:** Registers a new user and optionally confirms immediately if verification code is provided.

### Use Cases

#### Use Case 1: Register Only (No Code)
Same as standard registration - user receives verification email.

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

#### Use Case 2: Register + Confirm (With Code)
Register and confirm in a single API call.

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "confirmation_code": "123456"
}
```

### Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "confirmation_code": "123456"  // Optional
}
```

### Response (Success - 200)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "cognito-user-sub-id",
  "email": "user@example.com",
  "name": "John Doe",
  "is_active": true,
  "subscription_plan": "no_plan",
  ...
}
```

### Response (Error - 400)

```json
{
  "detail": "Invalid or expired confirmation code. User registered but not confirmed."
}
```

### Workflow

**Without confirmation_code:**
1. User submits registration
2. Backend registers user in Cognito
3. Cognito sends verification email
4. User must confirm separately

**With confirmation_code:**
1. User receives verification email (from previous attempt or another source)
2. User submits registration with code
3. Backend registers user in Cognito
4. Backend immediately confirms user
5. User is fully registered and confirmed ✅

### Benefits

- **Fewer API calls:** Register and confirm in one request
- **Better UX:** Faster onboarding
- **Flexible:** Works with or without confirmation code
- **Error handling:** Clear error messages if code is invalid

---

## 3. Confirm Signup (API)

**Endpoint:** `POST /api/v1/auth/confirm-signup`

**Description:** Confirms user signup with verification code (JSON API).

### Request Body

```json
{
  "email": "user@example.com",
  "confirmation_code": "123456"
}
```

### Response (Success - 200)

```json
{
  "message": "User confirmed successfully. You can now login."
}
```

### Response (Error - 400)

```json
{
  "detail": "Invalid or expired confirmation code"
}
```

---

## 4. Confirm Signup (Email Link)

**Endpoint:** `GET /api/v1/auth/confirm-signup/{email}/{confirmation_code}`

**Description:** Confirms user signup via email link (HTML response).

### Example URL

```
https://subtiter.ai/api/v1/auth/confirm-signup/user@example.com/123456
```

### Response (Success)

Returns HTML page with:
- ✅ Success icon
- "Email Confirmed Successfully!" message
- "Go to Login" button → redirects to `https://subtiter.ai/login`

### Response (Error)

Returns HTML page with:
- ❌ Error icon
- Error message
- "Go to Home" button

### Workflow

1. User receives verification email
2. User clicks verification link
3. Browser opens confirmation page
4. Backend confirms user in Cognito
5. User sees success page
6. User clicks "Go to Login"

---

## Complete User Registration Flows

### Flow 1: Standard Two-Step Registration

```
1. POST /api/v1/auth/register
   └─> User receives verification email

2. User clicks link in email
   └─> GET /api/v1/auth/confirm-signup/{email}/{code}
   └─> User confirmed ✅

3. User logs in
   └─> POST /api/v1/auth/login
```

### Flow 2: API-Based Confirmation

```
1. POST /api/v1/auth/register
   └─> User receives verification email

2. User enters code in app
   └─> POST /api/v1/auth/confirm-signup
   └─> User confirmed ✅

3. User logs in
   └─> POST /api/v1/auth/login
```

### Flow 3: Combined Registration + Confirmation ⭐ NEW

```
1. POST /api/v1/auth/register-and-confirm
   {
     "email": "user@example.com",
     "name": "John Doe",
     "password": "SecurePass123!",
     "confirmation_code": "123456"
   }
   └─> User registered AND confirmed ✅

2. User logs in immediately
   └─> POST /api/v1/auth/login
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Invalid or expired confirmation code |
| 422 | Email already registered |
| 500 | Server error (Cognito failure, etc.) |

---

## Password Requirements

Passwords must meet AWS Cognito requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Code Expiration

Verification codes expire after **24 hours**.

---

## Testing

### Test Registration

```bash
curl -X POST https://subtiter.ai/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "subscription_plan": "no_plan"
  }'
```

### Test Register and Confirm

```bash
curl -X POST https://subtiter.ai/api/v1/auth/register-and-confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "confirmation_code": "123456"
  }'
```

### Test Confirmation

```bash
curl -X POST https://subtiter.ai/api/v1/auth/confirm-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "confirmation_code": "123456"
  }'
```

---

## Related Files

- **Endpoints:** `app/api/v1/endpoints/auth.py`
- **Schemas:** `app/schemas/schema_user.py`
- **Cognito Client:** `app/aws_app_stack/subtiter_cognito.py`
- **Email Template:** `app/aws_app_stack/cognito_email_verification/user_verification_template/email_template.html`

---

## Last Updated

November 2, 2025

