# Habits API (Express + TypeScript)

Simple REST API for user authentication and habit tracking.

## Base URL

- Deployed: `https://habitsapi-ttx5.onrender.com`
- API prefix: `/api`
- Example full endpoint: `https://habitsapi-ttx5.onrender.com/api/auth/login`

For local development, change the base URL (for example `http://localhost:3000`).

## Prerequisites

- Node.js `>=24.3.0`
- PostgreSQL database

## Setup

```bash
npm install
```

1. Create your environment file (or export env vars in your shell).
2. Set the variables listed below.
3. Prepare database schema:

```bash
npm run db:push
# or: npm run db:migrate
```

Optional sample data:

```bash
npm run db:seed
```

## Environment Variables

Configured from `env.ts`.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | - | Must start with `postgresql://` |
| `JWT_SECRET` | Yes | - | Minimum 32 characters |
| `EMAIL_USER` | Yes | - | SMTP sender username |
| `EMAIL_PASSWORD` | Yes | - | SMTP sender password |
| `PORT` | No | `3000` | Server port |
| `APP_STAGE` | No | `dev` | `dev`, `test`, or `production` |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration string |
| `BCRYPT_ROUNDS` | No | `12` | Min 10, max 20 |

## Run

```bash
npm run dev      # watch mode
npm start        # start server
npm test         # run tests
npm run test:watch
npm run test:coverage
```

## Authentication

JWT bearer token auth is required for `/api/habits/*` and `/api/users/*` routes.

Header format:

```http
Authorization: ******
```

Auth flow from code:
1. Register with `/api/auth/register`.
2. Verify email using `/api/auth/verify?token=...`.
3. Login with `/api/auth/login` to get a JWT.
4. Send JWT in `Authorization` header for protected routes.

## Endpoint Reference

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check (`{ "message": "hello" }`) |

### Auth Endpoints

| Method | Path | Auth | Input |
|---|---|---|---|
| POST | `/api/auth/register` | No | Body: `username`, `email`, `password`, optional `firstName`, `lastName` |
| POST | `/api/auth/login` | No | Body: `email`, `password` |
| GET | `/api/auth/verify` | No | Query: `token` |

Representative responses:

- `POST /api/auth/register` success `201`:
```json
{
  "message": "Account created. Please check your email to verify.",
  "requiresVerification": true,
  "details": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "jane",
    "firstName": "Jane",
    "lastName": "Doe",
    "createdAt": "...",
    "emailVerified": false
  },
  "token": "<jwt>"
}
```
- `POST /api/auth/login` success `200`:
```json
{
  "message": "Login successful",
  "details": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "jane",
    "firstName": "Jane",
    "lastName": "Doe"
  },
  "token": "<jwt>"
}
```
- `GET /api/auth/verify?token=...` success `200`:
```json
{ "message": "Email verified successfully" }
```
- Common auth errors:
  - `400` validation failure
  - `401` unauthorized (invalid credentials / missing token)
  - `403` forbidden (email not verified, invalid/expired token)
  - `409` conflict (duplicate email or username)

### Habit Endpoints (CRUD)

All require a JWT in the `Authorization` header.

| Method | Path | Input | Success |
|---|---|---|---|
| GET | `/api/habits` | None | `200` with `{ habits: [...] }` |
| GET | `/api/habits/:id` | Path `id` | `200` with `{ habit: {...} }` |
| POST | `/api/habits` | Body: `name`, `frequency`, optional `description`, `targetCount`, `tagIds` (`uuid[]`) | `201` with created habit |
| PATCH | `/api/habits/:id` | Body: partial habit fields, optional `tagIds` | `200` with updated habit |
| DELETE | `/api/habits/:id` | Path `id` | `200` with delete message |

Representative responses:

```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "uuid",
    "userId": "uuid",
    "name": "Read",
    "description": "20 minutes",
    "frequency": "daily",
    "targetCount": 1,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Read",
      "frequency": "daily",
      "tags": [
        { "id": "uuid", "name": "Health", "color": "#10B981" }
      ]
    }
  ]
}
```

```json
{ "error": "Habit not found" }
```

## cURL Quickstart (Main Flows)

```bash
BASE_URL="https://habitsapi-ttx5.onrender.com"
```

### 1) Register

```bash
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"jane",
    "email":"jane@example.com",
    "password":"SuperSecurePassword123!",
    "firstName":"Jane",
    "lastName":"Doe"
  }'
```

### 2) Verify email

```bash
curl "$BASE_URL/api/auth/verify?token=YOUR_EMAIL_VERIFICATION_TOKEN"
```

### 3) Login (get JWT)

```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"SuperSecurePassword123!"}'
```

### 4) Create habit

```bash
TOKEN="YOUR_JWT"
curl -X POST "$BASE_URL/api/habits" \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Read",
    "description":"Read 20 minutes",
    "frequency":"daily",
    "targetCount":1
  }'
```

### 5) List habits

```bash
curl -H "Authorization: ******" "$BASE_URL/api/habits"
```

### 6) Get one habit

```bash
HABIT_ID="YOUR_HABIT_ID"
curl -H "Authorization: ******" "$BASE_URL/api/habits/$HABIT_ID"
```

### 7) Update one habit

```bash
curl -X PATCH "$BASE_URL/api/habits/$HABIT_ID" \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{"description":"Read 30 minutes"}'
```

### 8) Delete one habit

```bash
curl -X DELETE "$BASE_URL/api/habits/$HABIT_ID" \
  -H "Authorization: ******"
```

## Common Error Shapes

Validation middleware:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "invalid email" }
  ]
}
```

Auth middleware:

```json
{ "error": "Access token required" }
```

```json
{ "error": "Invalid or expired token" }
```
