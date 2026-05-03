import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ghost">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-pure">Not authorized</h1>
          <p className="mt-2 text-ghost">Your account is not an admin.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
