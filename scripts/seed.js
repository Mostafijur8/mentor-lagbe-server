import "dotenv/config";

const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;

// Sends a seed request to the running API and prints the result.
const response = await fetch(`${apiUrl}/seed`, {
  method: "POST",
  headers: process.env.SEED_SECRET ? { "x-seed-secret": process.env.SEED_SECRET } : {},
});

const payload = await response.json().catch(() => ({ message: "The seed response was not JSON." }));
console.log(payload.message || payload);
if (!response.ok) process.exit(1);
