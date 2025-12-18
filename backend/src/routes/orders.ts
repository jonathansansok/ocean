//app\backend\src\routes\orders.ts
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { createOrderSchema } from "../validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, err } from "../utils/http.js";

export const ordersRouter = Router();

const statusSchema = z.enum(["saved", "closed"]);
const assignSchema = z.object({ assignedTo: z.string().uuid() });

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    console.log("[orders][GET] user", req.user);

    const q = await supabaseAdmin
      .from("orders")
      .select(
        "id,status,total,created_at,created_by,assigned_to,order_items(id,product_id,qty,unit_price,line_total)"
      )
      .order("id", { ascending: false });

    console.log("[orders][GET] orders db", {
      error: q.error?.message,
      count: q.data?.length,
    });

    if (q.error) return err(res, 500, q.error.message);

    const rows = q.data || [];
    const ids = Array.from(
      new Set(
        rows
          .flatMap((o) => [o.created_by, o.assigned_to])
          .filter((x): x is string => typeof x === "string" && x.length > 0)
      )
    );

    console.log("[orders][GET] collect profile ids", { idsCount: ids.length });

    const prof = ids.length
      ? await supabaseAdmin.from("profiles").select("id,email,role").in("id", ids)
      : { data: [], error: null };

    console.log("[orders][GET] profiles db", {
      error: prof.error?.message,
      count: prof.data?.length,
    });

    if (prof.error) return err(res, 500, prof.error.message);

    const map = new Map<string, { id: string; email: string; role: string }>();
    (prof.data || []).forEach((p) => map.set(p.id, { id: p.id, email: p.email, role: p.role }));

    const enriched = rows.map((o) => ({
      ...o,
      created_by_profile: o.created_by ? map.get(o.created_by) || null : null,
      assigned_to_profile: o.assigned_to ? map.get(o.assigned_to) || null : null,
    }));

    console.log("[orders][GET] enriched sample", enriched[0]);

    return ok(res, enriched);
  })
);

ordersRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "mesero"]),
  asyncHandler(async (req, res) => {
    console.log("[orders][POST] body", req.body, "user", req.user);

    const parsed = createOrderSchema.safeParse(req.body);
    console.log("[orders][POST] parsed", parsed.success);

    if (!parsed.success)
      return err(res, 400, "Validation error", {
        details: parsed.error.flatten(),
      });

    const rawStatus = (req.body?.status ?? "saved") as unknown;
    const st = statusSchema.safeParse(rawStatus);
    console.log("[orders][POST] status parsed", { ok: st.success, rawStatus });

    if (!st.success) return err(res, 400, "Invalid status");

    const isAdmin = req.user!.role === "admin";

    const requestedAssignedTo =
      typeof req.body?.assignedTo === "string" ? req.body.assignedTo : null;

    const assignedTo = isAdmin ? requestedAssignedTo || null : req.user!.id;

    if (!isAdmin && requestedAssignedTo && requestedAssignedTo !== req.user!.id) {
      console.log("[orders][POST] mesero tried assign other", {
        requestedAssignedTo,
        self: req.user!.id,
      });
      return err(res, 403, "Mesero can only assign to self");
    }

    if (isAdmin && requestedAssignedTo) {
      const target = await supabaseAdmin
        .from("profiles")
        .select("id,role,email")
        .eq("id", requestedAssignedTo)
        .maybeSingle();

      console.log("[orders][POST] requestedAssignedTo profile", {
        requestedAssignedTo,
        err: target.error?.message,
        data: target.data,
      });

      if (target.error) return err(res, 500, target.error.message);
      if (!target.data) return err(res, 400, "Assigned user not found");
      if (target.data.role !== "mesero") return err(res, 400, "Assigned user must be mesero");
    }

    const ids = parsed.data.items.map((i) => i.productId);
    const prod = await supabaseAdmin.from("products").select("id,price").in("id", ids);

    console.log("[orders][POST] products", {
      error: prod.error?.message,
      count: prod.data?.length,
    });

    if (prod.error) return err(res, 500, prod.error.message);

    const priceMap = new Map<number, number>();
    (prod.data || []).forEach((p) => priceMap.set(p.id, Number(p.price)));

    const missing = ids.filter((id) => !priceMap.has(id));
    console.log("[orders][POST] missingProducts", missing);

    if (missing.length) return err(res, 400, "Missing product(s)", { missing });

    const computed = parsed.data.items.map((i) => {
      const unit = priceMap.get(i.productId)!;
      const line = unit * i.qty;
      return { ...i, unit_price: unit, line_total: line };
    });

    const total = computed.reduce((acc, x) => acc + x.line_total, 0);
    console.log("[orders][POST] total", total);

    const orderIns = await supabaseAdmin
      .from("orders")
      .insert({
        created_by: req.user!.id,
        assigned_to: assignedTo,
        status: st.data,
        total,
      })
      .select("id,status,total,created_at,created_by,assigned_to")
      .single();

    console.log("[orders][POST] orderIns", {
      error: orderIns.error?.message,
      data: orderIns.data,
    });

    if (orderIns.error || !orderIns.data)
      return err(res, 500, orderIns.error?.message || "order insert failed");

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
      .select("id,order_id,product_id,qty,unit_price,line_total");

    console.log("[orders][POST] itemsIns", {
      error: itemsIns.error?.message,
      count: itemsIns.data?.length,
    });

    if (itemsIns.error) return err(res, 500, itemsIns.error.message);

    return ok(res, { ...orderIns.data, order_items: itemsIns.data }, 201);
  })
);

ordersRouter.patch(
  "/:id/assign",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    console.log("[orders][PATCH /:id/assign] start", {
      orderId,
      body: req.body,
      user: req.user,
    });

    if (!Number.isFinite(orderId) || orderId <= 0) return err(res, 400, "Invalid order id");

    const parsed = assignSchema.safeParse(req.body);
    console.log("[orders][PATCH /:id/assign] parsed", parsed.success);

    if (!parsed.success)
      return err(res, 400, "Validation error", {
        details: parsed.error.flatten(),
      });

    const target = await supabaseAdmin
      .from("profiles")
      .select("id,role,email")
      .eq("id", parsed.data.assignedTo)
      .maybeSingle();

    console.log("[orders][PATCH /:id/assign] target profile", {
      err: target.error?.message,
      data: target.data,
    });

    if (target.error) return err(res, 500, target.error.message);
    if (!target.data) return err(res, 400, "Assigned user not found");
    if (target.data.role !== "mesero") return err(res, 400, "Assigned user must be mesero");

    const upd = await supabaseAdmin
      .from("orders")
      .update({ assigned_to: parsed.data.assignedTo })
      .eq("id", orderId)
      .select("id,status,total,created_at,created_by,assigned_to")
      .single();

    console.log("[orders][PATCH /:id/assign] db", {
      err: upd.error?.message,
      data: upd.data,
    });

    if (upd.error || !upd.data) return err(res, 500, upd.error?.message || "assign failed");
    return ok(res, upd.data);
  })
);

ordersRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin", "mesero"]),
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    console.log("[orders][PATCH /:id/status] start", {
      orderId,
      body: req.body,
      user: req.user,
    });

    if (!Number.isFinite(orderId) || orderId <= 0) return err(res, 400, "Invalid order id");

    const parsed = z.object({ status: statusSchema }).safeParse(req.body);
    console.log("[orders][PATCH /:id/status] parsed", parsed.success);

    if (!parsed.success)
      return err(res, 400, "Validation error", {
        details: parsed.error.flatten(),
      });

    const cur = await supabaseAdmin
      .from("orders")
      .select("id,status,assigned_to")
      .eq("id", orderId)
      .maybeSingle();

    console.log("[orders][PATCH /:id/status] cur", {
      err: cur.error?.message,
      data: cur.data,
    });

    if (cur.error) return err(res, 500, cur.error.message);
    if (!cur.data) return err(res, 404, "Order not found");

    const isAdmin = req.user!.role === "admin";
    const isOwner = cur.data.assigned_to && cur.data.assigned_to === req.user!.id;

    console.log("[orders][PATCH /:id/status] perm", { isAdmin, isOwner });

    if (!isAdmin && !isOwner)
      return err(res, 403, "You can only change status of your assigned orders");

    if (!isAdmin) {
      if (cur.data.status === "saved" && parsed.data.status !== "closed") {
        console.log("[orders][PATCH /:id/status] mesero only can close", {
          from: cur.data.status,
          to: parsed.data.status,
        });
        return err(res, 400, "Mesero can only change saved -> closed");
      }
    }

    if (cur.data.status === "closed" && parsed.data.status !== "closed") {
      console.log("[orders][PATCH /:id/status] blocked reopen", {
        from: cur.data.status,
        to: parsed.data.status,
      });
      return err(res, 400, "Closed orders cannot be reopened");
    }

    const upd = await supabaseAdmin
      .from("orders")
      .update({ status: parsed.data.status })
      .eq("id", orderId)
      .select("id,status,total,created_at,created_by,assigned_to")
      .single();

    console.log("[orders][PATCH /:id/status] upd", {
      err: upd.error?.message,
      data: upd.data,
    });

    if (upd.error || !upd.data) return err(res, 500, upd.error?.message || "status update failed");
    return ok(res, upd.data);
  })
);
