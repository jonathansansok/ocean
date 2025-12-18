import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import NavBar from "../components/NavBar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import { isApiErr, type ApiResponse } from "../types/api";
import type { Product, Order } from "../types/models";
import type { Profile } from "../types/auth";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { toastErr, toastOk } from "../lib/notify";
import { formatDateTime } from "../lib/format";

export default function Orders() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const myId = profile?.id || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meseros, setMeseros] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const productMap = useMemo(() => {
    const m = new Map<number, Product>();
    products.forEach((p) => m.set(p.id, p));
    console.log("[orders] productMap size", m.size);
    return m;
  }, [products]);

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
      toastErr(msg);
    } finally {
      setLoading(false);
    }
  }, [profile?.role, isAdmin]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const total = useMemo(() => {
    const t = Object.entries(selected).reduce((acc, [idStr, qty]) => {
      const id = Number(idStr);
      const price = productMap.get(id)?.price ?? 0;
      return acc + price * qty;
    }, 0);
    console.log("[orders] total calc", { selected, t });
    return t;
  }, [selected, productMap]);

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

  const selectedCount = Object.keys(selected).length;

  const canTouchOrder = (o: Order) => {
    if (isAdmin) return true;
    if (!myId) return false;
    return o.assigned_to === myId;
  };

  const createOrder = async (status: "saved" | "closed") => {
    console.log("[orders] createOrder click", {
      status,
      role: profile?.role,
      selected,
      total,
    });

    if (!selectedCount) {
      toastErr("Seleccioná al menos 1 producto");
      return;
    }

    const items = Object.entries(selected).map(([productId, qty]) => ({
      productId: Number(productId),
      qty,
    }));

    const title = status === "closed" ? "Cerrar orden" : "Guardar orden";
    const text =
      status === "closed"
        ? "Se creará y quedará cerrada (entregada). ¿Confirmás?"
        : "Se creará en estado Saved (en curso). ¿Confirmás?";

    const confirmColor = status === "closed" ? "#f43f5e" : "#10b981";

    const r0 = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: status === "closed" ? "Cerrar" : "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#334155",
    });

    console.log("[orders] Swal createOrder result", r0.isConfirmed);
    if (!r0.isConfirmed) return;

    setCreating(true);
    try {
      const body: Record<string, unknown> = { items, status };

      const r = await apiFetch<ApiResponse<Order>>("/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("[orders] createOrder res", r);
      if (isApiErr(r)) throw new Error(r.error);

      setSelected({});
      toastOk(
        status === "closed" ? "Orden creada y cerrada" : "Orden creada en Saved"
      );
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] createOrder error", msg);
      toastErr(msg);
    } finally {
      setCreating(false);
    }
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

    const r0 = await Swal.fire({
      title: "Marcar como Closed",
      text: "Esto indica que la orden fue entregada. ¿Confirmás?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cerrar orden",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#334155",
    });

    console.log("[orders] Swal close result", r0.isConfirmed);
    if (!r0.isConfirmed) return;

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

      toastOk("Orden marcada como Closed");
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] setOrderStatus error", msg);
      toastErr(msg);
    }
  };

  const assignOrder = async (orderId: number, assignedTo: string) => {
    console.log("[orders] assignOrder", { orderId, assignedTo });

    const who = meseros.find((m) => m.id === assignedTo)?.email || assignedTo;

    const r0 = await Swal.fire({
      title: "Asignar orden",
      text: `Se asignará al mesero: ${who}. ¿Confirmás?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#334155",
    });

    console.log("[orders] Swal assign result", r0.isConfirmed);
    if (!r0.isConfirmed) return;

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

      toastOk("Orden reasignada");
      loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[orders] assignOrder error", msg);
      toastErr(msg);
    }
  };

  return (
    <div>
      <NavBar />

      <div className="container-app py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Orders</h1>
            <div className="text-sm text-slate-400">
              Mesero crea y se asigna solo · Admin puede reasignar · Close por
              mesero asignado o admin
            </div>
          </div>

          <Button variant="secondary" onClick={loadAll} loading={loading}>
            Refresh
          </Button>
        </div>

        <Card className="mt-5">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black">Create order</div>
                <div className="text-xs text-slate-400">
                  Total en tiempo real · UX con botones + / -
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg font-black text-emerald-200">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => {
                const qty = selected[p.id] ?? 0;
                const line = qty * p.price;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-black truncate">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        ${p.price} · line ${line.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => toggleQty(p.id, -1)}
                      >
                        -
                      </Button>
                      <div className="w-10 text-center font-black">{qty}</div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => toggleQty(p.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelected({})}
                disabled={!selectedCount || creating}
              >
                Limpiar selección
              </Button>

              <Button
                variant="primary"
                onClick={() => createOrder("saved")}
                disabled={!selectedCount}
                loading={creating}
              >
                Save
              </Button>

              <Button
                variant="danger"
                onClick={() => createOrder("closed")}
                disabled={!selectedCount}
                loading={creating}
              >
                Close
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="mt-5 grid gap-3">
          {loading ? (
            <div className="card p-6 text-sm text-slate-300">Loading...</div>
          ) : null}

          {!loading && !orders.length ? (
            <EmptyState
              title="No orders"
              description="Creá una orden arriba para que aparezca en el dashboard"
            />
          ) : null}

          {!loading &&
            orders.map((o) => {
              const canTouch = canTouchOrder(o);
              const isClosed = o.status === "closed";
              const assignedLabel =
                o.assigned_to_profile?.email || o.assigned_to || "unassigned";
              const createdLabel =
                o.created_by_profile?.email || o.created_by || "-";

              return (
                <Card key={o.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-black">Orden #{o.id}</div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="text-sm font-black text-emerald-200">
                        ${o.total}
                      </div>
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {formatDateTime(o.created_at)} · creado por {createdLabel}{" "}
                      · Asign. a {assignedLabel}
                    </div>
                  </CardHeader>

                  <CardBody>
                    {isAdmin ? (
                      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <select
                          className="select"
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

                        <div className="text-xs text-slate-400">
                          Reasign.
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      {(o.order_items || []).map((it) => {
                        console.log("[orders] render item", {
                          orderId: o.id,
                          itemId: it.id,
                          product: it.product,
                        });

                        const name =
                          it.product?.name ||
                          productMap.get(it.product_id)?.name ||
                          `Product #${it.product_id}`;
                        const unit = Number(it.unit_price || 0);
                        const line = Number(it.line_total || 0);

                        return (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {name}
                              </div>
                              <div className="text-xs text-slate-400">
                                Cant. {it.qty} · U. ${unit.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-sm font-black">
                              ${line.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-400">
                        {isClosed
                          ? "Orden cerrada"
                          : canTouch
                          ? "Podés cerrar esta orden"
                          : "No sos el mesero asignado"}
                      </div>

                      {!isClosed ? (
                        <Button
                          variant={canTouch ? "primary" : "secondary"}
                          onClick={() =>
                            canTouch && setOrderStatus(o.id, "closed")
                          }
                          disabled={!canTouch}
                        >
                          Cerrar Orden
                        </Button>
                      ) : (
                        <div className="badge badge-green">Entregado</div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}
