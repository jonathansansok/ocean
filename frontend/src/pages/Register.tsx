import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import { toastErr, toastOk } from "../lib/notify";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
    role: z.enum(["admin", "mesero"]),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const base = import.meta.env.VITE_API_BASE as string;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "mesero" },
  });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    console.log("[register] submit raw", v);

    const payload = (({ email, password, role }) => ({
      email,
      password,
      role,
    }))(v);

    console.log("[register] submit payload", payload);

    try {
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("[register] res", { ok: res.ok, status: res.status, text });

      if (!res.ok) {
        let msg = text || "register failed";
        try {
          const j = JSON.parse(text) as { error?: string };
          if (j?.error) msg = j.error;
        } catch (e: unknown) {
          console.log("[register] json parse fail", { text, e });
        }
        throw new Error(msg);
      }

      toastOk("Cuenta creada");
      await Swal.fire({
        title: "Cuenta creada",
        text: "Ahora logueate con tus credenciales",
        icon: "success",
        confirmButtonText: "Ir a login",
        confirmButtonColor: "#10b981",
      });

      nav("/login");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[register] error", { msg, e });
      toastErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-xl font-black">Register</div>
            <div className="text-sm text-slate-400">
              Crear usuario (admin o mesero)
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <FormField label="Email" error={errors.email?.message}>
                <input
                  className="input"
                  placeholder="email"
                  autoComplete="email"
                  {...register("email")}
                />
              </FormField>

              <FormField label="Contraseña" error={errors.password?.message}>
                <PasswordInput
                  reg={register("password")}
                  placeholder="contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </FormField>

              <FormField
                label="Confirmar Contraseña"
                error={errors.confirmPassword?.message}
              >
                <PasswordInput
                  reg={register("confirmPassword")}
                  placeholder="repetir contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </FormField>

              <FormField
                label="Rol"
                hint="Mesero por defecto"
                error={errors.role?.message}
              >
                <select
                  className="select"
                  {...register("role")}
                  disabled={loading}
                >
                  <option value="mesero">mesero</option>
                  <option value="admin">admin</option>
                </select>
              </FormField>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Crear cuenta
              </Button>

              <div className="pt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span>Ya tenés cuenta?</span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1 font-semibold text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition hover:bg-slate-900/60 hover:border-slate-600/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Login
                  <span className="text-slate-400">→</span>
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
