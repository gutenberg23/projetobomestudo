import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Upload, HelpCircle, X, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SeoConfig = () => {
  const { config, isLoading, updateSeoConfig, hasTableError } = useSiteConfig();
  const [siteTitle, setSiteTitle] = useState(config.seo.siteTitle);
  const [siteDescription, setSiteDescription] = useState(config.seo.siteDescription);
  const [siteKeywords, setSiteKeywords] = useState<string[]>(config.seo.siteKeywords);
  const [newKeyword, setNewKeyword] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState(config.seo.ogImageUrl);
  const [twitterHandle, setTwitterHandle] = useState(config.seo.twitterHandle);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(config.seo.googleAnalyticsId);
  const [enableIndexing, setEnableIndexing] = useState(config.seo.enableIndexing);
  const [structuredData, setStructuredData] = useState(config.seo.structuredData);
  const [robotsTxt, setRobotsTxt] = useState(config.seo.robotsTxt || "");
  const [isSaving, setIsSaving] = useState(false);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState(config.seo.ogImageUrl);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingSitemap, setUpdatingSitemap] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  useEffect(() => {
    if (!isLoading) {
      setSiteTitle(config.seo.siteTitle);
      setSiteDescription(config.seo.siteDescription);
      setSiteKeywords(config.seo.siteKeywords);
      setOgImageUrl(config.seo.ogImageUrl);
      setTwitterHandle(config.seo.twitterHandle);
      setGoogleAnalyticsId(config.seo.googleAnalyticsId);
      setEnableIndexing(config.seo.enableIndexing);
      setStructuredData(config.seo.structuredData);
      setOgImagePreview(config.seo.ogImageUrl);
      setRobotsTxt(config.seo.robotsTxt || "");
    }
  }, [config, isLoading]);

  // Carregar o conteúdo do robots.txt quando o componente for montado
  useEffect(() => {
    const fetchRobotsTxt = async () => {
      try {
        const response = await fetch('/robots.txt');
        if (response.ok) {
          const text = await response.text();
          setRobotsTxt(text);
        }
      } catch (error) {
        console.error('Erro ao carregar robots.txt:', error);
      }
    };

    if (!config.seo.robotsTxt) {
      fetchRobotsTxt();
    }
  }, [config.seo.robotsTxt]);

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setOgImageFile(file);
      const url = URL.createObjectURL(file);
      setOgImagePreview(url);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `og-image-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase
        .storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      throw error;
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !siteKeywords.includes(newKeyword.trim())) {
      setSiteKeywords([...siteKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSiteKeywords(siteKeywords.filter(k => k !== keyword));
  };

  const handleUpdateSitemap = async () => {
    try {
      setUpdatingSitemap(true);
      
      // Chamar o endpoint para regenerar o sitemap
      const response = await fetch('/api/update-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar sitemap');
      }
      
      toast.success('Sitemap atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar sitemap:', error);
      toast.error('Erro ao atualizar sitemap');
    } finally {
      setUpdatingSitemap(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);

      // Fazer upload da imagem OG, se existir
      let newOgImageUrl = ogImageUrl;

      if (ogImageFile) {
        setUploadingImage(true);
        try {
          newOgImageUrl = await uploadImage(ogImageFile, 'seo');
        } catch (error) {
          toast.error('Erro ao fazer upload da imagem OG');
          console.error(error);
        } finally {
          setUploadingImage(false);
        }
      }
      
      // Atualizar o arquivo robots.txt
      try {
        const response = await fetch('/api/update-robots-txt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: robotsTxt }),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar robots.txt');
        }
      } catch (error) {
        console.error('Erro ao atualizar robots.txt:', error);
        toast.error('Erro ao atualizar robots.txt');
      }
      
      const seoConfig = {
        siteTitle,
        siteDescription,
        siteKeywords,
        ogImageUrl: newOgImageUrl,
        twitterHandle,
        googleAnalyticsId,
        enableIndexing,
        structuredData,
        robotsTxt
      };
      
      await updateSeoConfig(seoConfig);
      
      toast.success('Configurações de SEO atualizadas com sucesso!');
      setOgImageFile(null);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações de SEO</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Otimize as meta tags e configurações para melhorar o posicionamento nos motores de busca
        </p>
      </div>

      {hasTableError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-2" />
            <div>
              <p className="text-red-800 text-sm font-medium mb-1">Tabela de configurações não encontrada</p>
              <p className="text-red-700 text-xs">
                As configurações estão sendo salvas apenas localmente e serão perdidas quando você recarregar a página.
                Entre em contato com o administrador do sistema para criar a tabela 'configuracoes_site' no banco de dados.
              </p>
              <p className="text-red-700 text-xs mt-2">
                <strong>Dica para o administrador:</strong> Execute o script no arquivo 'scripts/create_configuracoes_site_table.sql' 
                no painel de consultas SQL do Supabase.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site-title">Título do Site (Meta Title)</Label>
          <Input
            id="site-title"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="BomEstudo - Plataforma de estudos para concursos"
            maxLength={60}
          />
          <div className="flex justify-between">
            <p className="text-xs text-[#67748a]">
              Título usado nos resultados de busca e barra do navegador
            </p>
            <p className="text-xs text-[#67748a]">
              {siteTitle.length}/60 caracteres
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site-description">Descrição do Site (Meta Description)</Label>
          <Textarea
            id="site-description"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="Plataforma de estudos online para candidatos de concursos públicos com cursos, questões comentadas e estatísticas de desempenho."
            maxLength={160}
            rows={3}
          />
          <div className="flex justify-between">
            <p className="text-xs text-[#67748a]">
              Descrição usada nos resultados de busca
            </p>
            <p className="text-xs text-[#67748a]">
              {siteDescription.length}/160 caracteres
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="site-keywords">Palavras-chave</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Adicione palavras-chave relevantes para o conteúdo do seu site. Embora tenham menos impacto no SEO moderno, ainda são úteis.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="site-keywords"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Adicionar palavra-chave e pressionar Enter"
              onKeyDown={handleKeywordKeyDown}
            />
            <Button 
              type="button" 
              onClick={handleAddKeyword}
              variant="outline"
              size="sm"
            >
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {siteKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-[#67748a]">
            Palavras-chave relacionadas ao seu site (separadas por vírgula na meta tag)
          </p>
        </div>
      </Card>
      
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="og-image">Imagem de Open Graph</Label>
          <div className="flex items-start gap-4">
            <div 
              className="w-32 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
            >
              {ogImagePreview ? (
                <img src={ogImagePreview} alt="OG Image Preview" className="max-w-full max-h-full object-cover" />
              ) : (
                <p className="text-xs text-gray-400">Sem imagem</p>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#67748a] mb-2">
                Imagem exibida quando o link do site é compartilhado nas redes sociais (recomendado: 1200x630px)
              </p>
              <div className="flex gap-2">
                <label htmlFor="og-image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium">
                    <Upload size={14} /> Selecionar imagem
                  </div>
                  <input
                    id="og-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageChange}
                    className="hidden"
                  />
                </label>
                {uploadingImage && <Spinner size="sm" />}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter-handle">Twitter Handle</Label>
          <Input
            id="twitter-handle"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@bomestudo"
          />
          <p className="text-xs text-[#67748a]">
            Nome de usuário no Twitter para atribuição em cards compartilhados
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ga-id">ID do Google Analytics</Label>
          <Input
            id="ga-id"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            placeholder="G-XXXXXXXXXX ou UA-XXXXXXXX-X"
          />
          <p className="text-xs text-[#67748a]">
            Código de acompanhamento do Google Analytics
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="enable-indexing">Permitir Indexação</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Quando desativado, o site não será indexado pelos motores de busca
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[#67748a] text-xs">
              Permite que motores de busca indexem seu site
            </p>
          </div>
          <Switch
            id="enable-indexing"
            checked={enableIndexing}
            onCheckedChange={setEnableIndexing}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="structured-data">Dados Estruturados</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[220px] text-xs">
                      Adiciona markup Schema.org para melhorar a exibição nos resultados de busca
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[#67748a] text-xs">
              Habilita dados estruturados (Schema.org)
            </p>
          </div>
          <Switch
            id="structured-data"
            checked={structuredData}
            onCheckedChange={setStructuredData}
          />
        </div>
      </Card>
      
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="robots-txt">Arquivo Robots.txt</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[220px] text-xs">
                    Este arquivo instrui os motores de busca sobre quais páginas do seu site podem ser indexadas.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="robots-txt"
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="User-agent: *\nDisallow: /admin/\nAllow: /"
          />
          <p className="text-xs text-[#67748a]">
            Edite as instruções para os motores de busca. Por padrão, todas as páginas administrativas (/admin/) estão bloqueadas.
          </p>
        </div>
      </Card>
      
      {!enableIndexing && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 w-5 h-5 mt-0.5 mr-2" />
            <div>
              <p className="text-amber-800 text-sm font-medium mb-1">Atenção: Indexação Desativada</p>
              <p className="text-amber-700 text-xs">
                Seu site não será indexado pelos motores de busca enquanto esta opção estiver desativada.
                Isso significa que seu site não aparecerá em resultados de pesquisa.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Atualizar Sitemap</Label>
          <p className="text-xs text-[#67748a] mb-4">
            Clique no botão abaixo para regenerar o sitemap com os posts de blog e cadernos de questões atuais.
          </p>
          <Button 
            type="button" 
            onClick={handleUpdateSitemap}
            disabled={updatingSitemap}
          >
            {updatingSitemap ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Atualizar Sitemap Agora'
            )}
          </Button>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default SeoConfig;
