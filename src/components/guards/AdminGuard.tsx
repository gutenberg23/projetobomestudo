import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState, useRef } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading } = useAuth();
  const { canAccessAdminArea, isJornalista } = usePermissions();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const location = useLocation();
  const lastCheckTimeRef = useRef<number>(Date.now());
  
  // Efeito para verificar permissões do usuário
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setCheckingAccess(false);
        return;
      }

      // Verificar acesso administrativo sempre com base nos dados atuais do usuário
      const hasAccess = canAccessAdminArea();
      setHasAdminAccess(hasAccess);
      setCheckingAccess(false);
    };

    // Sempre verificar o status quando o componente é montado ou quando o usuário muda
    checkAdminStatus();
  }, [user, canAccessAdminArea]);

  // Verificar a cada mudança de visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Desativar verificações automáticas ao voltar para a aba
      // Isso evita redirecionamentos indesejados
      if (document.visibilityState === 'visible') {
        console.log("AdminGuard: Aba recebeu foco, verificações de permissão desativadas");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar se o usuário é jornalista e está tentando acessar uma rota diferente de /admin/posts
  if (isJornalista() && !location.pathname.includes('/admin/posts')) {
    console.log("Jornalista tentando acessar rota não autorizada, redirecionando para /admin/posts");
    return <Navigate to="/admin/posts" replace />;
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 