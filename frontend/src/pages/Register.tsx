//app\frontend\src\pages\Register.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "mesero"]),
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
    console.log("[register] submit", v);

    try {
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
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

      alert("Cuenta creada. Ahora logueate.");
      nav("/login");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "error";
      console.log("[register] error", { msg, e });
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <input className="border p-2 w-full" placeholder="email" {...register("email")} />
        {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}

        <input className="border p-2 w-full" placeholder="password" type="password" {...register("password")} />
        {errors.password && <div className="text-sm text-red-600">{errors.password.message}</div>}

        <select className="border p-2 w-full" {...register("role")}>
          <option value="mesero">mesero</option>
          <option value="admin">admin</option>
        </select>
        {errors.role && <div className="text-sm text-red-600">{errors.role.message}</div>}

        <button disabled={loading} className="border px-4 py-2 w-full">
          {loading ? "..." : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-4 text-sm">
        Ya tenés cuenta? <Link className="underline" to="/login">Login</Link>
      </div>
    </div>
  );
}
