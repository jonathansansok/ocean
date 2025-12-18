import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "../lib/supabase"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import FormField from "../components/ui/FormField"
import Button from "../components/ui/Button"
import { toastErr, toastOk } from "../lib/notify"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})
type FormValues = z.infer<typeof schema>

export default function Login() {
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { refresh } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: FormValues) => {
    setLoading(true)
    console.log("[login] submit", v)

    const r = await supabase.auth.signInWithPassword({ email: v.email, password: v.password })
    console.log("[login] signInWithPassword", { ok: !!r.data.session, err: r.error?.message })

    if (r.error) {
      toastErr(r.error.message)
      setLoading(false)
      return
    }

    await refresh()
    toastOk("Login OK")
    setLoading(false)
    nav("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-xl font-black">Login</div>
            <div className="text-sm text-slate-400">Acceso para meseros y admin</div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <FormField label="Email" error={errors.email?.message}>
                <input className="input" placeholder="email" {...register("email")} />
              </FormField>

              <FormField label="Password" error={errors.password?.message}>
                <input className="input" placeholder="password" type="password" {...register("password")} />
              </FormField>

              <Button variant="primary" className="w-full" loading={loading}>
                Entrar
              </Button>

              <div className="text-sm text-slate-400">
                No tenés cuenta? <Link className="underline text-slate-200" to="/register">Register</Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
