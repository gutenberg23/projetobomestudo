import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, FileText, KanbanSquare, BarChart3, Building2, FileBadge, Newspaper } from "lucide-react";
import { Estatisticas } from "./types";

interface StatCardsProps {
  estatisticas: Estatisticas;
}

export const StatCards: React.FC<StatCardsProps> = ({ estatisticas }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalUsuarios}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 mr-1">+{estatisticas.novosUsuariosMes}</span>
            usuários novos neste mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Editais Verticalizados</CardTitle>
          <FileBadge className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalEditaisVerticalizados}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Conteúdos organizados por edital
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cursos</CardTitle>
          <GraduationCap className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalCursos}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {estatisticas.totalDisciplinas} disciplinas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aulas e Tópicos</CardTitle>
          <BookOpen className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalAulas}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {estatisticas.totalTopicos} tópicos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questões</CardTitle>
          <FileText className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalQuestoes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {estatisticas.totalCadernos} cadernos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concursos</CardTitle>
          <Building2 className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalConcursos}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Simulados</CardTitle>
          <KanbanSquare className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalSimulados}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blog</CardTitle>
          <Newspaper className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.totalPostsBlog}</div>
        </CardContent>
      </Card>
    </div>
  );
};
