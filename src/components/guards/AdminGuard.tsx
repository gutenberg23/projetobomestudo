import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading } = useAuth();
  const { canAccessAdminArea, isJornalista } = usePermissions();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setCheckingAccess(false);
        return;
      }

      setHasAdminAccess(canAccessAdminArea());
      setCheckingAccess(false);
    };

    checkAdminStatus();
  }, [user, canAccessAdminArea]);

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário é jornalista e está tentando acessar uma rota diferente de /admin/posts
  if (isJornalista() && !location.pathname.includes('/admin/posts')) {
    return <Navigate to="/admin/posts" replace />;
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 