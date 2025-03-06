
import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  LogOut, 
  User, 
  BookOpen, 
  HelpCircle,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const ProfileMenu = () => {
  const { user, profile, signOut } = useAuth();
  
  // Nome para exibição e iniciais para o avatar
  const displayName = profile?.nome || user?.email?.split("@")[0] || "Usuário";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  
  const roleLabel = () => {
    switch (profile?.role) {
      case "admin":
        return "Administrador";
      case "professor":
        return "Professor";
      case "aluno":
        return "Aluno";
      default:
        return "Aluno";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.foto_perfil || ""} alt={displayName} />
            <AvatarFallback className="bg-[#ea2be2] text-white">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs font-medium text-[#ea2be2]">
              {roleLabel()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/my-courses" className="cursor-pointer flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Meus cursos</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/questions" className="cursor-pointer flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Questões</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Meu perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        {profile?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Painel admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer flex items-center text-red-600 focus:text-red-600"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
