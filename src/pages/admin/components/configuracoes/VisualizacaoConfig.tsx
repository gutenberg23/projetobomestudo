import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Upload, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const VisualizacaoConfig = () => {
  const { config, isLoading, updateVisualConfig, hasTableError } = useSiteConfig();
  const [primaryColor, setPrimaryColor] = useState(config.visual.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(config.visual.secondaryColor);
  const [accentColor, setAccentColor] = useState(config.visual.accentColor);
  const [logoUrl, setLogoUrl] = useState(config.visual.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(config.visual.faviconUrl);
  const [fontFamily, setFontFamily] = useState(config.visual.fontFamily);
  const [buttonStyle, setButtonStyle] = useState(config.visual.buttonStyle);
  const [darkMode, setDarkMode] = useState(config.visual.darkMode);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(config.visual.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState(config.visual.faviconUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  useEffect(() => {
    if (!isLoading) {
      setPrimaryColor(config.visual.primaryColor);
      setSecondaryColor(config.visual.secondaryColor);
      setAccentColor(config.visual.accentColor);
      setLogoUrl(config.visual.logoUrl);
      setFaviconUrl(config.visual.faviconUrl);
      setFontFamily(config.visual.fontFamily);
      setButtonStyle(config.visual.buttonStyle);
      setDarkMode(config.visual.darkMode);
      setLogoPreview(config.visual.logoUrl);
      setFaviconPreview(config.visual.faviconUrl);
    }
  }, [config, isLoading]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const url = URL.createObjectURL(file);
      setFaviconPreview(url);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);

      // Fazer upload dos arquivos, se existirem
      let newLogoUrl = logoUrl;
      let newFaviconUrl = faviconUrl;

      if (logoFile) {
        setUploadingLogo(true);
        try {
          newLogoUrl = await uploadImage(logoFile, 'site');
        } catch (error) {
          toast.error('Erro ao fazer upload do logotipo');
          console.error(error);
        } finally {
          setUploadingLogo(false);
        }
      }

      if (faviconFile) {
        setUploadingFavicon(true);
        try {
          newFaviconUrl = await uploadImage(faviconFile, 'site');
        } catch (error) {
          toast.error('Erro ao fazer upload do favicon');
          console.error(error);
        } finally {
          setUploadingFavicon(false);
        }
      }
      
      const visualConfig = {
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl: newLogoUrl,
        faviconUrl: newFaviconUrl,
        fontFamily,
        buttonStyle,
        darkMode
      };
      
      await updateVisualConfig(visualConfig);
      
      toast.success('Configurações visuais atualizadas com sucesso!');
      setLogoFile(null);
      setFaviconFile(null);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPrimaryColor('#5f2ebe');
    setSecondaryColor('#272f3c');
    setAccentColor('#f97316');
    setLogoUrl(config.visual.logoUrl);
    setFaviconUrl(config.visual.faviconUrl);
    setFontFamily('Inter, sans-serif');
    setButtonStyle('rounded');
    setDarkMode(false);
    setLogoPreview(config.visual.logoUrl);
    setFaviconPreview(config.visual.faviconUrl);
    setLogoFile(null);
    setFaviconFile(null);
    
    toast.info('Valores restaurados para o padrão. Clique em Salvar para aplicar as mudanças.');
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
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Personalização Visual</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Ajuste as cores, fonte e elementos visuais da plataforma
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
      
      <Tabs defaultValue="cores" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cores">Cores</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="tipografia">Tipografia</TabsTrigger>
          <TabsTrigger value="outros">Outros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cores" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
                  placeholder="#5f2ebe"
              />
            </div>
            <p className="text-xs text-[#67748a]">
                Cor principal utilizada em botões, links e elementos destacados
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1"
                  placeholder="#272f3c"
              />
            </div>
            <p className="text-xs text-[#67748a]">
                Cor utilizada em textos e elementos secundários
            </p>
          </div>

          <div className="space-y-2">
              <Label htmlFor="accent-color">Cor de Destaque</Label>
            <div className="flex gap-2">
              <Input
                  id="accent-color"
                type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1"
                  placeholder="#f97316"
              />
            </div>
            <p className="text-xs text-[#67748a]">
                Cor utilizada para elementos de destaque e notificações
            </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-3">Visualização das Cores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className="h-14 rounded-md flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primária
              </div>
              <div 
                className="h-14 rounded-md flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Secundária
              </div>
              <div 
                className="h-14 rounded-md flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: accentColor }}
              >
                Destaque
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Exemplos</h4>
              <div className="space-y-3">
                <button 
                  className="px-4 py-2 text-white rounded-md font-medium"
                  style={{ backgroundColor: primaryColor }}
                  type="button"
                >
                  Botão Primário
                </button>
                
                <div 
                  className="p-3 rounded-md"
                  style={{ backgroundColor: secondaryColor, color: 'white' }}
                >
                  <p className="text-sm">Texto com cor secundária</p>
                </div>
                
                <div 
                  className="p-3 rounded-md"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  <p className="text-sm">Alertas e notificações</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="imagens" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logotipo do Site</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
                  >
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#67748a] mb-2">
                      Upload de um novo logotipo (PNG ou SVG recomendado)
                    </p>
                    <div className="flex gap-2">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium">
                          <Upload size={14} /> Selecionar arquivo
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      {uploadingLogo && <Spinner size="sm" />}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favicon-upload">Favicon do Site</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border"
                  >
                    {faviconPreview && (
                      <img src={faviconPreview} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#67748a] mb-2">
                      Upload de um novo favicon (ICO, PNG ou SVG)
                    </p>
                    <div className="flex gap-2">
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium">
                          <Upload size={14} /> Selecionar arquivo
                        </div>
                        <input
                          id="favicon-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                      </label>
                      {uploadingFavicon && <Spinner size="sm" />}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tipografia" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Família de Fonte</Label>
              <Select 
                value={fontFamily} 
                onValueChange={setFontFamily}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                  <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                  <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#67748a]">
                Fonte utilizada em todo o site
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-3">Visualização da Fonte</h3>
              <div className="space-y-4" style={{ fontFamily }}>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold">Título Principal</h4>
                  <p className="text-sm">Este é um exemplo de texto com a fonte {fontFamily.split(',')[0]}. Veja como a tipografia aparece em diferentes tamanhos e pesos.</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-base font-medium">Subtítulo em peso médio</h5>
                  <p className="text-sm">Texto de parágrafo em tamanho normal. A tipografia é um elemento crucial no design de interfaces e afeta diretamente a experiência do usuário.</p>
                  <p className="text-xs text-[#67748a]">Texto pequeno em cor secundária para descrições e legendas.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="outros" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-[#67748a] text-xs">
                  Habilitar tema escuro na plataforma
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="button-style">Estilo de Botões</Label>
              <Select 
                value={buttonStyle} 
                onValueChange={(value: 'rounded' | 'square' | 'pill') => setButtonStyle(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Arredondado</SelectItem>
                  <SelectItem value="square">Quadrado</SelectItem>
                  <SelectItem value="pill">Pílula</SelectItem>
                </SelectContent>
              </Select>
            <p className="text-xs text-[#67748a]">
                Estilo aplicado aos botões e formulários
            </p>
        </div>

            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-3">Visualização dos Estilos</h3>
              <div className="flex gap-3">
                <button 
                  className={`px-4 py-2 text-white font-medium bg-blue-600`}
                  style={{ 
                    borderRadius: 
                      buttonStyle === 'rounded' ? '0.375rem' : 
                      buttonStyle === 'pill' ? '9999px' : '0',
                  }}
                  type="button"
                >
                  Botão de Exemplo
                </button>
                
                <input 
                  type="text" 
                  className="border px-3 py-2"
                  style={{ 
                    borderRadius: 
                      buttonStyle === 'rounded' ? '0.375rem' : 
                      buttonStyle === 'pill' ? '9999px' : '0',
                  }}
                  placeholder="Input de exemplo"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex justify-between">
        <Button 
          type="button" 
          onClick={resetToDefaults}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Restaurar Padrões
        </Button>
        <Button type="submit" disabled={isLoading || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default VisualizacaoConfig;
