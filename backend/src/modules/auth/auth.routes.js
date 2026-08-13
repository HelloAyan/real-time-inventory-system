import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import { signupHandler, loginHandler } from "./auth.controller.js";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);
router.post("/login", validate(loginSchema), loginHandler);

export default router;
