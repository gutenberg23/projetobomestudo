
import React, { useState } from "react";
import { Search, Menu, User, FileText, Compass, BookOpen, Settings, LogOut, Newspaper, Trophy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "/lovable-uploads/logo.svg";
export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  return <header className="bg-white/90 backdrop-blur-sm min-h-[88px] w-full flex items-center justify-between flex-wrap border-b border-[rgba(247,248,250,1)] fixed top-0 left-0 z-50 px-0">
      <div className="flex min-h-[88px] flex-col items-stretch justify-center w-[230px] py-[21px]">
        <Link to="/">
          <img loading="lazy" src={logo} alt="Company Logo" className="aspect-[8.06] w-[230px] md:w-[230px] w-[120px] object-contain" />
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6 mr-6">
        <Link to="/blog" className="flex items-center gap-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors">
          <Newspaper className="w-4 h-4 px-px" />
          <span className="font-extralight">Blog</span>
        </Link>
        <Link to="/questions" className="flex items-center gap-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors">
          <FileText className="w-4 h-4" />
          <span className="font-extralight">Questões</span>
        </Link>
        <Link to="/explore" className="flex items-center gap-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors">
          <Trophy className="w-4 h-4" />
          <span className="font-extralight">Estude Grátis</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <form onSubmit={handleSearch} className="bg-slate-50 border flex items-center gap-2 max-w-[400px] w-auto px-5 py-[11px] rounded-[5px] border-[rgba(237,240,245,1)] mr-4 hidden md:flex">
          <input type="text" placeholder="Pesquisar" className="flex-1 bg-transparent text-[15px] text-[#262f3c] outline-none min-w-[200px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <button type="submit" className="bg-white border flex items-center justify-center w-7 h-7 rounded-[3px] border-[rgba(238,241,246,1)]">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {!user ? <Button variant="outline" onClick={() => navigate("/login")} className="mr-2">
            Entrar
          </Button> : null}

        <Popover>
          <PopoverTrigger asChild>
            <button className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white cursor-pointer ${!user ? 'hidden' : ''}`}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 border border-gray-100">
            {user ? <div className="p-4 border-b border-gray-100">
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
              </div> : null}
            <nav className="flex flex-col">
              <Link to="/my-courses" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Meus Cursos
              </Link>
              <Link to="/settings" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
              <div className="md:hidden border-t border-gray-100">
                <Link to="/blog" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  Blog
                </Link>
                <Link to="/questions" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Questões
                </Link>
                <Link to="/explore" className="px-4 py-3 text-sm font-light text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe] flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Estude Grátis
                </Link>
              </div>
              {user ? <div className="border-t border-gray-100">
                  <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm font-light text-red-600 hover:bg-slate-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div> : null}
            </nav>
          </PopoverContent>
        </Popover>
      </div>
    </header>;
};
