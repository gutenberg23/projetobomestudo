
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, UserMinus, Percent, ArrowUpRight } from "lucide-react";
import { Estatisticas } from "./types";

interface StatCardsProps {
  estatisticas: Estatisticas;
}

export const StatCards: React.FC<StatCardsProps> = ({ estatisticas }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
          <Users className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.assinantesAtivos}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="text-green-500 flex items-center mr-1">
              <ArrowUpRight className="h-4 w-4" />
              {estatisticas.crescimentoAssinantes}
            </span>
            comparado ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Assinantes</CardTitle>
          <UserPlus className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.novosAssinantes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            neste mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
          <UserMinus className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.assinantesCancelados}</div>
          <p className="text-xs text-muted-foreground mt-1">
            neste mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
          <Percent className="h-4 w-4 text-[#5f2ebe]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.taxaCancelamento}</div>
          <Progress value={4.2} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};
