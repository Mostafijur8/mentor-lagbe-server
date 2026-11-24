# Mentor Lagbe API

Express and MongoDB API for mentor profiles, bookings, and reviews.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string.
3. Run `npm run dev` for development or `npm start` to start the server.

The API listens on port `5000` by default. Set `PORT`, `DB_NAME`, or `CLIENT_ORIGIN` in `.env` to change the defaults.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server and database status |
| GET | `/api/mentors` | List mentors; supports `search`, `subject`, `location`, `minRate`, `maxRate`, and `limit` query parameters |
| GET | `/api/mentors/:id` | Get one mentor |
| POST | `/api/mentors` | Create a mentor (`name`, `email`, `subject`, `hourlyRate`; optional `location`, `bio`) |
| PATCH | `/api/mentors/:id` | Update mentor fields |
| DELETE | `/api/mentors/:id` | Delete a mentor |
| POST | `/api/bookings` | Create a booking (`mentorId`, `studentName`, `studentEmail`, `sessionDate`) |
| GET | `/api/bookings` | List bookings; optional `studentEmail`, `mentorId`, `status`, and `limit` filters |
| PATCH | `/api/bookings/:id/status` | Set status to `pending`, `confirmed`, `completed`, or `cancelled` |
| POST | `/api/reviews` | Create a review (`mentorId`, `studentName`, `rating` from 1 to 5; optional `comment`) |
| GET | `/api/mentors/:id/reviews` | List reviews for a mentor |

All request and response bodies use JSON. IDs are MongoDB ObjectIds.
