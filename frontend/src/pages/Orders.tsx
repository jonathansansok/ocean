import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";

type Product = { id: number; name: string; price: number };

export default function Orders() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    console.log("[orders] loadAll");
    try {
      const p = await apiFetch("/products");
      const o = await apiFetch("/orders");
      console.log("[orders] products", p);
      console.log("[orders] orders", o);
      setProducts(p.data || []);
      setOrders(o.data || []);
    } catch (e: any) {
      console.log("[orders] loadAll error", e?.message);
      alert(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const total = useMemo(() => {
    const map = new Map<number, number>();
    products.forEach(p => map.set(p.id, Number(p.price)));
    const t = Object.entries(selected).reduce((acc, [idStr, qty]) => {
      const id = Number(idStr);
      const price = map.get(id) || 0;
      return acc + price * qty;
    }, 0);
    console.log("[orders] total calc", { selected, t });
    return t;
  }, [selected, products]);

  const toggleQty = (productId: number, delta: number) => {
    setSelected(prev => {
      const cur = prev[productId] || 0;
      const next = cur + delta;
      const out = { ...prev };
      if (next <= 0) delete out[productId];
      else out[productId] = next;
      console.log("[orders] toggleQty", { productId, delta, cur, next, out });
      return out;
    });
  };

  const onCreateOrder = async () => {
    console.log("[orders] createOrder click", { role: profile?.role, selected });
    const items = Object.entries(selected).map(([productId, qty]) => ({
      productId: Number(productId),
      qty,
    }));

    try {
      const r = await apiFetch("/orders", { method: "POST", body: JSON.stringify({ items }) });
      console.log("[orders] createOrder ok", r);
      setSelected({});
      loadAll();
    } catch (e: any) {
      console.log("[orders] createOrder error", e?.message);
      alert(e?.message || "error");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-xl font-semibold">Orders</h1>

        {!isAdmin && (
          <div className="mt-4 text-sm opacity-70">
            Tu rol es mesero: no podés crear órdenes.
          </div>
        )}

        {isAdmin && (
          <div className="border p-4 mt-4">
            <div className="font-semibold">Create order</div>

            <div className="mt-3 space-y-2">
              {products.map((p) => (
                <div key={p.id} className="border p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm opacity-70">${p.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="border px-2 py-1" onClick={() => toggleQty(p.id, -1)}>-</button>
                    <div className="w-8 text-center">{selected[p.id] || 0}</div>
                    <button className="border px-2 py-1" onClick={() => toggleQty(p.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="font-semibold">Total: ${total}</div>
              <button
                className="border px-3 py-1"
                onClick={onCreateOrder}
                disabled={!Object.keys(selected).length}
              >
                Close / Save Order
              </button>
            </div>
          </div>
        )}

        <button className="border px-3 py-1 mt-4" onClick={loadAll}>Refresh</button>

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
                      prod:{it.product_id} qty:{it.qty} unit:{it.unit_price} total:{it.line_total}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!orders.length && <div>No orders</div>}
          </div>
        )}
      </div>
    </div>
  );
}
