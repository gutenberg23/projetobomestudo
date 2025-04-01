import React from "react";
import { Navigate } from "react-router-dom";
import { useSiteConfig, PagesConfig } from "@/hooks/useSiteConfig";

type ConfigGuardProps = {
  configKey: keyof PagesConfig;
  children: React.ReactNode;
};

export const ConfigGuard: React.FC<ConfigGuardProps> = ({ configKey, children }) => {
  const { config, isLoading } = useSiteConfig();
  
  // Enquanto estiver carregando, mostra um componente vazio para não realizar redirecionamentos incorretos
  if (isLoading) {
    return null;
  }
  
  // Verificar se a página está habilitada
  const isEnabled = config.pages[configKey];
  
  if (!isEnabled) {
    // Se a página estiver desabilitada, redireciona para a página inicial
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}; 