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
  isLoading?: boolean;
  onEdit: (usuario: UserData) => void;
  onViewHistory: (usuario: UserData) => void;
  onViewNotes: (usuario: UserData) => void;
  onChangeStatus: (id: string, status: "ativo" | "inativo") => void;
  onDelete: (usuario: UserData) => void;
}

const UserList: React.FC<UserListProps> = ({
  usuarios,
  isLoading = false,
  onEdit,
  onViewHistory,
  onViewNotes,
  onChangeStatus,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-8">
        <div className="text-center">
          <div className="animate-pulse flex space-x-4 items-center justify-center">
            <div className="rounded-full bg-slate-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 max-w-md">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
          <p className="mt-4 text-[#67748a]">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Informações</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Cadastrado em</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Início Premium</TableHead>
            <TableHead>Término Premium</TableHead>
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
                onViewHistory={onViewHistory}
                onViewNotes={onViewNotes}
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
