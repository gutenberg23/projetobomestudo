
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { ReceitaData, PlanosData, Estatisticas } from "./types";

interface ReceitaTabProps {
  dadosReceita: ReceitaData[];
  dadosPlanos: PlanosData[];
  estatisticas: Estatisticas;
}

export const ReceitaTab: React.FC<ReceitaTabProps> = ({
  dadosReceita,
  dadosPlanos,
  estatisticas
}) => {
  // Filtramos apenas os planos mensal e anual
  const planosFiltrados = dadosPlanos.filter(plano => 
    plano.name === "Mensal" || plano.name === "Anual"
  );
  
  const COLORS = ['#5f2ebe', '#0088FE'];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.receitaTotal}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <TrendingUp className="h-4 w-4" />
                {estatisticas.crescimentoReceita}
              </span>
              comparado ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
            <Calendar className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.receitaMensal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção Próximo Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.projecaoProximoMes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              baseado na tendência atual
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita Anual</CardTitle>
          <CardDescription>
            Comparação de receita total e receita mensal recorrente (MRR)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosReceita}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={value => ['R$ ' + value.toLocaleString('pt-BR')]} labelFormatter={label => 'Mês: ' + label} />
              <Legend />
              <Bar dataKey="receita" name="Receita Total" fill="#5f2ebe" />
              <Bar dataKey="mrr" name="MRR" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Distribuição por Planos</CardTitle>
          <CardDescription>
            Comparação entre assinantes com planos Mensal e Anual
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={planosFiltrados} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="value" 
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {planosFiltrados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={value => [`${value}%`, 'Porcentagem']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
