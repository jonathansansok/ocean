import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import NavBar from "../components/NavBar";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    console.log("[dashboard] load orders");
    try {
      const r = await apiFetch("/orders");
      console.log("[dashboard] orders", r);
      setOrders(r.data || []);
    } catch (e: any) {
      console.log("[dashboard] error", e?.message);
      alert(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
                  <div>{o.status} - ${o.total}</div>
                </div>
                <div className="text-sm opacity-70">{o.created_at}</div>
                <div className="mt-2 space-y-1">
                  {(o.order_items || []).map((it: any) => (
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
  );
}
