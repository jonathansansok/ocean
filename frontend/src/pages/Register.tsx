import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "mesero"])
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "mesero" }
  });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    console.log("[register] submit", v);

    const signUp = await supabase.auth.signUp({ email: v.email, password: v.password });
    console.log("[register] signUp", { error: signUp.error?.message, userId: signUp.data.user?.id });

    if (signUp.error || !signUp.data.user) {
      setLoading(false);
      alert(signUp.error?.message || "signup failed");
      return;
    }

    const ins = await supabase.from("profiles").insert({
      id: signUp.data.user.id,
      email: v.email,
      role: v.role
    });

    console.log("[register] profile insert", { error: ins.error?.message });

    if (ins.error) {
      setLoading(false);
      alert(ins.error.message);
      return;
    }

    setLoading(false);
    alert("Usuario creado. Ahora logueate.");
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
    </div>
  );
}
