# MentorLagbe Server

MentorLagbe is a role-based tuition and mentorship API built with Node.js, Express, MongoDB, JWT, Stripe, and ImgBB.

## Features

- Student, tutor, and admin JWT authentication
- Server-side tuition search, filtering, pagination, and public details
- Tutor tuition CRUD and free/pro posting limits
- Duplicate-safe student applications and tutor applicant decisions
- Role-based dashboards and admin moderation
- Stripe Pro checkout with database synchronization
- Direct ImgBB image uploads
- Student bookmarks and demo data seeding

## Environment

Copy `.env.example` to `.env` and configure:

- `MONGODB_URI`
- `DB_NAME`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `IMGBB_API_KEY`
- `SEED_SECRET` (optional)

## Run

```powershell
npm install
npm run dev
npm run seed
```

The API listens on `http://localhost:5000` by default.

## Database collections

The application uses exactly four MongoDB collections: `users`, `tuitions`, `applications`, and `payments`.
