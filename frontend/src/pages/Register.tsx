import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import FormField from "../components/ui/FormField"
import Button from "../components/ui/Button"
import { toastErr, toastOk } from "../lib/notify"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["admin", "mesero"]),
})
type FormValues = z.infer<typeof schema>

const base = import.meta.env.VITE_API_BASE as string

export default function Register() {
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "mesero" },
  })

  const onSubmit = async (v: FormValues) => {
    setLoading(true)
    console.log("[register] submit", v)

    try {
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      })

      const text = await res.text()
      console.log("[register] res", { ok: res.ok, status: res.status, text })

      if (!res.ok) {
        let msg = text || "register failed"
        try {
          const j = JSON.parse(text) as { error?: string }
          if (j?.error) msg = j.error
        } catch (e: unknown) {
          console.log("[register] json parse fail", { text, e })
        }
        throw new Error(msg)
      }

      toastOk("Cuenta creada")
      await Swal.fire({
        title: "Cuenta creada",
        text: "Ahora logueate con tus credenciales",
        icon: "success",
        confirmButtonText: "Ir a login",
        confirmButtonColor: "#10b981",
      })

      nav("/login")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error"
      console.log("[register] error", { msg, e })
      toastErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-xl font-black">Register</div>
            <div className="text-sm text-slate-400">Crear usuario (admin o mesero)</div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <FormField label="Email" error={errors.email?.message}>
                <input className="input" placeholder="email" {...register("email")} />
              </FormField>

              <FormField label="Password" error={errors.password?.message}>
                <input className="input" placeholder="password" type="password" {...register("password")} />
              </FormField>

              <FormField label="Role" hint="Mesero por defecto" error={errors.role?.message}>
                <select className="select" {...register("role")}>
                  <option value="mesero">mesero</option>
                  <option value="admin">admin</option>
                </select>
              </FormField>

              <Button variant="primary" className="w-full" loading={loading}>
                Crear cuenta
              </Button>

              <div className="text-sm text-slate-400">
                Ya tenés cuenta? <Link className="underline text-slate-200" to="/login">Login</Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
