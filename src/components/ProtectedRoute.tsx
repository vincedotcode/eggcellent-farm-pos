import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider"; // adjust path if needed

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
