import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { reserveSchema } from "./reservations.validation.js";
import { reserveHandler, purchaseHandler } from "./reservations.controller.js";

const router = Router();

router.post("/", protect, validate(reserveSchema), reserveHandler);
router.post("/:id/purchase", protect, purchaseHandler);

export default router;
