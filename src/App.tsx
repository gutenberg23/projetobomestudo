import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetSenha from "./pages/ResetSenha";
import { CourseLayout } from "./components/course/CourseLayout";
import Explore from "./pages/Explore";
import MyCourses from "./pages/MyCourses";
import Questions from "./pages/Questions";
import Settings from "./pages/Settings";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AuthorPosts from "./pages/AuthorPosts";
import NotFound from "./pages/NotFound";
import TermosEPoliticas from "./pages/TermosEPoliticas";
import { AuthProvider } from "./contexts/AuthContext";
import Simulado from "./pages/Simulado";
import QuestionBooks from "./pages/QuestionBooks";
import QuestionBookDetails from "./pages/QuestionBookDetails";
import { ConfigGuard } from './components/guards/ConfigGuard';
import { useSiteConfig } from "./hooks/useSiteConfig";
import { useEffect } from "react";
import "./styles/globals.css";

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/posts";
import Usuarios from "./pages/admin/Usuarios";
import Questoes from "./pages/admin/Questoes";
import Simulados from "./pages/admin/Simulados";
import Edital from "./pages/admin/Edital";
import Topicos from "./pages/admin/Topicos";
import Aulas from "./pages/admin/Aulas";
import Disciplinas from "./pages/admin/Disciplinas";
import Cursos from "./pages/admin/Cursos";
import Professores from "./pages/admin/Professores";
import ConfiguracoesSite from "./pages/admin/ConfiguracoesSite";
import Kanban from "./pages/admin/Kanban";

// Componente para aplicar as configurações de estilo
const SiteConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { config, isLoading } = useSiteConfig();

  useEffect(() => {
    if (!isLoading) {
      // Aplicar classe para estilo de botões
      document.documentElement.classList.remove(
        'rounded-button-style', 
        'square-button-style', 
        'pill-button-style'
      );
      document.documentElement.classList.add(`${config.visual.buttonStyle}-button-style`);

      // Aplicar modo escuro se habilitado
      if (config.visual.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    }
  }, [config, isLoading]);

  return <>{children}</>;
};

// Importante: criar a instância do QueryClient dentro do componente
const App = () => {
  // Instância do queryClient dentro do componente para garantir que seja criada
  // durante a renderização do componente e não durante a inicialização do módulo
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <SiteConfigProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                  <Route path="/reset-password" element={<ResetSenha />} />
                  <Route path="/course/:courseId" element={<CourseLayout />} />
                  
                  <Route path="/explore" element={
                    <ConfigGuard configKey="showExplorePage">
                      <Explore />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/my-courses" element={
                    <ConfigGuard configKey="showMyCoursesPage">
                      <MyCourses />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/questions" element={
                    <ConfigGuard configKey="showQuestionsPage">
                      <Questions />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/cadernos" element={
                    <ConfigGuard configKey="showQuestionsPage">
                      <QuestionBooks />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/cadernos/:id" element={
                    <ConfigGuard configKey="showQuestionsPage">
                      <QuestionBookDetails />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/settings" element={<Settings />} />
                  
                  <Route path="/blog" element={
                    <ConfigGuard configKey="showBlogPage">
                      <Blog />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/blog/autor/:author" element={
                    <ConfigGuard configKey="showBlogPage">
                      <AuthorPosts />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/blog/:slug" element={
                    <ConfigGuard configKey="showBlogPage">
                      <BlogPost />
                    </ConfigGuard>
                  } />
                  
                  <Route path="/termos-e-politicas" element={<TermosEPoliticas />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="kanban" element={<Kanban />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="questoes" element={<Questoes />} />
                    <Route path="simulados" element={<Simulados />} />
                    <Route path="edital" element={<Edital />} />
                    <Route path="topicos" element={<Topicos />} />
                    <Route path="aulas" element={<Aulas />} />
                    <Route path="disciplinas" element={<Disciplinas />} />
                    <Route path="cursos" element={<Cursos />} />
                    <Route path="professores" element={<Professores />} />
                    <Route path="configuracoes" element={<ConfiguracoesSite />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/simulado/:simuladoId" element={<Simulado />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SiteConfigProvider>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
