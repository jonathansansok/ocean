import type { Request, Response, NextFunction } from "express"

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  const msg = err instanceof Error ? err.message : "Internal error"
  console.log("[errorMiddleware]", { msg })
  res.status(500).json({ error: msg })
}
