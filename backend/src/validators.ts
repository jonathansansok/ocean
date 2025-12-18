import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const createOrderSchema = z.object({
  status: z.enum(["saved", "closed"]).optional(),
  assignedTo: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
});