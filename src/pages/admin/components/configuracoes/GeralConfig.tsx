import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GeralConfig = () => {
  const { config, isLoading, updateGeneralConfig, hasTableError } = useSiteConfig();
  const [siteName, setSiteName] = useState(config.general.siteName);
  const [contactEmail, setContactEmail] = useState(config.general.contactEmail);
  const [supportEmail, setSupportEmail] = useState(config.general.supportEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(config.general.whatsappNumber);
  const [footerText, setFooterText] = useState(config.general.footerText);
  const [enableRegistration, setEnableRegistration] = useState(config.general.enableRegistration);
  const [enableComments, setEnableComments] = useState(config.general.enableComments);
  const [maintenanceMode, setMaintenanceMode] = useState(config.general.maintenanceMode);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  useEffect(() => {
    if (!isLoading) {
      setSiteName(config.general.siteName);
      setContactEmail(config.general.contactEmail);
      setSupportEmail(config.general.supportEmail);
      setWhatsappNumber(config.general.whatsappNumber);
      setFooterText(config.general.footerText);
      setEnableRegistration(config.general.enableRegistration);
      setEnableComments(config.general.enableComments);
      setMaintenanceMode(config.general.maintenanceMode);
    }
  }, [config, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const generalConfig = {
        siteName,
        contactEmail,
        supportEmail,
        whatsappNumber,
        footerText,
        enableRegistration,
        enableComments,
        maintenanceMode
      };
      
      await updateGeneralConfig(generalConfig);
      
      toast.success('Configurações gerais atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const formatWhatsAppNumber = (input: string) => {
    // Remove todos os caracteres não numéricos
    const numbersOnly = input.replace(/\D/g, '');
    
    // Formata o número de acordo com o padrão brasileiro
    if (numbersOnly.length <= 2) {
      return numbersOnly;
    } else if (numbersOnly.length <= 7) {
      return `${numbersOnly.slice(0, 2)} ${numbersOnly.slice(2)}`;
    } else if (numbersOnly.length <= 11) {
      return `${numbersOnly.slice(0, 2)} ${numbersOnly.slice(2, 7)} ${numbersOnly.slice(7)}`;
    } else {
      return `${numbersOnly.slice(0, 2)} ${numbersOnly.slice(2, 7)} ${numbersOnly.slice(7, 11)} ${numbersOnly.slice(11)}`;
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatWhatsAppNumber(value);
    setWhatsappNumber(formattedValue);
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
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações Gerais</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Configure informações básicas, contatos e comportamentos gerais do site
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
      
      <Tabs defaultValue="informacoes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="informacoes">Informações do Site</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="comportamento">Comportamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="informacoes" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nome do Site</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="BomEstudo"
              />
              <p className="text-xs text-[#67748a]">
                Nome principal usado para identificar o site
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="footer-text">Texto do Rodapé</Label>
              <Textarea
                id="footer-text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© BomEstudo. Todos os direitos reservados."
                rows={3}
              />
              <p className="text-xs text-[#67748a]">
                Texto exibido no rodapé do site, incluindo informações de copyright
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="contato" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email de Contato</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contato@bomestudo.com.br"
              />
              <p className="text-xs text-[#67748a]">
                Email exibido nas páginas de contato e rodapé
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support-email">Email de Suporte</Label>
              <Input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="suporte@bomestudo.com.br"
              />
              <p className="text-xs text-[#67748a]">
                Email para suporte técnico e problemas com a plataforma
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
              <Input
                id="whatsapp-number"
                value={whatsappNumber}
                onChange={handleWhatsappChange}
                placeholder="55 11 99999 9999"
              />
              <p className="text-xs text-[#67748a]">
                Número para contato via WhatsApp (incluir código do país e DDD)
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="comportamento" className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor="enable-registration">Habilitar Registro</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Quando desativado, novos usuários não poderão se registrar na plataforma
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-[#67748a] text-xs">
                  Permite que novos usuários criem contas
                </p>
              </div>
              <Switch
                id="enable-registration"
                checked={enableRegistration}
                onCheckedChange={setEnableRegistration}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor="enable-comments">Habilitar Comentários</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Quando desativado, usuários não poderão comentar em publicações do blog e aulas
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-[#67748a] text-xs">
                  Permite comentários nas páginas do site
                </p>
              </div>
              <Switch
                id="enable-comments"
                checked={enableComments}
                onCheckedChange={setEnableComments}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor="maintenance-mode" className="text-amber-700">Modo de Manutenção</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[220px] text-xs">
                          Quando ativado, exibe um banner de manutenção em todas as páginas. Use com cuidado!
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-amber-600 text-xs">
                  Avisa aos usuários que o site está em manutenção
                </p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </Card>
          
          {maintenanceMode && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="text-amber-500 w-5 h-5 mt-0.5 mr-2" />
                <div>
                  <p className="text-amber-800 text-sm font-medium mb-1">Atenção: Modo de Manutenção Ativado</p>
                  <p className="text-amber-700 text-xs">
                    O modo de manutenção exibirá um banner na parte superior de todas as páginas do site.
                    Isso pode afetar a experiência do usuário. Use esta opção apenas quando necessário.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default GeralConfig;
