import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive()
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      qty: z.number().int().positive()
    })
  ).min(1)
});
