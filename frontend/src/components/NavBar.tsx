import { Link, NavLink, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuth } from "../auth/useAuth"
import Button from "./ui/Button"

export default function NavBar() {
  const { profile, logout } = useAuth()
  const nav = useNavigate()

  const onLogout = async () => {
    console.log("[NavBar] logout click")
    const r = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Querés salir de la app?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#334155",
    })
    console.log("[NavBar] Swal result", r.isConfirmed)
    if (!r.isConfirmed) return

    await logout()
    nav("/login")
  }

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900"
    }`

  return (
    <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
      <div className="container-app flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-sm font-black tracking-wide text-slate-100">
            OCEANS
          </Link>

          <div className="hidden sm:flex items-center gap-1 ml-2">
            <NavLink to="/dashboard" className={itemClass}>Dashboard</NavLink>
            <NavLink to="/products" className={itemClass}>Products</NavLink>
            <NavLink to="/orders" className={itemClass}>Orders</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-sm font-semibold text-slate-200">{profile?.email}</div>
            <div className="text-xs text-slate-400">role: {profile?.role}</div>
          </div>

          <Button variant="danger" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="container-app pb-3 sm:hidden flex gap-2">
        <NavLink to="/dashboard" className={itemClass}>Dashboard</NavLink>
        <NavLink to="/products" className={itemClass}>Products</NavLink>
        <NavLink to="/orders" className={itemClass}>Orders</NavLink>
      </div>
    </div>
  )
}
