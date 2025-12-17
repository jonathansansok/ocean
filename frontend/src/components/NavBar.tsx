import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function NavBar() {
  const { profile, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    console.log("[NavBar] logout click");
    await logout();
    nav("/login");
  };

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex gap-3">
        <Link to="/dashboard" className="underline">Dashboard</Link>
        <Link to="/products" className="underline">Products</Link>
        <Link to="/orders" className="underline">Orders</Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm">
          {profile?.email} <span className="font-semibold">({profile?.role})</span>
        </div>
        <button onClick={onLogout} className="border px-3 py-1">Logout</button>
      </div>
    </div>
  );
}
