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
  const initialCheckDone = useRef(false);
  
  // Marker para indicar que esta aba já completou a verificação inicial
  useEffect(() => {
    // Configurar um marcador global para evitar re-verificações desnecessárias
    if (!initialCheckDone.current && !loading && user) {
      window.sessionStorage.setItem('admin-auth-checked', 'true');
      initialCheckDone.current = true;
    }
  }, [loading, user]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setCheckingAccess(false);
        return;
      }

      // Verificar acesso administrativo
      const hasAccess = canAccessAdminArea();
      setHasAdminAccess(hasAccess);
      setCheckingAccess(false);
      
      // Se tem acesso, marcar como verificado para esta sessão
      if (hasAccess) {
        window.sessionStorage.setItem('admin-access-granted', 'true');
      }
    };

    // Se a verificação já foi feita nesta sessão, podemos usar o cache
    const alreadyChecked = window.sessionStorage.getItem('admin-auth-checked') === 'true';
    const accessGranted = window.sessionStorage.getItem('admin-access-granted') === 'true';
    
    if (alreadyChecked && accessGranted && user) {
      // Se já verificamos e temos acesso, não precisamos verificar novamente
      setHasAdminAccess(true);
      setCheckingAccess(false);
    } else {
      // Caso contrário, verificar normalmente
      checkAdminStatus();
    }
  }, [user, canAccessAdminArea]);

  useEffect(() => {
    // Event listener para verificar quando a aba fica visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("AdminGuard: Aba recebeu foco, verificando autenticação");
        // A verificação de autenticação já será feita pelo efeito principal
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
    return <Navigate to="/admin/posts" replace />;
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 