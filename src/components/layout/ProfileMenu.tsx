
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MenuIcon } from "lucide-react";

interface ProfileMenuProps {
  isMobile?: boolean;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isMobile = false }) => {
  const menuItems = [
    { label: 'Meu Perfil', href: '/perfil' },
    { label: 'Meus Cadernos de Questões', href: '/cadernos' },
    { label: 'Meus Cursos', href: '/cursos' },
    { label: 'Meu Desempenho', href: '/desempenho' },
    { label: 'Configurações', href: '/configuracoes' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {isMobile ? (
          <MenuIcon className="h-6 w-6" />
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.href} className="cursor-pointer">
            <a href={item.href} className="w-full">
              {item.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

