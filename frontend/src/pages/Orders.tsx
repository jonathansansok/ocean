import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import { isApiErr, type ApiResponse } from "../types/api";
import type { Product, Order } from "../types/models";
import type { Profile } from "../types/auth";

export default function Orders() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const myId = profile?.id || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meseros, setMeseros] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    console.log("[orders] loadAll", { role: profile?.role });

    try {
      const p = await apiFetch<ApiResponse<Product[]>>("/products");
      const o = await apiFetch<ApiResponse<Order[]>>("/orders");

      console.log("[orders] products", p);
      console.log("[orders] orders", o);

      if (isApiErr(p)) throw new Error(p.error);
      if (isApiErr(o)) throw new Error(o.error);

      setProducts(p.data);
      setOrders(o.data);

      if (isAdmin) {
        const m = await apiFetch<ApiResponse<Profile[]>>(
          "/profiles?role=mesero"
        );
        console.log("[orders] meseros", m);
        if (isApiErr(m)) throw new Error(m.error);
        setMeseros(m.data);
      } else {
        setMeseros([]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] loadAll error", msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  }, [profile?.role, isAdmin]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const total = useMemo(() => {
    const priceMap = new Map<number, number>();
    products.forEach((p) => priceMap.set(p.id, p.price));

    const t = Object.entries(selected).reduce((acc, [idStr, qty]) => {
      const id = Number(idStr);
      const price = priceMap.get(id) ?? 0;
      return acc + price * qty;
    }, 0);

    console.log("[orders] total calc", { selected, t });
    return t;
  }, [selected, products]);

  const toggleQty = (productId: number, delta: number) => {
    setSelected((prev) => {
      const cur = prev[productId] ?? 0;
      const next = cur + delta;
      const out = { ...prev };

      if (next <= 0) delete out[productId];
      else out[productId] = next;

      console.log("[orders] toggleQty", { productId, delta, cur, next, out });
      return out;
    });
  };

  const createOrder = async (status: "saved" | "closed") => {
    console.log("[orders] createOrder click", {
      status,
      role: profile?.role,
      selected,
    });

    const items = Object.entries(selected).map(([productId, qty]) => ({
      productId: Number(productId),
      qty,
    }));

    try {
      const body: Record<string, unknown> = { items, status };

      const r = await apiFetch<ApiResponse<Order>>("/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("[orders] createOrder res", r);

      if (isApiErr(r)) throw new Error(r.error);

      setSelected({});
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] createOrder error", msg);
      alert(msg);
    }
  };

  const canTouchOrder = (o: Order) => {
    if (isAdmin) return true;
    if (!myId) return false;
    return o.assigned_to === myId;
  };

  const setOrderStatus = async (
    orderId: number,
    status: "saved" | "closed"
  ) => {
    console.log("[orders] setOrderStatus", {
      orderId,
      status,
      role: profile?.role,
    });

    try {
      const r = await apiFetch<ApiResponse<Order>>(
        `/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      console.log("[orders] setOrderStatus res", r);

      if (isApiErr(r)) throw new Error(r.error);
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] setOrderStatus error", msg);
      alert(msg);
    }
  };

  const assignOrder = async (orderId: number, assignedTo: string) => {
    console.log("[orders] assignOrder", { orderId, assignedTo });

    try {
      const r = await apiFetch<ApiResponse<Order>>(
        `/orders/${orderId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ assignedTo }),
        }
      );

      console.log("[orders] assignOrder res", r);

      if (isApiErr(r)) throw new Error(r.error);
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] assignOrder error", msg);
      alert(msg);
    }
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-xl font-semibold">Orders</h1>

        <div className="border p-4 mt-4">
          <div className="font-semibold">Create order</div>

          <div className="mt-3 space-y-2">
            {products.map((p) => (
              <div key={p.id} className="border p-3 flex justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm opacity-70">${p.price}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="border px-2 py-1"
                    onClick={() => toggleQty(p.id, -1)}
                  >
                    -
                  </button>
                  <div className="w-8 text-center">{selected[p.id] ?? 0}</div>
                  <button
                    className="border px-2 py-1"
                    onClick={() => toggleQty(p.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="font-semibold">Total: ${total}</div>

            <div className="flex gap-2">
              <button
                className="border px-3 py-1"
                onClick={() => createOrder("saved")}
                disabled={!selectedCount}
              >
                Save
              </button>

              <button
                className="border px-3 py-1"
                onClick={() => createOrder("closed")}
                disabled={!selectedCount}
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs opacity-70">
            Mesero crea y se asigna solo. Admin puede reasignar después.
          </div>
        </div>

        <button className="border px-3 py-1 mt-4" onClick={loadAll}>
          Refresh
        </button>

        {loading && <div className="mt-4">Loading...</div>}

        {!loading && (
          <div className="mt-4 space-y-3">
            {orders.map((o) => {
              const canTouch = canTouchOrder(o);
              const isClosed = o.status === "closed";

              return (
                <div key={o.id} className="border p-3">
                  <div className="flex justify-between">
                    <div className="font-semibold">Order #{o.id}</div>
                    <div>
                      {o.status} - ${o.total}
                    </div>
                  </div>

                  <div className="text-sm opacity-70">{o.created_at}</div>

                  <div className="text-sm opacity-70 mt-1">
                    created_by:{" "}
                    {o.created_by_profile?.email || o.created_by || "-"} |
                    assigned_to:{" "}
                    {o.assigned_to_profile?.email || o.assigned_to || "-"}
                  </div>

                  {isAdmin && (
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="border p-2"
                        value={o.assigned_to || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          console.log("[orders] admin select assigned_to", {
                            orderId: o.id,
                            v,
                          });
                          if (v) assignOrder(o.id, v);
                        }}
                      >
                        <option value="">unassigned</option>
                        {meseros.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.email}
                          </option>
                        ))}
                      </select>

                      <div className="text-xs opacity-70">
                        Admin asigna la orden a un mesero
                      </div>
                    </div>
                  )}

                  <div className="mt-2 space-y-1">
                    {(o.order_items || []).map((it) => (
                      <div key={it.id} className="text-sm">
                        prod:{it.product_id} qty:{it.qty} unit:{it.unit_price}{" "}
                        total:{it.line_total}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {!isClosed && canTouch && (
                      <button
                        className="border px-3 py-1"
                        onClick={() => setOrderStatus(o.id, "closed")}
                      >
                        Mark Closed
                      </button>
                    )}

                    {!isClosed && !canTouch && (
                      <div className="text-xs opacity-70">
                        No podés cerrar: no sos el mesero asignado.
                      </div>
                    )}

                    {isClosed && (
                      <div className="text-xs opacity-70">Orden cerrada</div>
                    )}
                  </div>
                </div>
              );
            })}

            {!orders.length && <div>No orders</div>}
          </div>
        )}
      </div>
    </div>
  );
}
