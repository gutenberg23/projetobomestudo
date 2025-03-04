
import React from "react";
import { TeacherData } from "./types";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { UsersRound, UserCheck, ClockIcon, FileBadge } from "lucide-react";

interface TeacherStatsProps {
  teachers: TeacherData[];
}

const TeacherStats: React.FC<TeacherStatsProps> = ({ teachers }) => {
  // Calcular estatísticas
  const totalProfessores = teachers.length;
  const professoresAprovados = teachers.filter(t => t.status === 'aprovado').length;
  const professoresPendentes = teachers.filter(t => t.status === 'pendente').length;
  const disciplinasUnicas = new Set(teachers.map(t => t.disciplina)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="text-[#67748a]">Total de Professores</CardDescription>
              <CardTitle className="text-3xl font-bold text-[#022731]">{totalProfessores}</CardTitle>
            </div>
            <div className="p-3 rounded-full bg-[#e8f1f3]">
              <UsersRound className="h-6 w-6 text-[#2a8e9e]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="text-[#67748a]">Professores Aprovados</CardDescription>
              <CardTitle className="text-3xl font-bold text-[#022731]">{professoresAprovados}</CardTitle>
            </div>
            <div className="p-3 rounded-full bg-[#e8f1f3]">
              <UserCheck className="h-6 w-6 text-[#2a8e9e]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="text-[#67748a]">Pendentes de Aprovação</CardDescription>
              <CardTitle className="text-3xl font-bold text-[#022731]">{professoresPendentes}</CardTitle>
            </div>
            <div className="p-3 rounded-full bg-[#e8f1f3]">
              <ClockIcon className="h-6 w-6 text-[#2a8e9e]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="text-[#67748a]">Disciplinas Cobertas</CardDescription>
              <CardTitle className="text-3xl font-bold text-[#022731]">{disciplinasUnicas}</CardTitle>
            </div>
            <div className="p-3 rounded-full bg-[#e8f1f3]">
              <FileBadge className="h-6 w-6 text-[#2a8e9e]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStats;
