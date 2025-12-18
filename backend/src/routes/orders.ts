import { Router } from "express"
import { supabaseAdmin } from "../supabase.js"
import { requireAuth, requireRole } from "../middlewares/auth.js"
import { createOrderSchema } from "../validators.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ok, err } from "../utils/http.js"

export const ordersRouter = Router()

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    console.log("[orders][GET] user", req.user)

    const q = await supabaseAdmin
      .from("orders")
      .select("id,status,total,created_at,created_by,order_items(id,product_id,qty,unit_price,line_total)")
      .order("id", { ascending: false })

    console.log("[orders][GET] db", { error: q.error?.message, count: q.data?.length })

    if (q.error) return err(res, 500, q.error.message)
    return ok(res, q.data || [])
  })
)

ordersRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "mesero"]),
  asyncHandler(async (req, res) => {
    console.log("[orders][POST] body", req.body, "user", req.user)

    const parsed = createOrderSchema.safeParse(req.body)
    console.log("[orders][POST] parsed", parsed.success)

    if (!parsed.success) return err(res, 400, "Validation error", { details: parsed.error.flatten() })

    const ids = parsed.data.items.map((i) => i.productId)
    const prod = await supabaseAdmin.from("products").select("id,price").in("id", ids)

    console.log("[orders][POST] products", { error: prod.error?.message, count: prod.data?.length })

    if (prod.error) return err(res, 500, prod.error.message)

    const priceMap = new Map<number, number>()
    ;(prod.data || []).forEach((p) => priceMap.set(p.id, Number(p.price)))

    const missing = ids.filter((id) => !priceMap.has(id))
    console.log("[orders][POST] missingProducts", missing)

    if (missing.length) return err(res, 400, "Missing product(s)", { missing })

    const computed = parsed.data.items.map((i) => {
      const unit = priceMap.get(i.productId)!
      const line = unit * i.qty
      return { ...i, unit_price: unit, line_total: line }
    })

    const total = computed.reduce((acc, x) => acc + x.line_total, 0)
    console.log("[orders][POST] total", total)

    const orderIns = await supabaseAdmin
      .from("orders")
      .insert({ created_by: req.user!.id, status: "closed", total })
      .select("id,status,total,created_at,created_by")
      .single()

    console.log("[orders][POST] orderIns", { error: orderIns.error?.message, data: orderIns.data })

    if (orderIns.error || !orderIns.data) return err(res, 500, orderIns.error?.message || "order insert failed")

    const itemsIns = await supabaseAdmin
      .from("order_items")
      .insert(
        computed.map((i) => ({
          order_id: orderIns.data.id,
          product_id: i.productId,
          qty: i.qty,
          unit_price: i.unit_price,
          line_total: i.line_total,
        }))
      )
      .select("id,order_id,product_id,qty,unit_price,line_total")

    console.log("[orders][POST] itemsIns", { error: itemsIns.error?.message, count: itemsIns.data?.length })

    if (itemsIns.error) return err(res, 500, itemsIns.error.message)

    return ok(res, { ...orderIns.data, items: itemsIns.data }, 201)
  })
)
