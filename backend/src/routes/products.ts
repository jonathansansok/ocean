import { Router } from "express";
import { supabaseAdmin } from "../supabase.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { createProductSchema } from "../validators.js";

export const productsRouter = Router();

productsRouter.get("/", requireAuth, async (req, res) => {
  console.log("[products][GET] user", req.user);

  const q = await supabaseAdmin
    .from("products")
    .select("id,name,price,created_at")
    .order("id", { ascending: false });

  console.log("[products][GET] db", { error: q.error?.message, count: q.data?.length });

  if (q.error) return res.status(500).json({ error: q.error.message });
  res.json({ data: q.data });
});

productsRouter.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  console.log("[products][POST] body", req.body, "user", req.user);

  const parsed = createProductSchema.safeParse(req.body);
  console.log("[products][POST] parsed", parsed.success);

  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ins = await supabaseAdmin
    .from("products")
    .insert({ name: parsed.data.name, price: parsed.data.price })
    .select("id,name,price,created_at")
    .single();

  console.log("[products][POST] db", { error: ins.error?.message, data: ins.data });

  if (ins.error) return res.status(500).json({ error: ins.error.message });
  res.status(201).json({ data: ins.data });
});
