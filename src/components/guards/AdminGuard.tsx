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
  const { canAccessAdminArea, canOnlyAccessPosts, loading: permissionsLoading } = usePermissions();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPageReload, setIsPageReload] = useState(false);
  const location = useLocation();
  
  // Detectar se é uma recarga de página
  useEffect(() => {
    // Verificar se é uma atualização da página baseado no histórico de navegação
    const isReload = 
      window.performance && 
      window.performance.navigation && 
      window.performance.navigation.type === 1;
    
    // Se não conseguir detectar pelo navigation.type, verificar pelo referrer
    const hasReferrer = document.referrer && document.referrer.includes(window.location.origin);
    
    setIsPageReload(isReload || Boolean(hasReferrer));
    
    if (isReload || hasReferrer) {
      console.log("AdminGuard: Detectada atualização de página - redirecionamentos serão bloqueados");
    }
  }, []);
  
  // Verificar permissões apenas após o usuário ser carregado completamente
  useEffect(() => {
    const checkPermissions = async () => {
      // Esperar até que o carregamento do usuário seja concluído
      if (loading || permissionsLoading) {
        console.log("AdminGuard: Ainda carregando usuário ou permissões...", { loading, permissionsLoading });
        return;
      }
      
      // Se não há usuário, não tem permissão
      if (!user) {
        console.log("AdminGuard: Nenhum usuário logado");
        setHasPermission(false);
        setCheckingAccess(false);
        return;
      }
      
      console.log("AdminGuard: Usuário logado:", user);
      
      // Verificar permissões com base nos dados do usuário
      const hasAccess = canAccessAdminArea();
      console.log("AdminGuard: Verificação de permissão concluída:", hasAccess);
      setHasPermission(hasAccess);
      setCheckingAccess(false);
    };
    
    console.log("AdminGuard: Iniciando verificação de permissões");
    checkPermissions();
  }, [user, loading, permissionsLoading, canAccessAdminArea]);
  
  // Exibir spinner enquanto verifica
  if (loading || permissionsLoading || checkingAccess) {
    console.log("AdminGuard: Exibindo spinner - loading:", loading, "permissionsLoading:", permissionsLoading, "checkingAccess:", checkingAccess);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Redirecionar para login se não estiver autenticado
  if (!user) {
    console.log("AdminGuard: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/admin/login" replace />;
  }
  
  // Se é uma atualização de página, não redirecionar - permitir que permaneça na mesma página
  if (isPageReload) {
    console.log("AdminGuard: Atualização de página detectada, evitando redirecionamento");
    console.log("AdminGuard: Usuário atual:", user?.role, "Caminho atual:", location.pathname);
    return <>{children}</>;
  }
  
  // Verificar se o usuário só pode acessar posts (jornalista)
  if (hasPermission && canOnlyAccessPosts()) {
    const isPostsPage = location.pathname.includes('/admin/posts');
    const isAdminRoot = location.pathname === '/admin';
    
    // Apenas redirecionar se não estiver na página de posts ou na raiz
    if (!isPostsPage && !isAdminRoot) {
      console.log("AdminGuard: Jornalista redirecionado para área de posts");
      return <Navigate to="/admin/posts" replace />;
    }
  }
  
  // Se não tem acesso à área administrativa, redirecionar para home
  if (hasPermission === false) {
    console.log("AdminGuard: Sem permissão para área administrativa, redirecionando para home");
    console.log("AdminGuard: Dados do usuário:", user);
    return <Navigate to="/" replace />;
  }
  
  console.log("AdminGuard: Permissão concedida, renderizando children");
  return <>{children}</>;
};