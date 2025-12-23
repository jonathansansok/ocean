import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import { apiFetch } from "../lib/api"
import { useAuth } from "../auth/useAuth"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { isApiErr, type ApiResponse } from "../types/api"
import type { Product } from "../types/models"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import FormField from "../components/ui/FormField"
import Button from "../components/ui/Button"
import { toastErr, toastOk, toastInfo } from "../lib/notify"

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  price: z.preprocess(
  (v) => {
    const n = typeof v === "string" ? Number(v) : v
    console.log("[products][zod] preprocess price", { raw: v, n })
    if (typeof n === "number" && Number.isNaN(n)) return undefined
    return n
  },
  z
    .number()
    .refine((x) => Number.isFinite(x), "Precio inválido")
    .positive("Precio debe ser mayor a 0")
),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export default function Products() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0 },
  })

  const isAdmin = profile?.role === "admin"

  const load = async () => {
    setLoading(true)
    console.log("[products] load")
    try {
      const r = await apiFetch<ApiResponse<Product[]>>("/products")
      console.log("[products] res", r)
      if (isApiErr(r)) throw new Error(r.error)
      setProducts(r.data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error"
      console.log("[products] error", msg)
      toastErr(msg)
    } finally {
      setLoading(false)
    }
  }

  const onCreate: SubmitHandler<FormInput> = async (raw) => {
    console.log("[products] create submit raw", raw, "role", profile?.role)

    let v: FormValues
    try {
      v = schema.parse(raw)
      console.log("[products] create parsed", v)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "validation error"
      console.log("[products] parse error", msg)
      toastErr("Validación inválida")
      return
    }

    setCreating(true)
    try {
      const r = await apiFetch<ApiResponse<Product>>("/products", {
        method: "POST",
        body: JSON.stringify(v),
      })
      console.log("[products] create ok", r)
      if (isApiErr(r)) throw new Error(r.error)
      toastOk("Producto creado")
      reset({ name: "", price: 0 })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error"
      console.log("[products] create error", msg)
      toastErr(msg)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      console.log("[products] role mesero info")
      toastInfo("Rol mesero: no podés crear productos")
    }
  }, [isAdmin])

  return (
    <div>
      <NavBar />

      <div className="container-app py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Products</h1>
            <div className="text-sm text-slate-400">Catálogo del restaurante</div>
          </div>

          <Button variant="secondary" onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>

        {isAdmin ? (
          <Card className="mt-5">
            <CardHeader>
              <div className="text-sm font-black">Create product</div>
              <div className="text-xs text-slate-400">Nombre requerido · precio &gt; 0</div>
            </CardHeader>

            <CardBody>
              <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 sm:grid-cols-2">
                <FormField label="Nombre" error={errors.name?.message}>
                  <input className="input" placeholder="Ej: Hamburguesa completa" {...register("name")} />
                </FormField>

                <FormField label="Precio" hint="ARS o USD según tu criterio" error={errors.price?.message as string | undefined}>
                  <input
                    className="input"
                    placeholder="Ej: 12.50"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                  />
                </FormField>

                <div className="sm:col-span-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => reset({ name: "", price: 0 })}>
                    Limpiar
                  </Button>
                  <Button type="submit" variant="primary" loading={creating}>
                    Crear
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : (
          <div className="mt-5 card p-4 text-sm text-slate-300">
            Tu rol es <span className="font-black">mesero</span>: no podés crear productos.
          </div>
        )}

        <div className="mt-5 grid gap-2">
          {loading ? <div className="card p-6 text-sm text-slate-300">Loading...</div> : null}

          {!loading && !products.length ? (
            <div className="card p-6 text-sm text-slate-300">No products</div>
          ) : null}

          {!loading &&
            products.map((p) => (
              <div key={p.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-black truncate">{p.name}</div>
                  <div className="text-xs text-slate-400">id #{p.id}</div>
                </div>
                <div className="text-sm font-black text-emerald-200">${p.price}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
