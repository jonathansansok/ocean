import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import { toastErr, toastOk } from "../lib/notify";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { refresh } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    console.log("[login] submit", v);

    const r = await supabase.auth.signInWithPassword({
      email: v.email,
      password: v.password,
    });

    console.log("[login] signInWithPassword", {
      ok: !!r.data.session,
      err: r.error?.message,
    });

    if (r.error) {
      toastErr(r.error.message);
      setLoading(false);
      return;
    }

    await refresh();
    toastOk("Login OK");
    setLoading(false);
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-xl font-black">Login</div>
            <div className="text-sm text-slate-400">
              Acceso para meseros y admin
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <FormField label="Email" error={errors.email?.message}>
                <input
                  className="input"
                  placeholder="email"
                  autoComplete="email"
                  disabled={loading}
                  {...register("email")}
                />
              </FormField>

              <FormField label="Password" error={errors.password?.message}>
                <PasswordInput
                  reg={register("password")}
                  placeholder="password"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Entrar
              </Button>

              <div className="pt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span>No tenés cuenta?</span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1 font-semibold text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition hover:bg-slate-900/60 hover:border-slate-600/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Register
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
