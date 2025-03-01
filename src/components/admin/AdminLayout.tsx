
import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  Users, 
  HelpCircle, 
  BookOpen, 
  BookIcon, 
  ScrollText, 
  LayoutList, 
  GraduationCap, 
  LayoutDashboard, 
  MessageSquareText, 
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const AdminLayout = () => {
  const location = useLocation();
  const isAdmin = true; // Aqui deve ter uma verificação real se o usuário é administrador

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Posts", icon: FileText, path: "/admin/posts" },
    { label: "Anúncios", icon: MessageSquareText, path: "/admin/anuncios" },
    { label: "Usuários", icon: Users, path: "/admin/usuarios" },
    { label: "Questões", icon: HelpCircle, path: "/admin/questoes" },
    { label: "Simulados", icon: ScrollText, path: "/admin/simulados" },
    { label: "Edital Verticalizado", icon: LayoutList, path: "/admin/edital" },
    { label: "Tópicos", icon: BookOpen, path: "/admin/topicos" },
    { label: "Aulas", icon: BookIcon, path: "/admin/aulas" },
    { label: "Disciplinas", icon: GraduationCap, path: "/admin/disciplinas" },
    { label: "Cursos", icon: BarChart3, path: "/admin/cursos" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] font-inter">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm hidden md:block">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#272f3c]">BomEstudo Admin</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-[#fce7fc] text-[#ea2be2]"
                      : "text-[#67748a] hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-[#272f3c]">BomEstudo Admin</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao site
              </Link>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex p-2 border-t border-gray-100">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors min-w-[80px]",
                  location.pathname === item.path
                    ? "bg-[#fce7fc] text-[#ea2be2]"
                    : "text-[#67748a] hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="hidden md:flex items-center justify-between p-4 bg-white shadow-sm">
          <h1 className="text-xl font-bold text-[#272f3c]">
            {menuItems.find((item) => item.path === location.pathname)?.label || "Painel Administrativo"}
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao site
            </Link>
          </Button>
        </div>
        <main className="p-4 pt-32 md:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
