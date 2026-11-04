import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserData } from "./types";

const iniciais = (nome: string, email: string) => {
  const partes = (nome || email || "?").trim().split(/\s+/);
  return ((partes[0]?.[0] || "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase() || "?";
};

export const AvatarUsuario: React.FC<{ usuario: Pick<UserData, "nome" | "email" | "fotoPerfil">; className?: string }> = ({ usuario, className }) => (
  <Avatar className={cn("h-9 w-9 shrink-0", className)}>
    {usuario.fotoPerfil && <AvatarImage src={usuario.fotoPerfil} alt="" />}
    <AvatarFallback className="bg-[#5f2ebe]/10 text-xs font-semibold text-[#5f2ebe]">{iniciais(usuario.nome, usuario.email)}</AvatarFallback>
  </Avatar>
);
