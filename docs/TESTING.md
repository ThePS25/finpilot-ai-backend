# FinPilot AI Backend - Testing Instructions

## Prerequisites

1. Node.js 18+
2. MongoDB Atlas cluster (or local MongoDB)
3. Copy `.env.example` to `.env` and fill in values

## Setup

```bash
cd finpilot-ai-backend
npm install
npm run dev
```

Server starts at `http://localhost:5000`

## Manual Testing with cURL / Postman

### 1. Health Check

```bash
curl http://localhost:5000/health
```

### 2. Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Pratyush\",\"email\":\"test@finpilot.ai\",\"password\":\"TestPass1\"}"
```

### 3. Login (save cookies)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"test@finpilot.ai\",\"password\":\"TestPass1\"}"
```

### 4. Get Current User

```bash
curl http://localhost:5000/api/v1/auth/me -b cookies.txt
```

### 5. Create Profile

```bash
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"name\":\"Father\",\"relation\":\"Father\",\"occupation\":\"Retired\",\"dateOfBirth\":\"1965-01-15\"}"
```

### 6. List Profiles

```bash
curl http://localhost:5000/api/v1/profiles -b cookies.txt
```

### 7. Refresh Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh -b cookies.txt -c cookies.txt
```

### 8. Logout

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout -b cookies.txt
```

### 9. Forgot Password

```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@finpilot.ai\"}"
```

Check server logs for reset link if SMTP is not configured.

## Postman Collection Tips

- Enable "Automatically follow redirects"
- Enable cookie jar for session persistence
- Set `CLIENT_URL` in `.env` to match your frontend origin for CORS

## Expected Validation Errors

- Password without uppercase/lowercase/number → 422
- Duplicate email on register → 409
- Invalid/expired refresh token → 401
- Delete only profile → 400

## Logs

Check `logs/combined.log` and `logs/error.log` for request and error logs.
