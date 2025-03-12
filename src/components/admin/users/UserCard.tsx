
import React from "react";
import { UserData } from "./types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, CheckSquare, XSquare, Key, Bell, History, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

interface UserCardProps {
  usuario: UserData;
  onEdit: (usuario: UserData) => void;
  onChangePassword: (usuario: UserData) => void;
  onSendMessage: (usuario: UserData) => void;
  onViewHistory: (usuario: UserData) => void;
  onViewNotes: (usuario: UserData) => void;
  onChangeStatus: (id: string, status: "ativo" | "inativo") => void;
  onDelete: (usuario: UserData) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  usuario,
  onEdit,
  onChangePassword,
  onSendMessage,
  onViewHistory,
  onViewNotes,
  onChangeStatus,
  onDelete
}) => {
  return (
    <TableRow key={usuario.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={usuario.fotoPerfil} />
            <AvatarFallback className="bg-[#5f2ebe] text-white">
              {usuario.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{usuario.nome}</div>
            <div className="text-sm text-[#67748a]">{usuario.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${usuario.tipo === 'administrador' ? 'bg-purple-100 text-purple-800' : usuario.tipo === 'professor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {usuario.tipo === 'administrador' ? 'Admin' : usuario.tipo === 'professor' ? 'Professor' : 'Aluno'}
        </span>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${usuario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </span>
      </TableCell>
      <TableCell>{usuario.dataCadastro}</TableCell>
      <TableCell>{usuario.ultimoLogin}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${usuario.assinante ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {usuario.assinante ? 'Sim' : 'Não'}
        </span>
      </TableCell>
      <TableCell>{usuario.assinante ? usuario.inicioAssinatura : '-'}</TableCell>
      <TableCell>{usuario.assinante ? usuario.terminoAssinatura : '-'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(usuario)}>
            <Edit size={16} />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onChangePassword(usuario)}>
            <Key size={16} />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onViewNotes(usuario)}>
            <StickyNote size={16} />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => onViewHistory(usuario)}>
            <History size={16} />
          </Button>
          
          <Button variant={usuario.status === 'ativo' ? 'outline' : 'default'} size="sm" className={usuario.status === 'ativo' ? '' : 'bg-green-600 hover:bg-green-700'} onClick={() => onChangeStatus(usuario.id, usuario.status === 'ativo' ? 'inativo' : 'ativo')}>
            {usuario.status === 'ativo' ? <XSquare size={16} /> : <CheckSquare size={16} />}
          </Button>
          
          <Button variant="destructive" size="sm" onClick={() => onDelete(usuario)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserCard;
