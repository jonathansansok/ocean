//app\backend\src\routes\profiles.ts
import { Router } from "express";
import { supabaseAdmin } from "../supabase.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, err } from "../utils/http.js";

export const profilesRouter = Router();

profilesRouter.get(
  "/",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    const role = String(req.query.role || "");
    console.log("[profiles][GET] query", { role, user: req.user });

    if (role && role !== "mesero" && role !== "admin") {
      console.log("[profiles][GET] invalid role", { role });
      return err(res, 400, "Invalid role");
    }

    let q = supabaseAdmin.from("profiles").select("id,email,role").order("email", { ascending: true });

    if (role) q = q.eq("role", role);

    const r = await q;
    console.log("[profiles][GET] db", { err: r.error?.message, count: r.data?.length });

    if (r.error) return err(res, 500, r.error.message);
    return ok(res, r.data || []);
  })
);
