
import React, { useState } from "react";
import { Search, Menu, User, FileText, Compass, BookOpen, Settings, LogOut, Newspaper } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "/lovable-uploads/logo.svg";
import { Input } from "../ui/input";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm min-h-[88px] w-full flex items-center justify-between flex-wrap border-b border-[rgba(247,248,250,1)] fixed top-0 left-0 z-50 px-4 md:px-8">
      <div className="flex min-h-[88px] flex-col items-center justify-center">
        <Link to="/">
          <img loading="lazy" src={logo} alt="BomEstudo" className="h-12 object-contain" />
        </Link>
      </div>

      {/* Search Bar - Desktop only */}
      <form 
        onSubmit={handleSearch} 
        className="hidden md:flex bg-slate-50 border items-center gap-2 max-w-[400px] w-auto px-5 py-[11px] rounded-[5px] border-[rgba(237,240,245,1)] mx-8 flex-1"
      >
        <input 
          type="text" 
          placeholder="Pesquisar Concurso" 
          className="flex-1 bg-transparent text-[15px] text-[#262f3c] outline-none min-w-[200px]" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
        <button 
          type="submit" 
          className="bg-white border flex items-center justify-center w-7 h-7 rounded-[3px] border-[rgba(238,241,246,1)]"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Navigation Links - Desktop only */}
      <div className="hidden md:flex items-center space-x-6">
        <Link 
          to="/questions" 
          className="flex items-center gap-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors"
        >
          <span className="font-extralight">Questões</span>
        </Link>
        <Link 
          to="/blog" 
          className="flex items-center gap-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors"
        >
          <span className="font-extralight">Blog</span>
        </Link>
        <Link 
          to="/explore" 
          className="flex items-center gap-1 bg-[#5f2ebe] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
        >
          <span className="font-light">Estude Grátis</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 ml-4">
        {!user ? (
          <Button variant="outline" onClick={() => navigate("/login")} className="mr-2">
            Entrar
          </Button>
        ) : null}

        <Popover>
          <PopoverTrigger asChild>
            <button className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white cursor-pointer ${!user ? 'hidden' : ''}`}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 border border-gray-100">
            {user ? (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-[50px] h-[50px] border-2 border-white">
                    <AvatarImage src={user.foto_perfil || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{user.nome ? user.nome.substring(0, 2).toUpperCase() : "US"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{user.nome || "Usuário"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <nav className="flex flex-col">
              {/* Mobile only navigation links */}
              <div className="md:hidden border-b border-gray-100">
                {/* Mobile Search Form */}
                <form onSubmit={handleSearch} className="px-4 py-3">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Pesquisar Concurso" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="w-full pr-8"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </form>
                
                <Link to="/questions" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Questões
                </Link>
                
                <Link to="/blog" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  Blog
                </Link>
                
                <Link to="/explore" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Estude Grátis
                </Link>
              </div>
              
              {/* Common navigation links for both mobile and desktop */}
              <Link to="/my-courses" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Meus Cursos
              </Link>
              
              <Link to="/settings" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
              
              {user ? (
                <div className="border-t border-gray-100">
                  <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm font-light text-red-600 hover:bg-slate-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              ) : null}
            </nav>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
