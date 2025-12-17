import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";
import { requireAuth } from "../middlewares/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "mesero"])
});

authRouter.post("/register", async (req, res) => {
  console.log("[auth][POST /register] body", req.body);

  const parsed = registerSchema.safeParse(req.body);
  console.log("[auth][POST /register] parsed", parsed.success);

  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, role } = parsed.data;

  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  console.log("[auth][POST /register] createUser", { userId: created.data.user?.id, err: created.error?.message });

  if (created.error || !created.data.user) return res.status(500).json({ error: created.error?.message || "createUser failed" });

  const userId = created.data.user.id;

  const ins = await supabaseAdmin.from("profiles").insert({
    id: userId,
    email,
    role
  });

  console.log("[auth][POST /register] profile insert", { err: ins.error?.message });

  if (ins.error) {
    console.log("[auth][POST /register] rollback attempt user delete", { userId });
    const del = await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log("[auth][POST /register] rollback deleteUser", { err: del.error?.message });
    return res.status(500).json({ error: ins.error.message });
  }

  res.status(201).json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  console.log("[auth][GET /me] user", req.user);
  res.json({ data: req.user });
});
