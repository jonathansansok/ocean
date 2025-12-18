import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, authed } = useAuth();

  console.log("[ProtectedRoute]", { loading, authed });

  if (!authed && loading) return <div className="p-6">Loading...</div>;
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}