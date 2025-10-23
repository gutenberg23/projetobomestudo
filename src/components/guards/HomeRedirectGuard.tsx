import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HomeRedirectGuardProps {
  children: React.ReactNode;
}

export const HomeRedirectGuard: React.FC<HomeRedirectGuardProps> = ({ 
  children 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Exibir um indicador de carregamento enquanto verifica a autenticação
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ea2be2]"></div>
      </div>
    );
  }

  // Se o usuário estiver autenticado, redirecionar para o blog
  if (user) {
    return <Navigate to="/blog" replace />;
  }

  // Se o usuário não estiver autenticado, mostrar o conteúdo (página inicial)
  return <>{children}</>;
};