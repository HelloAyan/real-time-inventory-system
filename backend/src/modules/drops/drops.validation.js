import { z } from "zod";

export const createDropSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  totalStock: z.coerce.number().int().positive("Total stock must be greater than 0"),
  startsAt: z.coerce.date().optional(),
});
