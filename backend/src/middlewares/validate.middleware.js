import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors);
  }

  req.body = result.data;
  next();
};
