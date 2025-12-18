import type React from "react"
import { cn } from "../../lib/cn"

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  console.log("[Card] render")
  return <div className={cn("card", className)} {...props} />
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  console.log("[CardHeader] render")
  return <div className={cn("card-h", className)} {...props} />
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  console.log("[CardBody] render")
  return <div className={cn("card-b", className)} {...props} />
}
