# FinPilot AI Backend

AI-powered personal and family financial planning platform — REST API.

## Tech Stack

- Node.js + Express (JavaScript)
- MongoDB Atlas + Mongoose
- JWT (Access + Refresh) with HttpOnly cookies
- Winston logging, Helmet, rate limiting, input validation
- Gemini AI, Cloudinary, Nodemailer, node-cron, TOTP 2FA

## Architecture

```
Controller → Service → Repository → MongoDB
```

## Implemented Features

- Authentication (JWT + HttpOnly cookies, email verification, password change, TOTP 2FA)
- Multi-profile management
- Income, Expense, Investment, Goal, Debt CRUD + analytics
- Budgets with spend tracking and alert notifications
- Recurring expenses (daily cron)
- Family dashboard with member comparisons
- Payslip upload (Cloudinary + Gemini extraction)
- Financial health score (real debt EMI ratio + liquid emergency fund)
- AI financial coach (Gemini + user data context)
- Scenario simulator
- Monthly insights (Gemini) + scheduled job (1st of month)
- Notifications, CSV export/import

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

API base: `http://localhost:5000/api/v1`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with nodemon |
| `npm start` | Production server |
| `npm test` | Jest unit + integration tests |

## Documentation

- [API Reference](./docs/API.md)
- [Testing Guide](./docs/TESTING.md)

## Deployment (Render)

See the full guide: [DEPLOY.md](../DEPLOY.md)

- Start command: `npm start`
- Health check: `/health`
- Blueprint: `render.yaml`
- Production requires `CLIENT_URL`, `COOKIE_SECURE=true`, JWT secrets (≥32 chars), MongoDB, and SMTP for auth emails.
