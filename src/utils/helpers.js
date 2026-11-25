import { ObjectId } from "mongodb";

// Converts a public route id into MongoDB's ObjectId format safely.
export function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Returns a plain JSON-safe copy of a MongoDB document.
export function serializeDocument(document) {
  if (!document) return document;
  return { ...document, _id: document._id?.toString() };
}
