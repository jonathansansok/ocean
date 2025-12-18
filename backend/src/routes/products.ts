import { Router } from "express"
import { supabaseAdmin } from "../supabase.js"
import { requireAuth, requireRole } from "../middlewares/auth.js"
import { createProductSchema } from "../validators.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ok, err } from "../utils/http.js"

export const productsRouter = Router()

productsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    console.log("[products][GET] user", req.user)

    const q = await supabaseAdmin
      .from("products")
      .select("id,name,price,created_at")
      .order("id", { ascending: false })

    console.log("[products][GET] db", { error: q.error?.message, count: q.data?.length })

    if (q.error) return err(res, 500, q.error.message)
    return ok(res, q.data || [])
  })
)

productsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    console.log("[products][POST] body", req.body, "user", req.user)

    const parsed = createProductSchema.safeParse(req.body)
    console.log("[products][POST] parsed", parsed.success)

    if (!parsed.success) return err(res, 400, "Validation error", { details: parsed.error.flatten() })

    const ins = await supabaseAdmin
      .from("products")
      .insert({ name: parsed.data.name, price: parsed.data.price })
      .select("id,name,price,created_at")
      .single()

    console.log("[products][POST] db", { error: ins.error?.message, data: ins.data })

    if (ins.error) return err(res, 500, ins.error.message)
    return ok(res, ins.data, 201)
  })
)
