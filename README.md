# MentorLagbe — API Server

MentorLagbe is a role-based tuition and mentorship API built with Node.js, Express, MongoDB, Better Auth, JWT, Stripe, and ImgBB.

**Live API:** [mentor-lagbe-server-seven.vercel.app/api](https://mentor-lagbe-server-seven.vercel.app/api)  
**Live app:** [mentor-lagbe-client-rose.vercel.app](https://mentor-lagbe-client-rose.vercel.app)

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.com` | `Admin12345!` |
| Tutor (Pro) | `rahim.tutor@example.com` | `Password123!` |
| Student | `ayesha.student@example.com` | `Password123!` |

`npm run seed` creates 1 admin, 6 tutors, 8 students, 12 approved tuitions, 12 applications, reviews, and 3 payments. The admin account is created in both Better Auth and the Express `users` collection.

## Features

- Better Auth email/password sessions bridged to Express JWTs by the frontend.
- Database-backed role middleware (`student`, `tutor`, `admin`) that reflects role changes immediately.
- Server-side tuition search, subject/class/mode facets, pagination, and public details.
- Tutor tuition CRUD, ownership checks, and free/pro posting limits.
- Duplicate-safe student applications, cancellation, and tutor applicant decisions.
- Role-specific dashboard statistics and admin moderation.
- Stripe Checkout with server-side session verification and ownership checks.
- Direct ImgBB image uploads.
- Student bookmarks with a Free-plan limit of 5.
- Idempotent demo seeding that also repairs legacy Better Auth ids.

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (default `mentorLagbe`) |
| `PORT` | Local port (default `5000`) |
| `JWT_SECRET` | Signs API tokens; must match the client deployment |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_ORIGIN` | Comma-separated allowed browser origins |
| `STRIPE_SECRET_KEY` | Stripe secret key for Checkout |
| `IMGBB_API_KEY` | ImgBB upload key |
| `SEED_SECRET` | Required `x-seed-secret` header for `POST /api/seed` |

## Run

```powershell
npm install
npm run dev
npm run seed
```

The API listens on `http://localhost:5000` by default.

## Database collections

Domain data uses four collections:

- `users`
- `tuitions`
- `applications`
- `payments`

Better Auth stores its own authentication tables (`user`, `session`, `account`, `verification`) in the same database. The Express `users` collection is authoritative for role, plan, and bookmarks.

## Main API routes

| Area | Routes |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/me` |
| Profile and upload | `PATCH /api/users/profile`, `POST /api/upload/image` |
| Tuitions | `GET /api/tuitions`, `GET /api/tuitions/:id`, `POST/PATCH/DELETE /api/tuitions` |
| Applications | `POST/DELETE /api/applications`, `PATCH /api/applications/:id/status` |
| Bookmarks | `POST /api/bookmarks/:tuitionId`, `GET /api/student/bookmarks` |
| Payments | `POST /api/payments/checkout`, `POST /api/payments/verify` |
| Administration | `/api/admin/users`, `/api/admin/tuitions`, `/api/admin/payments` |
| Seeding | `POST /api/seed` with `x-seed-secret` |

## Deployment

The repository includes `api/index.js` and `vercel.json` for Vercel's Node runtime. Set the environment variables above in the Vercel project, then deploy. `CLIENT_ORIGIN` must include every frontend origin that calls the API.
