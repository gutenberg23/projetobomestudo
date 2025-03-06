import React from "react";
import { UserData } from "./types";
interface UserStatsProps {
  usuarios: UserData[];
}
const UserStats: React.FC<UserStatsProps> = ({
  usuarios
}) => {
  // Cálculo de estatísticas
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.status === "ativo").length;
  const usuariosInativos = usuarios.filter(u => u.status === "inativo").length;
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-[#272f3c] mb-2">Total de Usuários</h3>
        <p className="text-3xl font-bold text-primary-DEFAULT">{totalUsuarios}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-[#272f3c] mb-2">Usuários Ativos</h3>
        <p className="text-3xl font-bold text-green-500">{usuariosAtivos}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-[#272f3c] mb-2">Usuários Inativos</h3>
        <p className="text-3xl font-bold text-red-500">{usuariosInativos}</p>
      </div>
    </div>;
};
export default UserStats;