
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, BookOpen, GraduationCap, LineChart, Settings } from 'lucide-react';

interface ProfileMenuProps {
  isMobile?: boolean;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isMobile = false }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isMobile ? (
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        ) : (
          <button className="rounded-full hover:opacity-80">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Meus Cadernos de Questões</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          <span>Meus Cursos</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <LineChart className="w-4 h-4" />
          <span>Meu Desempenho</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
