import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { createDropSchema } from "./drops.validation.js";
import { createDropHandler, listDropsHandler } from "./drops.controller.js";

const router = Router();

router.post("/", validate(createDropSchema), createDropHandler);
router.get("/", listDropsHandler);

export default router;
