import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"
import NavBar from "../components/NavBar"
import { isApiErr, type ApiResponse } from "../types/api"
import type { Order } from "../types/models"

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    console.log("[dashboard] load orders")
    try {
      const r = await apiFetch<ApiResponse<Order[]>>("/orders")
      console.log("[dashboard] orders", r)

      if (isApiErr(r)) {
        console.log("[dashboard] api err", r.error)
        throw new Error(r.error)
      }

      setOrders(r.data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error"
      console.log("[dashboard] error", msg)
      alert(msg)
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
      <div className="p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button className="border px-3 py-1 mt-3" onClick={load}>
          Refresh
        </button>

        {loading && <div className="mt-4">Loading...</div>}

        {!loading && (
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="border p-3">
                <div className="flex justify-between">
                  <div className="font-semibold">Order #{o.id}</div>
                  <div>
                    {o.status} - ${o.total}
                  </div>
                </div>
                <div className="text-sm opacity-70">{o.created_at}</div>
                <div className="mt-2 space-y-1">
                  {(o.order_items || []).map((it) => (
                    <div key={it.id} className="text-sm">
                      item #{it.id} prod:{it.product_id} qty:{it.qty} unit:{it.unit_price} total:{it.line_total}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!orders.length && <div>No orders yet</div>}
          </div>
        )}
      </div>
    </div>
  )
}
