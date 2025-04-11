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
  
  // Efeito para verificar permissões do usuário
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log("AdminGuard: Usuário não autenticado");
        setHasAdminAccess(false);
        setCheckingAccess(false);
        return;
      }

      // Verificar acesso administrativo sempre com base nos dados atuais do usuário
      const hasAccess = canAccessAdminArea();
      const isUserJornalista = isJornalista();
      
      console.log("Verificação de acesso admin:", { 
        hasAccess, 
        isJornalista: isUserJornalista,
        role: user.role,
        nivel: user.nivel,
        pathname: location.pathname
      });
      
      // Log adicional para jornalistas
      if (isUserJornalista) {
        console.log("Usuário é jornalista. Deve ter acesso à rota /admin/posts");
        
        if (location.pathname.includes('/admin/posts')) {
          console.log("Rota atual é /admin/posts - acesso permitido para jornalista");
        } else {
          console.log("Rota atual NÃO é /admin/posts - jornalista será redirecionado");
        }
        
        // Forçar acesso para jornalistas se estiverem na rota correta
        if (location.pathname.includes('/admin/posts')) {
          setHasAdminAccess(true);
          setCheckingAccess(false);
          return;
        }
      }
      
      setHasAdminAccess(hasAccess);
      setCheckingAccess(false);
    };

    // Sempre verificar o status quando o componente é montado ou quando o usuário muda
    checkAdminStatus();
  }, [user, canAccessAdminArea, isJornalista, location.pathname]);

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
    console.log("AdminGuard: Redirecionando para login (usuário não autenticado)");
    return <Navigate to="/admin/login" replace />;
  }

  // Garantir acesso de jornalistas à rota /admin/posts - nova lógica prioritária
  if (isJornalista() && location.pathname.includes('/admin/posts')) {
    console.log("AdminGuard: Permitindo acesso de jornalista à rota /admin/posts");
    return <>{children}</>;
  }
  
  // Verificar se o usuário é jornalista e está tentando acessar uma rota diferente de /admin/posts
  if (isJornalista() && !location.pathname.includes('/admin/posts')) {
    console.log("Jornalista tentando acessar rota não autorizada, redirecionando para /admin/posts");
    return <Navigate to="/admin/posts" replace />;
  }

  if (!hasAdminAccess) {
    console.log("AdminGuard: Usuário não tem acesso administrativo, redirecionando para home");
    return <Navigate to="/" replace />;
  }

  console.log("AdminGuard: Acesso permitido a", location.pathname);
  return <>{children}</>;
}; 