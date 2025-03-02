
import React from "react";
import { UserData } from "./types";
import { User } from "lucide-react";
import UserCard from "./UserCard";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface UserListProps {
  usuarios: UserData[];
  onEdit: (usuario: UserData) => void;
  onChangePassword: (usuario: UserData) => void;
  onSendMessage: (usuario: UserData) => void;
  onViewHistory: (usuario: UserData) => void;
  onChangeStatus: (id: string, status: "ativo" | "inativo") => void;
  onDelete: (usuario: UserData) => void;
}

const UserList: React.FC<UserListProps> = ({
  usuarios,
  onEdit,
  onChangePassword,
  onSendMessage,
  onViewHistory,
  onChangeStatus,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead>Assinante</TableHead>
            <TableHead>Início da Assinatura</TableHead>
            <TableHead>Término da Assinatura</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <UserCard
                key={usuario.id}
                usuario={usuario}
                onEdit={onEdit}
                onChangePassword={onChangePassword}
                onSendMessage={onSendMessage}
                onViewHistory={onViewHistory}
                onChangeStatus={onChangeStatus}
                onDelete={onDelete}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="text-center">
                  <User className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium text-[#272f3c]">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-sm text-[#67748a]">Não encontramos usuários com os filtros aplicados.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
