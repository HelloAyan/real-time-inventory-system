import { asyncHandler } from "../../utils/asyncHandler.js";
import * as dropsService from "./drops.service.js";

export const createDropHandler = asyncHandler(async (req, res) => {
  const drop = await dropsService.createDrop(req.body);
  res.status(201).json({ success: true, drop });
});

export const listDropsHandler = asyncHandler(async (req, res) => {
  const drops = await dropsService.listDrops();
  res.status(200).json({ success: true, drops });
});
