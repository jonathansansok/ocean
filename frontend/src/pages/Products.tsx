import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
});
type FormValues = z.infer<typeof schema>;

export default function Products() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0 },
  });

  const load = async () => {
    setLoading(true);
    console.log("[products] load");
    try {
      const r = await apiFetch("/products");
      console.log("[products] res", r);
      setProducts(r.data || []);
    } catch (e: any) {
      console.log("[products] error", e?.message);
      alert(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (v: FormValues) => {
    console.log("[products] create submit", v, "role", profile?.role);
    try {
      const r = await apiFetch("/products", { method: "POST", body: JSON.stringify(v) });
      console.log("[products] create ok", r);
      reset({ name: "", price: 0 });
      load();
    } catch (e: any) {
      console.log("[products] create error", e?.message);
      alert(e?.message || "error");
    }
  };

  useEffect(() => { load(); }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-xl font-semibold">Products</h1>

        {isAdmin && (
          <div className="border p-4 mt-4">
            <div className="font-semibold">Create product</div>

            <form onSubmit={handleSubmit(onCreate)} className="mt-3 space-y-2">
              <input className="border p-2 w-full" placeholder="name" {...register("name")} />
              {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}

              <input className="border p-2 w-full" placeholder="price" {...register("price")} />
              {errors.price && <div className="text-sm text-red-600">{errors.price.message}</div>}

              <button className="border px-3 py-1">Create</button>
            </form>
          </div>
        )}

        {!isAdmin && (
          <div className="mt-4 text-sm opacity-70">
            Tu rol es mesero: no podés crear productos.
          </div>
        )}

        <button className="border px-3 py-1 mt-4" onClick={load}>Refresh</button>

        {loading && <div className="mt-4">Loading...</div>}

        {!loading && (
          <div className="mt-4 space-y-2">
            {products.map((p) => (
              <div key={p.id} className="border p-3 flex justify-between">
                <div>{p.name}</div>
                <div>${p.price}</div>
              </div>
            ))}
            {!products.length && <div>No products</div>}
          </div>
        )}
      </div>
    </div>
  );
}
