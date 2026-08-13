import { z } from "zod";

export const reserveSchema = z.object({
  dropId: z.string().uuid("Invalid drop id"),
});
