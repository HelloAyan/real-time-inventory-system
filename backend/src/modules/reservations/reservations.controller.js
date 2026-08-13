import { asyncHandler } from "../../utils/asyncHandler.js";
import * as reservationsService from "./reservations.service.js";

export const reserveHandler = asyncHandler(async (req, res) => {
  const reservation = await reservationsService.createReservation(req.body.dropId, req.user.id);
  res.status(201).json({ success: true, reservation });
});

export const purchaseHandler = asyncHandler(async (req, res) => {
  const purchase = await reservationsService.completePurchase(req.params.id, req.user.id);
  res.status(201).json({ success: true, purchase });
});
