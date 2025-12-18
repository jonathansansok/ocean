import type { Response } from "express"

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data })
}

export function err(res: Response, status: number, error: string, extra?: Record<string, unknown>) {
  return res.status(status).json({ error, ...(extra || {}) })
}
