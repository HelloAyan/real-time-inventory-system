import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, name: payload.name };
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
};
