
import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  HelpCircle,
  Calendar,
  BookOpen,
  FolderTree,
  BookMarked,
  Layers,
  Folders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      path: "/admin/posts", 
      label: "Posts", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      path: "/admin/anuncios", 
      label: "Anúncios", 
      icon: <MessageSquare className="w-5 h-5" /> 
    },
    { 
      path: "/admin/usuarios", 
      label: "Usuários", 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      path: "/admin/questoes", 
      label: "Questões", 
      icon: <HelpCircle className="w-5 h-5" /> 
    },
    { 
      path: "/admin/simulados", 
      label: "Simulados", 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      path: "/admin/edital", 
      label: "Edital Verticalizado", 
      icon: <BookOpen className="w-5 h-5" /> 
    },
    { 
      path: "/admin/topicos", 
      label: "Tópicos", 
      icon: <FolderTree className="w-5 h-5" /> 
    },
    { 
      path: "/admin/aulas", 
      label: "Aulas", 
      icon: <BookMarked className="w-5 h-5" /> 
    },
    { 
      path: "/admin/disciplinas", 
      label: "Disciplinas", 
      icon: <Layers className="w-5 h-5" /> 
    },
    { 
      path: "/admin/cursos", 
      label: "Cursos", 
      icon: <Folders className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="flex h-screen bg-[#f6f8fa] font-inter">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen",
          collapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!collapsed && (
            <Link to="/admin" className="text-xl font-bold text-[#272f3c]">
              Admin
            </Link>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-md transition-colors",
                    location.pathname === item.path 
                      ? "bg-[#fce7fc] text-[#f11ce3]"
                      : "text-[#67748a] hover:bg-gray-100",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link 
            to="/" 
            className={cn(
              "flex items-center text-[#67748a] hover:text-[#f11ce3] transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {!collapsed && <span>Voltar ao site</span>}
            {collapsed && <span className="text-sm">Voltar</span>}
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
