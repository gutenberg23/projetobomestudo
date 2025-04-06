import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Exibir um indicador de carregamento enquanto verifica a autenticação
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ea2be2]"></div>
      </div>
    );
  }

  if (!user) {
    // Redirecionar para a página de login, salvando a localização atual
    // para retornar após o login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Se o usuário estiver autenticado, mostrar o conteúdo
  return <>{children}</>;
}; 