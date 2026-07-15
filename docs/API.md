# FinPilot AI — Complete API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user (+ verification email) |
| POST | `/auth/login` | Login (HttpOnly cookies). Body may include `totpCode` if 2FA enabled. Returns `{ requiresTwoFactor: true }` when code needed. |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password `{ token, password }` |
| GET | `/auth/me` | Get current user |
| PATCH | `/auth/me` | Update name `{ name }` |
| POST | `/auth/send-verification` | Resend email verification (auth) |
| POST | `/auth/verify-email` | Verify email `{ token }` |
| POST | `/auth/change-password` | Change password `{ currentPassword, newPassword }` |
| POST | `/auth/2fa/setup` | Generate TOTP secret + QR |
| POST | `/auth/2fa/enable` | Enable 2FA `{ totpCode }` |
| POST | `/auth/2fa/disable` | Disable 2FA `{ totpCode }` |

## Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List profiles (paginated) |
| POST | `/profiles` | Create profile |
| GET | `/profiles/:id` | Get profile |
| PUT | `/profiles/:id` | Update profile |
| PATCH | `/profiles/:id/primary` | Set primary profile |
| DELETE | `/profiles/:id` | Soft delete profile |

## Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incomes` | List incomes |
| POST | `/incomes` | Create income |
| GET | `/incomes/analytics` | Income analytics |
| GET | `/incomes/:id` | Get by id |
| PUT | `/incomes/:id` | Update |
| DELETE | `/incomes/:id` | Delete |

## Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/categories` | Get categories |
| GET | `/expenses/analytics` | Expense analytics |
| GET | `/expenses/:id` | Get by id |
| PUT | `/expenses/:id` | Update |
| DELETE | `/expenses/:id` | Delete |

## Investments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/investments` | List investments |
| POST | `/investments` | Create investment |
| GET | `/investments/summary` | ROI summary |
| GET | `/investments/:id` | Get by id |
| PUT | `/investments/:id` | Update |
| DELETE | `/investments/:id` | Delete |

## Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | List goals |
| POST | `/goals` | Create goal |
| GET | `/goals/:id` | Get by id |
| PUT | `/goals/:id` | Update |
| DELETE | `/goals/:id` | Delete |

## Debts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/debts` | List debts |
| POST | `/debts` | Create debt |
| GET | `/debts/summary` | Outstanding + EMI totals |
| GET | `/debts/:id` | Get by id |
| PUT | `/debts/:id` | Update |
| DELETE | `/debts/:id` | Delete |

## Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets` | List budgets with spent / percentUsed |
| POST | `/budgets` | Create budget |
| GET | `/budgets/check-alerts` | Emit notifications if thresholds crossed |
| PUT | `/budgets/:id` | Update |
| DELETE | `/budgets/:id` | Delete |

## Recurring expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recurring-expenses` | List recurring expenses |
| POST | `/recurring-expenses` | Create |
| PUT | `/recurring-expenses/:id` | Update |
| DELETE | `/recurring-expenses/:id` | Delete |

Daily cron (06:00) posts due items into `/expenses` and notifies the user.

## Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List (+ `unreadCount`) |
| PATCH | `/notifications/read-all` | Mark all read |
| PATCH | `/notifications/:id/read` | Mark one read |
| DELETE | `/notifications/:id` | Delete |

## Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/overview` | Main dashboard (includes totalDebt / monthlyEmi) |
| GET | `/dashboard/family` | Family combined view with member comparison charts |

## Payslips
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payslips/upload` | Upload (multipart: file, profileId) |
| GET | `/payslips` | List payslips |
| GET | `/payslips/:id` | Get by id |
| POST | `/payslips/:id/re-extract` | Re-run Gemini extraction |
| PATCH | `/payslips/:id/confirm` | Confirm/correct; optional sync to Income |
| DELETE | `/payslips/:id` | Delete |

## Financial Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/financial-health/latest` | Get latest score |
| POST | `/financial-health/calculate` | Recalculate (real debt EMI ratio + liquid emergency fund) |
| GET | `/financial-health/history` | Score history |

## AI Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coach` | List conversations |
| POST | `/coach` | Create empty conversation |
| POST | `/coach/message` | Send message `{ message, conversationId? }` |
| GET | `/coach/:id` | Get conversation |
| DELETE | `/coach/:id` | Delete conversation |

## Scenarios
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scenarios/simulate` | Run simulation |
| GET | `/scenarios` | List past scenarios |
| GET | `/scenarios/:id` | Get scenario |
| DELETE | `/scenarios/:id` | Delete |

## Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights/monthly?month=&year=` | Get monthly insight |
| POST | `/insights/generate` | Generate insight (+ notification) |
| GET | `/insights` | List all insights |

Scheduled job: 1st of each month at 02:00 generates insights for all active users.

## Export / Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/incomes` | Download incomes CSV |
| GET | `/export/expenses` | Download expenses CSV |
| POST | `/export/expenses/import` | Import expenses (multipart `file` + `profileId`) |
