import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TabsConfig {
  showDisciplinasTab: boolean;
  showEditalTab: boolean;
  showSimuladosTab: boolean;
}

interface SiteConfig {
  tabs: TabsConfig;
}

// Valores padrão enquanto a tabela não existe
const DEFAULT_CONFIG: SiteConfig = {
  tabs: {
    showDisciplinasTab: true,
    showEditalTab: true,
    showSimuladosTab: true,
  }
};

// Função para registrar erros específicos de tabela não encontrada
const logTableError = (error: any) => {
  // Criar ou obter elemento para armazenar mensagens de erro
  let errorElement = document.querySelector('.console-error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'console-error-message';
    (errorElement as HTMLElement).style.display = 'none';
    document.body.appendChild(errorElement);
  }
  
  // Adicionar mensagem ao elemento
  if (
    error.code === '42P01' || // Postgres table not found
    error.message?.toLowerCase().includes('not exist') ||
    error.message?.toLowerCase().includes('não existe')
  ) {
    errorElement.textContent = `Error: relation "public.configuracoes_site" does not exist`;
  }
};

// Cache global para compartilhar entre instâncias do hook
let globalConfigCache: SiteConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto
let hasTableError = false; // Flag para controlar erros de tabela inexistente

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(
    globalConfigCache || DEFAULT_CONFIG
  );
  const [isLoading, setIsLoading] = useState(!globalConfigCache);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchConfig = useCallback(async (force = false) => {
    // Se já temos a informação que a tabela não existe, não tenta buscar novamente
    if (hasTableError) {
      setConfig(DEFAULT_CONFIG);
      setIsLoading(false);
      return;
    }

    // Se temos um cache válido e não é forçado, usar o cache
    const now = Date.now();
    if (!force && globalConfigCache && (now - lastFetchTime < CACHE_TTL)) {
      setConfig(globalConfigCache);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar configurações de visibilidade das abas
      const { data, error } = await supabase
        .from('configuracoes_site')
        .select('*')
        .eq('chave', 'tabs_course')
        .maybeSingle();
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao buscar configurações:', error);
        console.warn('A tabela configuracoes_site não existe. Usando valores padrão.');
        logTableError(error);
        hasTableError = true;
        setConfig(DEFAULT_CONFIG);
        return;
      } else if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', error);
        setError(new Error('Erro ao buscar configurações'));
        return;
      }
      
      // Se encontrar dados, atualizar a visibilidade
      if (data && data.valor) {
        try {
          const settings = JSON.parse(data.valor);
          const newConfig = {
            ...config,
            tabs: {
              showDisciplinasTab: settings.showDisciplinasTab ?? true,
              showEditalTab: settings.showEditalTab ?? true,
              showSimuladosTab: settings.showSimuladosTab ?? true
            }
          };
          
          // Atualizar estado e cache global
          if (isMounted.current) {
            setConfig(newConfig);
            globalConfigCache = newConfig;
            lastFetchTime = now;
          }
        } catch (e) {
          console.error('Erro ao processar configurações:', e);
          if (isMounted.current) {
            setError(new Error('Erro ao processar configurações'));
          }
        }
      } else {
        // Se não encontrou dados, mas a tabela existe, usar valores padrão
        setConfig(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      if (isMounted.current) {
        setError(new Error('Erro ao buscar configurações'));
      }
      setConfig(DEFAULT_CONFIG);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [config]);

  const updateTabsConfig = useCallback(async (tabsConfig: TabsConfig) => {
    // Se a tabela não existe, apenas atualiza o estado local
    if (hasTableError) {
      const newConfig = {
        ...config,
        tabs: tabsConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      console.log('ATENÇÃO: A tabela configuracoes_site não existe. As configurações não estão sendo salvas no banco de dados.');
      console.log('Execute o script SQL para criar a tabela ou entre em contato com o administrador.');
      
      return true;
    }

    try {
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'tabs_course',
          valor: JSON.stringify(tabsConfig),
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao salvar configurações:', error);
        console.warn('A tabela configuracoes_site não existe. As configurações serão salvas apenas localmente.');
        logTableError(error);
        hasTableError = true;
        
        // Mesmo sem a tabela, atualiza o estado local
        const newConfig = {
          ...config,
          tabs: tabsConfig
        };
        
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = Date.now();
        
        return true;
      } else if (error) {
        console.error('Erro ao salvar configurações:', error);
        throw new Error('Erro ao salvar configurações');
      }
      
      // Atualizar estado e cache global
      const newConfig = {
        ...config,
        tabs: tabsConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }, [config]);

  // Efeito para buscar dados na montagem do componente
  useEffect(() => {
    fetchConfig();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    fetchConfig: () => fetchConfig(true), // Forçar atualização
    updateTabsConfig,
    hasTableError
  };
}; 