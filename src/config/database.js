import { MongoClient } from "mongodb";

// Opens the single MongoDB client shared by every route.
export function createDatabaseClient(uri) {
  return new MongoClient(uri);
}
