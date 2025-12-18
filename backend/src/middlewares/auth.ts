import type { NextFunction, Request, Response } from "express"
import { supabaseAdmin } from "../supabase.js"
import type { AuthedUser, Role } from "../types.js"

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser
      accessToken?: string
    }
  }
}

function getBearer(req: Request) {
  const h = req.headers.authorization || ""
  const [t, token] = h.split(" ")
  if (t !== "Bearer" || !token) return null
  return token
}

function isRole(x: unknown): x is Role {
  return x === "admin" || x === "mesero"
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearer(req)
  console.log("[auth] requireAuth", { hasToken: !!token })

  if (!token) return res.status(401).json({ error: "Missing Bearer token" })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  console.log("[auth] getUser", { ok: !!data?.user, error: error?.message })

  if (error || !data.user) return res.status(401).json({ error: "Invalid token" })

  const userId = data.user.id
  const email = data.user.email || ""

  const prof = await supabaseAdmin
    .from("profiles")
    .select("id,email,role")
    .eq("id", userId)
    .maybeSingle()

  console.log("[auth] profile", { userId, profError: prof.error?.message, profData: prof.data })

  if (prof.error || !prof.data) return res.status(403).json({ error: "Profile missing" })
  if (!isRole(prof.data.role)) return res.status(403).json({ error: "Invalid role" })

  req.user = { id: prof.data.id, email: prof.data.email, role: prof.data.role }
  req.accessToken = token
  next()
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("[auth] requireRole", { roles, user: req.user })
    if (!req.user) return res.status(401).json({ error: "Unauthed" })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" })
    next()
  }
}
