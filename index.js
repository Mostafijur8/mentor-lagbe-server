import "dotenv/config";
import express from "express";
import cors from "cors";
import { createDatabaseClient } from "./src/config/database.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

// Applies CORS before routes and accepts JSON for normal API requests.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", credentials: true }));

if (!mongoUri) {
  console.error("MONGODB_URI is missing. Add it to your .env file.");
  process.exit(1);
}

const client = createDatabaseClient(mongoUri);

async function startServer() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "mentorLagbe");
    app.locals.db = db;
    app.locals.collections = {
      users: db.collection("users"),
      tuitions: db.collection("tuitions"),
      applications: db.collection("applications"),
      payments: db.collection("payments"),
    };

    const { default: apiRouter } = await import("./src/routes/api.js");
    app.use("/api", express.json({ limit: "2mb" }), apiRouter);

    // Handles unknown API paths without falling through to a Next.js route.
    app.use("/api", (_req, res) => res.status(404).json({ message: "API route not found." }));
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});

startServer();
