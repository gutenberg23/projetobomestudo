
import React from "react";
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

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/posts";
import Anuncios from "./pages/admin/Anuncios";
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

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/reset-password" element={<ResetSenha />} />
              <Route path="/course/:courseId" element={<CourseLayout />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/autor/:author" element={<AuthorPosts />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/termos-e-politicas" element={<TermosEPoliticas />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<Posts />} />
                <Route path="anuncios" element={<Anuncios />} />
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
