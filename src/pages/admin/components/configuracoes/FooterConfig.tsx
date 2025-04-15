import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FooterLink,
  FooterConfig as FooterConfigType 
} from "@/hooks/useSiteConfig";
import { nanoid } from "nanoid";

const FooterConfig = () => {
  const { config, isLoading, updateFooterConfig, hasTableError } = useSiteConfig();
  const [footerLinks, setFooterLinks] = useState<FooterConfigType>(config.footer);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  useEffect(() => {
    if (!isLoading) {
      setFooterLinks(config.footer);
    }
  }, [config, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      await updateFooterConfig(footerLinks);
      toast.success('Configurações do footer atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações do footer:', error);
      toast.error('Erro ao salvar configurações do footer');
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = (category: keyof FooterConfigType) => {
    setFooterLinks(prev => ({
      ...prev,
      [category]: [
        ...prev[category],
        { id: nanoid(), text: '', url: '' }
      ]
    }));
  };

  const removeLink = (category: keyof FooterConfigType, id: string) => {
    setFooterLinks(prev => ({
      ...prev,
      [category]: prev[category].filter(link => link.id !== id)
    }));
  };

  const updateLink = (category: keyof FooterConfigType, id: string, field: keyof FooterLink, value: string) => {
    setFooterLinks(prev => ({
      ...prev,
      [category]: prev[category].map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
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
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações do Footer</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Personalize os links do rodapé do site que serão exibidos na página principal
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
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="navegacao" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="navegacao">Navegação</TabsTrigger>
          <TabsTrigger value="concurso">Concurso</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
        </TabsList>
        
        <TabsContent value="navegacao" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Links de Navegação</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addLink('navegacao')}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Link
                </Button>
              </div>
              
              {footerLinks.navegacao.map((link, index) => (
                <div key={link.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`nav-text-${link.id}`}>Texto</Label>
                    <Input
                      id={`nav-text-${link.id}`}
                      value={link.text}
                      onChange={(e) => updateLink('navegacao', link.id, 'text', e.target.value)}
                      placeholder="Home"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`nav-url-${link.id}`}>URL</Label>
                    <Input
                      id={`nav-url-${link.id}`}
                      value={link.url}
                      onChange={(e) => updateLink('navegacao', link.id, 'url', e.target.value)}
                      placeholder="/"
                    />
                  </div>
                  
                  <div className="pt-8">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeLink('navegacao', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {footerLinks.navegacao.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum link adicionado. Clique em "Adicionar Link" para começar.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="concurso" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Links de Concursos</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addLink('concurso')}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Link
                </Button>
              </div>
              
              {footerLinks.concurso.map((link, index) => (
                <div key={link.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`concurso-text-${link.id}`}>Texto</Label>
                    <Input
                      id={`concurso-text-${link.id}`}
                      value={link.text}
                      onChange={(e) => updateLink('concurso', link.id, 'text', e.target.value)}
                      placeholder="Banco do Brasil"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`concurso-url-${link.id}`}>URL</Label>
                    <Input
                      id={`concurso-url-${link.id}`}
                      value={link.url}
                      onChange={(e) => updateLink('concurso', link.id, 'url', e.target.value)}
                      placeholder="/concursos/banco-do-brasil"
                    />
                  </div>
                  
                  <div className="pt-8">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeLink('concurso', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {footerLinks.concurso.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum link adicionado. Clique em "Adicionar Link" para começar.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="contato" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Links de Contato</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addLink('contato')}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Link
                </Button>
              </div>
              
              {footerLinks.contato.map((link, index) => (
                <div key={link.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`contato-text-${link.id}`}>Texto</Label>
                    <Input
                      id={`contato-text-${link.id}`}
                      value={link.text}
                      onChange={(e) => updateLink('contato', link.id, 'text', e.target.value)}
                      placeholder="WhatsApp"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`contato-url-${link.id}`}>URL</Label>
                    <Input
                      id={`contato-url-${link.id}`}
                      value={link.url}
                      onChange={(e) => updateLink('contato', link.id, 'url', e.target.value)}
                      placeholder="https://wa.me/5511999999999"
                    />
                  </div>
                  
                  <div className="pt-8">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeLink('contato', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {footerLinks.contato.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum link adicionado. Clique em "Adicionar Link" para começar.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default FooterConfig; 