import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { refresh } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    console.log("[login] submit", v);

    const r = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    console.log("[login] signInWithPassword", { ok: !!r.data.session, err: r.error?.message });

    if (r.error) {
      setLoading(false);
      alert(r.error.message);
      return;
    }

    await refresh();
    setLoading(false);
    nav("/dashboard");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <input className="border p-2 w-full" placeholder="email" {...register("email")} />
        {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}

        <input className="border p-2 w-full" placeholder="password" type="password" {...register("password")} />
        {errors.password && <div className="text-sm text-red-600">{errors.password.message}</div>}

        <button disabled={loading} className="border px-4 py-2 w-full">
          {loading ? "..." : "Entrar"}
        </button>
      </form>

      <div className="mt-4 text-sm">
        No tenés cuenta? <Link className="underline" to="/register">Register</Link>
      </div>
    </div>
  );
}
