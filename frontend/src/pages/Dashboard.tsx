import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import { apiFetch } from "../lib/api"
import { isApiErr, type ApiResponse } from "../types/api"
import type { Order } from "../types/models"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import StatusBadge from "../components/ui/StatusBadge"
import EmptyState from "../components/ui/EmptyState"
import Button from "../components/ui/Button"
import { toastErr, toastOk } from "../lib/notify"
import { formatDateTime } from "../lib/format"

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    console.log("[dashboard] load")
    try {
      const o = await apiFetch<ApiResponse<Order[]>>("/orders")
      console.log("[dashboard] orders", o)

      if (isApiErr(o)) throw new Error(o.error)

      setOrders(o.data)
      toastOk("Dashboard actualizado")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error"
      console.log("[dashboard] error", msg)
      toastErr(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <NavBar />

      <div className="container-app py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
            <div className="text-sm text-slate-400">Todas las órdenes, estado y detalle</div>
          </div>

          <Button variant="secondary" onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {loading ? <div className="card p-6 text-sm text-slate-300">Loading...</div> : null}

          {!loading && !orders.length ? (
            <EmptyState title="No hay órdenes todavía" description="Creá una orden desde Órdenes" />
          ) : null}

          {!loading &&
            orders.map((o) => {
              const total = Number(o.total || 0)
              const createdLabel = o.created_by_profile?.email || o.created_by || "-"

              return (
                <Card key={o.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-black">OrdeN #{o.id}</div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="text-sm font-black text-emerald-200">${total.toFixed(2)}</div>
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {formatDateTime(o.created_at)} · created by {createdLabel}
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div className="space-y-2">
                      {(o.order_items || []).map((it) => {
                        console.log("[dashboard] render item", { orderId: o.id, itemId: it.id, product: it.product })

                        const name = it.product?.name || `Product #${it.product_id}`
                        const unit = Number(it.unit_price || 0)
                        const line = Number(it.line_total || 0)

                        return (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{name}</div>
                              <div className="text-xs text-slate-400">
                                Cant. {it.qty} · U. ${unit.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-sm font-black">${line.toFixed(2)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}
