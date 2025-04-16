import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";

const CourseConfig = () => {
  const { config, isLoading, updateTabsConfig, hasTableError } = useSiteConfig();
  const [showDisciplinasTab, setShowDisciplinasTab] = useState(config.tabs.showDisciplinasTab);
  const [showEditalTab, setShowEditalTab] = useState(config.tabs.showEditalTab);
  const [showSimuladosTab, setShowSimuladosTab] = useState(config.tabs.showSimuladosTab);
  const [showCicloTab, setShowCicloTab] = useState(config.tabs.showCicloTab);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  React.useEffect(() => {
    if (!isLoading) {
      setShowDisciplinasTab(config.tabs.showDisciplinasTab);
      setShowEditalTab(config.tabs.showEditalTab);
      setShowSimuladosTab(config.tabs.showSimuladosTab);
      setShowCicloTab(config.tabs.showCicloTab);
    }
  }, [config, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const tabsConfig = {
        showDisciplinasTab,
        showEditalTab,
        showSimuladosTab,
        showCicloTab
      };
      
      await updateTabsConfig(tabsConfig);
      
      toast.success('Configurações de visibilidade das abas atualizadas com sucesso!');
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
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações de Visibilidade do Curso</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Ative ou desative a visibilidade das abas na página de curso
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
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-md font-medium text-[#272f3c]">Controle de Abas</h3>
          <p className="text-sm text-[#67748a]">
            Quando desativada, a aba não ficará visível para o usuário na página do curso
          </p>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="disciplinas-tab">Aba de Disciplinas</Label>
                <p className="text-[#67748a] text-xs">
                  Mostra a lista de disciplinas e aulas do curso
                </p>
              </div>
              <Switch
                id="disciplinas-tab"
                checked={showDisciplinasTab}
                onCheckedChange={setShowDisciplinasTab}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edital-tab">Aba de Edital</Label>
                <p className="text-[#67748a] text-xs">
                  Mostra o edital verticalizado do curso
                </p>
              </div>
              <Switch
                id="edital-tab"
                checked={showEditalTab}
                onCheckedChange={setShowEditalTab}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="simulados-tab">Aba de Simulados</Label>
                <p className="text-[#67748a] text-xs">
                  Mostra os simulados disponíveis para o curso
                </p>
              </div>
              <Switch
                id="simulados-tab"
                checked={showSimuladosTab}
                onCheckedChange={setShowSimuladosTab}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ciclo-tab">Aba de Ciclo</Label>
                <p className="text-[#67748a] text-xs">
                  Permite a criação e gestão do ciclo de estudos personalizado
                </p>
              </div>
              <Switch
                id="ciclo-tab"
                checked={showCicloTab}
                onCheckedChange={setShowCicloTab}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <p className="text-amber-800 text-sm">
            <strong>Atenção:</strong> Desativar uma aba tornará seu conteúdo inacessível para os usuários.
            Certifique-se de que esta é a ação desejada antes de prosseguir.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default CourseConfig; 