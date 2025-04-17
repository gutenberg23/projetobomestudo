import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TabsConfig {
  showDisciplinasTab: boolean;
  showEditalTab: boolean;
  showSimuladosTab: boolean;
  showCicloTab: boolean;
}

export interface PagesConfig {
  showBlogPage: boolean;
  showQuestionsPage: boolean;
  showExplorePage: boolean;
  showMyCoursesPage: boolean;
  showQuestionBooksPage: boolean;
  showCommentRankingPage: boolean;
  showQuestionRankingPage: boolean;
  showSimuladoRankingPage: boolean;
}

export interface FooterLink {
  id: string;
  text: string;
  url: string;
}

export interface FooterConfig {
  navegacao: FooterLink[];
  concurso: FooterLink[];
  contato: FooterLink[];
}

interface VisualConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  darkMode: boolean;
}

interface GeneralConfig {
  siteName: string;
  contactEmail: string;
  supportEmail: string;
  whatsappNumber: string;
  footerText: string;
  enableRegistration: boolean;
  enableComments: boolean;
  maintenanceMode: boolean;
}

interface SeoConfig {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  ogImageUrl: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  enableIndexing: boolean;
  structuredData: boolean;
  robotsTxt: string;
}

interface SiteConfig {
  tabs: TabsConfig;
  pages: PagesConfig;
  visual: VisualConfig;
  general: GeneralConfig;
  seo: SeoConfig;
  footer: FooterConfig;
}

// Valores padrão enquanto a tabela não existe
const DEFAULT_CONFIG: SiteConfig = {
  tabs: {
    showDisciplinasTab: true,
    showEditalTab: true,
    showSimuladosTab: true,
    showCicloTab: true,
  },
  pages: {
    showBlogPage: true,
    showQuestionsPage: true, 
    showExplorePage: true,
    showMyCoursesPage: true,
    showQuestionBooksPage: true,
    showCommentRankingPage: true,
    showQuestionRankingPage: true,
    showSimuladoRankingPage: true
  },
  visual: {
    primaryColor: '#5f2ebe',
    secondaryColor: '#272f3c',
    accentColor: '#f97316',
    logoUrl: '/lovable-uploads/logo.svg',
    faviconUrl: '/favicon.ico',
    fontFamily: 'Inter, sans-serif',
    buttonStyle: 'rounded',
    darkMode: false
  },
  general: {
    siteName: 'BomEstudo',
    contactEmail: 'contato@bomestudo.com.br',
    supportEmail: 'suporte@bomestudo.com.br',
    whatsappNumber: '5511999999999',
    footerText: '© BomEstudo. Todos os direitos reservados.',
    enableRegistration: true,
    enableComments: true,
    maintenanceMode: false
  },
  seo: {
    siteTitle: 'BomEstudo - Plataforma de estudos para concursos',
    siteDescription: 'Plataforma de estudos online para candidatos de concursos públicos com cursos, questões comentadas e estatísticas de desempenho.',
    siteKeywords: ['concursos', 'estudos', 'questões', 'cursos', 'preparatório'],
    ogImageUrl: '/images/og-image.jpg',
    twitterHandle: '@bomestudo',
    googleAnalyticsId: '',
    enableIndexing: true,
    structuredData: true,
    robotsTxt: ''
  },
  footer: {
    navegacao: [
      { id: '1', text: 'Home', url: '/' },
      { id: '2', text: 'Explorar', url: '/explore' },
      { id: '3', text: 'Meus Cursos', url: '/my-courses' },
      { id: '4', text: 'Questões', url: '/questions' }
    ],
    concurso: [
      { id: '1', text: 'Banco do Brasil', url: '#' },
      { id: '2', text: 'Concurso INSS', url: '#' },
      { id: '3', text: 'Concurso Receita Federal', url: '#' },
      { id: '4', text: 'Concurso Caixa', url: '#' }
    ],
    contato: [
      { id: '1', text: 'WhatsApp', url: '#' },
      { id: '2', text: 'Email', url: 'mailto:contato@bomestudo.com.br' }
    ]
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

// Função auxiliar para verificar se uma string é um JSON válido
const isValidJSON = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  if (str === '[object Object]') return false;
  
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Função para tentar parsear JSON com segurança
const safeJSONParse = (str: any, defaultValue: any = {}) => {
  if (!str) return defaultValue;
  if (typeof str === 'object') return str; // Já é um objeto, não precisa parse
  
  if (isValidJSON(str)) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('Erro ao fazer parse de JSON:', e);
      return defaultValue;
    }
  }
  
  return defaultValue;
};

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
      // Buscar todas as configurações
      const { data, error: fetchError } = await supabase
        .from('configuracoes_site')
        .select('*');
      
      // Verificar se temos um erro de "tabela não existe"
      if (fetchError && (
          fetchError.code === '42P01' || // Postgres table not found
          fetchError.message?.toLowerCase().includes('not exist') ||
          fetchError.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao buscar configurações:', fetchError);
        console.warn('A tabela configuracoes_site não existe. Usando valores padrão.');
        logTableError(fetchError);
        hasTableError = true;
        setConfig(DEFAULT_CONFIG);
        return;
      } else if (fetchError) {
        console.error('Erro ao buscar configurações:', fetchError);
        setError(new Error('Erro ao buscar configurações'));
        return;
      }
      
      // Configuração padrão inicial
      let newConfig = { ...DEFAULT_CONFIG };

      if (data && data.length > 0) {
        // Processar os dados retornados
        for (const item of data) {
          try {
            if (item.chave === 'tabs_course' && item.valor) {
              const tabsSettings = typeof item.valor === 'string' && isValidJSON(item.valor) 
                ? JSON.parse(item.valor) 
                : (typeof item.valor === 'object' ? item.valor : {});
              
              newConfig.tabs = {
                showDisciplinasTab: tabsSettings.showDisciplinasTab ?? true,
                showEditalTab: tabsSettings.showEditalTab ?? true,
                showSimuladosTab: tabsSettings.showSimuladosTab ?? true,
                showCicloTab: tabsSettings.showCicloTab ?? true
              };
            } 
            else if (item.chave === 'pages_visibility' && item.valor) {
              const pagesSettings = safeJSONParse(item.valor, {});
              
              newConfig.pages = {
                showBlogPage: pagesSettings.showBlogPage ?? true,
                showQuestionsPage: pagesSettings.showQuestionsPage ?? true,
                showExplorePage: pagesSettings.showExplorePage ?? true,
                showMyCoursesPage: pagesSettings.showMyCoursesPage ?? true,
                showQuestionBooksPage: pagesSettings.showQuestionBooksPage ?? true,
                showCommentRankingPage: pagesSettings.showCommentRankingPage ?? true,
                showQuestionRankingPage: pagesSettings.showQuestionRankingPage ?? true,
                showSimuladoRankingPage: pagesSettings.showSimuladoRankingPage ?? true
              };
            }
            else if (item.chave === 'visual_config' && item.valor) {
              const visualSettings = safeJSONParse(item.valor, {});
              
              newConfig.visual = {
                ...newConfig.visual,
                ...visualSettings
              };
            }
            else if (item.chave === 'general_config' && item.valor) {
              const generalSettings = safeJSONParse(item.valor, {});
              
              newConfig.general = {
                ...newConfig.general,
                ...generalSettings
              };
            }
            else if (item.chave === 'seo_config' && item.valor) {
              const seoSettings = safeJSONParse(item.valor, {});
              
              newConfig.seo = {
                ...newConfig.seo,
                ...seoSettings,
                siteKeywords: seoSettings.siteKeywords || DEFAULT_CONFIG.seo.siteKeywords
              };
            }
            else if (item.chave === 'footer_config' && item.valor) {
              const footerSettings = safeJSONParse(item.valor, {});
              
              newConfig.footer = {
                ...newConfig.footer,
                ...footerSettings
              };
            }
          } catch (e) {
            console.error(`Erro ao processar configurações de ${item.chave}:`, e);
            if (isMounted.current) {
              setError(new Error(`Erro ao processar configurações de ${item.chave}`));
            }
          }
        }
      }
      
      // Atualizar estado e cache global
      if (isMounted.current) {
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = now;
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
  }, []);

  const updateTabsConfig = useCallback(async (tabsConfig: TabsConfig) => {
    if (!tabsConfig) return false;
    
    const updatedTabsConfig = {
      ...config.tabs,
      ...tabsConfig
    };
    
    try {
      const tabsConfigJson = JSON.stringify(updatedTabsConfig);
      
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'tabs_course',
          valor: tabsConfigJson,
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
          tabs: updatedTabsConfig
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
        tabs: updatedTabsConfig
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

  const updatePagesConfig = useCallback(async (pagesConfig: PagesConfig) => {
    if (!pagesConfig) return false;
    
    const updatedPagesConfig = {
      ...config.pages,
      ...pagesConfig
    };
    
    try {
      const pagesConfigJson = JSON.stringify(updatedPagesConfig);
      
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'pages_visibility',
          valor: pagesConfigJson,
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao salvar configurações de páginas:', error);
        console.warn('A tabela configuracoes_site não existe. As configurações serão salvas apenas localmente.');
        logTableError(error);
        hasTableError = true;
        
        // Mesmo sem a tabela, atualiza o estado local
        const newConfig = {
          ...config,
          pages: updatedPagesConfig
        };
        
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = Date.now();
        
        return true;
      } else if (error) {
        console.error('Erro ao salvar configurações de páginas:', error);
        throw new Error('Erro ao salvar configurações de páginas');
      }
      
      // Atualizar estado e cache global
      const newConfig = {
        ...config,
        pages: updatedPagesConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de páginas:', error);
      throw error;
    }
  }, [config]);

  const updateVisualConfig = useCallback(async (visualConfig: Partial<VisualConfig>) => {
    if (!visualConfig) return false;
    
    const updatedVisualConfig = {
      ...config.visual,
      ...visualConfig
    };
    
    try {
      const visualConfigJson = JSON.stringify(updatedVisualConfig);
      
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'visual_config',
          valor: visualConfigJson,
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao salvar configurações visuais:', error);
        console.warn('A tabela configuracoes_site não existe. As configurações serão salvas apenas localmente.');
        logTableError(error);
        hasTableError = true;
        
        // Mesmo sem a tabela, atualiza o estado local
        const newConfig = {
          ...config,
          visual: updatedVisualConfig
        };
        
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = Date.now();
        
        return true;
      } else if (error) {
        console.error('Erro ao salvar configurações visuais:', error);
        throw new Error('Erro ao salvar configurações visuais');
      }
      
      // Atualizar estado e cache global e aplicar as mudanças visuais
      const newConfig = {
        ...config,
        visual: updatedVisualConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      // Aplicar mudanças visuais na raiz do documento
      applyVisualChanges(updatedVisualConfig);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações visuais:', error);
      throw error;
    }
  }, [config]);

  const updateGeneralConfig = useCallback(async (generalConfig: Partial<GeneralConfig>) => {
    if (!generalConfig) return false;
    
    const updatedGeneralConfig = {
      ...config.general,
      ...generalConfig
    };
    
    try {
      const generalConfigJson = JSON.stringify(updatedGeneralConfig);
      
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'general_config',
          valor: generalConfigJson,
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao salvar configurações gerais:', error);
        console.warn('A tabela configuracoes_site não existe. As configurações serão salvas apenas localmente.');
        logTableError(error);
        hasTableError = true;
        
        // Mesmo sem a tabela, atualiza o estado local
        const newConfig = {
          ...config,
          general: updatedGeneralConfig
        };
        
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = Date.now();
        
        return true;
      } else if (error) {
        console.error('Erro ao salvar configurações gerais:', error);
        throw new Error('Erro ao salvar configurações gerais');
      }
      
      // Atualizar estado e cache global
      const newConfig = {
        ...config,
        general: updatedGeneralConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      // Aplicar mudanças gerais no site
      if (updatedGeneralConfig.maintenanceMode) {
        // Adicionar banner de manutenção
        addMaintenanceBanner();
      } else {
        // Remover banner de manutenção se existir
        removeMaintenanceBanner();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      throw error;
    }
  }, [config]);

  const updateSeoConfig = useCallback(async (seoConfig: Partial<SeoConfig>) => {
    if (!seoConfig) return false;
    
    const updatedSeoConfig = {
      ...config.seo,
      ...seoConfig
    };
    
    try {
      const seoConfigJson = JSON.stringify(updatedSeoConfig);
      
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          chave: 'seo_config',
          valor: seoConfigJson,
          updated_at: new Date().toISOString()
        }, { onConflict: 'chave' });
      
      // Verificar se temos um erro de "tabela não existe"
      if (error && (
          error.code === '42P01' || // Postgres table not found
          error.message?.toLowerCase().includes('not exist') ||
          error.message?.toLowerCase().includes('não existe')
      )) {
        console.error('Erro ao salvar configurações de SEO:', error);
        console.warn('A tabela configuracoes_site não existe. As configurações serão salvas apenas localmente.');
        logTableError(error);
        hasTableError = true;
        
        // Mesmo sem a tabela, atualiza o estado local
        const newConfig = {
          ...config,
          seo: updatedSeoConfig
        };
        
        setConfig(newConfig);
        globalConfigCache = newConfig;
        lastFetchTime = Date.now();
        
        return true;
      } else if (error) {
        console.error('Erro ao salvar configurações de SEO:', error);
        throw new Error('Erro ao salvar configurações de SEO');
      }
      
      // Atualizar estado e cache global
      const newConfig = {
        ...config,
        seo: updatedSeoConfig
      };
      
      setConfig(newConfig);
      globalConfigCache = newConfig;
      lastFetchTime = Date.now();
      
      // Aplicar mudanças de SEO nas meta tags
      applySeoChanges(updatedSeoConfig);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de SEO:', error);
      throw error;
    }
  }, [config]);

  const updateFooterConfig = useCallback(
    async (footerConfig: FooterConfig) => {
      if (hasTableError) {
        // Se a tabela não existe, apenas atualiza o estado local
        setConfig(prevConfig => ({
          ...prevConfig,
          footer: footerConfig
        }));
        return;
      }

      try {
        const { error } = await supabase
          .from('configuracoes_site')
          .upsert({
            chave: 'footer_config',
            valor: JSON.stringify(footerConfig),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'chave'
          });

        if (error) throw error;

        // Atualiza o cache global e o estado local
        setConfig(prevConfig => {
          const newConfig = {
            ...prevConfig,
            footer: footerConfig
          };
          globalConfigCache = newConfig;
          return newConfig;
        });

        lastFetchTime = Date.now();
      } catch (err) {
        console.error('Erro ao atualizar configurações do footer:', err);
        throw err;
      }
    },
    [hasTableError, setConfig]
  );

  // Funções auxiliares para aplicar as configurações
  const applyVisualChanges = (visualConfig: VisualConfig) => {
    // Aplicar variáveis CSS para cores
    document.documentElement.style.setProperty('--primary-color', visualConfig.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', visualConfig.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', visualConfig.accentColor);
    
    // Aplicar fonte
    document.documentElement.style.setProperty('--font-family', visualConfig.fontFamily);
    
    // Aplicar modo escuro se necessário
    if (visualConfig.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Atualizar favicon
    const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = visualConfig.faviconUrl;
    }
  };
  
  const applySeoChanges = (seoConfig: SeoConfig) => {
    // Atualizar meta tags SEO
    document.title = seoConfig.siteTitle;
    
    // Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoConfig.siteDescription);
    
    // Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoConfig.siteKeywords.join(', '));
    
    // Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', seoConfig.siteTitle);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', seoConfig.siteDescription);
    
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', seoConfig.ogImageUrl);
    
    // Twitter
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');
    
    let twitterSite = document.querySelector('meta[name="twitter:site"]');
    if (!twitterSite) {
      twitterSite = document.createElement('meta');
      twitterSite.setAttribute('name', 'twitter:site');
      document.head.appendChild(twitterSite);
    }
    twitterSite.setAttribute('content', seoConfig.twitterHandle);
    
    // Robots (indexação)
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', seoConfig.enableIndexing ? 'index, follow' : 'noindex, nofollow');
    
    // Google Analytics
    if (seoConfig.googleAnalyticsId && !document.getElementById('ga-script')) {
      const gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seoConfig.googleAnalyticsId}`;
      document.head.appendChild(gaScript);
      
      const gaConfigScript = document.createElement('script');
      gaConfigScript.id = 'ga-config';
      gaConfigScript.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seoConfig.googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfigScript);
    }
  };
  
  const addMaintenanceBanner = () => {
    if (!document.getElementById('maintenance-banner')) {
      const banner = document.createElement('div');
      banner.id = 'maintenance-banner';
      banner.style.backgroundColor = '#fff3cd';
      banner.style.color = '#856404';
      banner.style.padding = '0.75rem 1.25rem';
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.right = '0';
      banner.style.zIndex = '9999';
      banner.style.textAlign = 'center';
      banner.style.fontWeight = 'bold';
      banner.textContent = 'Site em manutenção. Algumas funções podem não estar disponíveis.';
      document.body.prepend(banner);
      
      // Ajustar padding do body para acomodar o banner
      document.body.style.paddingTop = '50px';
    }
  };
  
  const removeMaintenanceBanner = () => {
    const banner = document.getElementById('maintenance-banner');
    if (banner) {
      banner.remove();
      document.body.style.paddingTop = '0';
    }
  };

  // Efeito para buscar dados na montagem do componente
  useEffect(() => {
    fetchConfig();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchConfig]);

  // Efeito para aplicar as configurações visuais quando carregadas
  useEffect(() => {
    if (!isLoading && config) {
      applyVisualChanges(config.visual);
      applySeoChanges(config.seo);
      
      if (config.general.maintenanceMode) {
        addMaintenanceBanner();
      }
    }
    
    return () => {
      // Cleanup do banner de manutenção
      removeMaintenanceBanner();
    };
  }, [isLoading, config]);

  return {
    config,
    isLoading,
    error,
    fetchConfig: () => fetchConfig(true), // Forçar atualização
    updateTabsConfig,
    updatePagesConfig,
    updateVisualConfig,
    updateGeneralConfig,
    updateSeoConfig,
    updateFooterConfig,
    hasTableError
  };
}; 