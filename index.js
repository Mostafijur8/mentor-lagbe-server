import "dotenv/config";
import express from "express";
import cors from "cors";
import { createDatabaseClient } from "./src/config/database.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import apiRouter from "./src/routes/api.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(requestLogger);

// Applies CORS before routes and accepts JSON for normal API requests.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api", apiRouter);

// Handles unknown API paths without falling through to a Next.js route.
app.use("/api", (_req, res) => res.status(404).json({ message: "API route not found." }));
app.use(errorHandler);

let client;
let readyPromise;

// Connects once and reuses the same client for local and serverless requests.
async function initialize() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) throw new Error("MONGODB_URI is missing. Add it to your environment.");

      client = createDatabaseClient(mongoUri);
      await client.connect();
      const db = client.db(process.env.DB_NAME || "mentorLagbe");
      app.locals.db = db;
      app.locals.collections = {
        users: db.collection("users"),
        tuitions: db.collection("tuitions"),
        applications: db.collection("applications"),
        payments: db.collection("payments"),
      };
      await Promise.all([
        app.locals.collections.users.createIndex({ email: 1 }, { unique: true }),
        app.locals.collections.tuitions.createIndex({
          approvalStatus: 1,
          isActive: 1,
          createdAt: -1,
        }),
        app.locals.collections.applications.createIndex(
          { tuitionId: 1, studentEmail: 1 },
          { unique: true },
        ),
        app.locals.collections.payments.createIndex({ stripeSessionId: 1 }, { unique: true }),
      ]);
      console.log("Connected to MongoDB.");
      return app;
    })();
  }
  return readyPromise;
}

export { app, initialize };

// Vercel calls this handler for every request routed to the function.
export default async function handler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error("Could not initialize the API:", error.message);
    return res.status(503).json({ message: "The service is temporarily unavailable." });
  }
}

// Local development and traditional hosting keep the long-running server.
if (process.env.VERCEL !== "1") {
  initialize()
    .then(() => {
      app.listen(port, () => console.log(`Server listening on port ${port}`));
    })
    .catch(async (error) => {
      console.error("Could not connect to MongoDB:", error.message);
      await client?.close().catch(() => {});
      process.exit(1);
    });
}

process.on("SIGINT", async () => {
  await client?.close().catch(() => {});
  process.exit(0);
});
