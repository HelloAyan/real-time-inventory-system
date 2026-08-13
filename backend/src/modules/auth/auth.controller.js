import { asyncHandler } from "../../utils/asyncHandler.js";
import * as authService from "./auth.service.js";

export const signupHandler = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  res.status(201).json({ success: true, ...result });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, ...result });
});
