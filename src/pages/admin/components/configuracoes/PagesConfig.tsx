import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";

const PagesConfig = () => {
  const { config, isLoading, updatePagesConfig, hasTableError } = useSiteConfig();
  const [showBlogPage, setShowBlogPage] = useState(config.pages.showBlogPage);
  const [showQuestionsPage, setShowQuestionsPage] = useState(config.pages.showQuestionsPage);
  const [showExplorePage, setShowExplorePage] = useState(config.pages.showExplorePage);
  const [showMyCoursesPage, setShowMyCoursesPage] = useState(config.pages.showMyCoursesPage);
  const [showQuestionBooksPage, setShowQuestionBooksPage] = useState(config.pages.showQuestionBooksPage);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar estados locais quando as configurações forem carregadas
  React.useEffect(() => {
    if (!isLoading) {
      setShowBlogPage(config.pages.showBlogPage);
      setShowQuestionsPage(config.pages.showQuestionsPage);
      setShowExplorePage(config.pages.showExplorePage);
      setShowMyCoursesPage(config.pages.showMyCoursesPage);
      setShowQuestionBooksPage(config.pages.showQuestionBooksPage);
    }
  }, [config, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const pagesConfig = {
        showBlogPage,
        showQuestionsPage,
        showExplorePage,
        showMyCoursesPage,
        showQuestionBooksPage
      };
      
      await updatePagesConfig(pagesConfig);
      
      toast.success('Configurações de visibilidade das páginas atualizadas com sucesso!');
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
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações de Visibilidade de Páginas</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Ative ou desative a visibilidade das páginas principais no site
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
          <h3 className="text-md font-medium text-[#272f3c]">Controle de Páginas</h3>
          <p className="text-sm text-[#67748a]">
            Quando desativada, a página não ficará visível para o usuário na navegação principal
          </p>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="blog-page">Página do Blog</Label>
                <p className="text-[#67748a] text-xs">
                  Controla a visibilidade da página de Blog
                </p>
              </div>
              <Switch
                id="blog-page"
                checked={showBlogPage}
                onCheckedChange={setShowBlogPage}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="questions-page">Página de Questões</Label>
                <p className="text-[#67748a] text-xs">
                  Controla a visibilidade da página de Questões
                </p>
              </div>
              <Switch
                id="questions-page"
                checked={showQuestionsPage}
                onCheckedChange={setShowQuestionsPage}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="explore-page">Página de Explorar</Label>
                <p className="text-[#67748a] text-xs">
                  Controla a visibilidade da página de Explorar
                </p>
              </div>
              <Switch
                id="explore-page"
                checked={showExplorePage}
                onCheckedChange={setShowExplorePage}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="my-courses-page">Página de Meus Cursos</Label>
                <p className="text-[#67748a] text-xs">
                  Controla a visibilidade da página de Meus Cursos
                </p>
              </div>
              <Switch
                id="my-courses-page"
                checked={showMyCoursesPage}
                onCheckedChange={setShowMyCoursesPage}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="question-books-page">Página de Cadernos de Questões</Label>
                <p className="text-[#67748a] text-xs">
                  Controla a visibilidade da página de Cadernos de Questões
                </p>
              </div>
              <Switch
                id="question-books-page"
                checked={showQuestionBooksPage}
                onCheckedChange={setShowQuestionBooksPage}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <p className="text-amber-800 text-sm">
            <strong>Atenção:</strong> Desativar uma página a tornará inacessível para os usuários.
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

export default PagesConfig; 