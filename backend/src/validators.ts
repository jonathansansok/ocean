import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const createOrderSchema = z.object({
  status: z.enum(["saved", "closed"]).default("saved"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
});

export const setOrderStatusSchema = z.object({
  status: z.enum(["saved", "closed"]),
});

export const assignOrderSchema = z.object({
  assignedTo: z.string().uuid(),
});
