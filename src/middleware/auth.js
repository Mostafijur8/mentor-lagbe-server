import jwt from "jsonwebtoken";
import { toObjectId } from "../utils/helpers.js";

// Verifies the Bearer JWT and refreshes role/plan from the database so
// admin role changes and Pro upgrades apply immediately, without a re-login.
export async function verifyToken(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "The authentication token is invalid or expired." });
  }

  try {
    const id = toObjectId(payload.sub);
    if (!id) return res.status(401).json({ message: "Invalid account." });

    const user = await req.app.locals.collections.users.findOne({ _id: id });
    if (!user) return res.status(401).json({ message: "This account no longer exists." });

    // The token proves identity; the users collection remains the source of truth.
    req.user = {
      ...payload,
      sub: id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan || "free",
    };
    req.account = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

// Creates a role guard used by student, tutor, and admin protected routes.
export function verifyRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    return next();
  };
}

export const verifyStudent = verifyRole("student");
export const verifyTutor = verifyRole("tutor");
export const verifyAdmin = verifyRole("admin");
