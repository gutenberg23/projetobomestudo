
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from "recharts";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Calendar, TrendingUp, Ticket } from "lucide-react";
import { ReceitaData, PlanosData, CupomData, Estatisticas } from "./types";

interface ReceitaTabProps {
  dadosReceita: ReceitaData[];
  dadosPlanos: PlanosData[];
  cuponsAtivos: CupomData[];
  estatisticas: Estatisticas;
}

export const ReceitaTab: React.FC<ReceitaTabProps> = ({
  dadosReceita,
  dadosPlanos,
  cuponsAtivos,
  estatisticas
}) => {
  const COLORS = ['#5f2ebe', '#0088FE', '#00C49F', '#FFBB28'];

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Planos</CardTitle>
            <CardDescription>
              Porcentagem de assinantes por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dadosPlanos} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  outerRadius={80} 
                  fill="#8884d8" 
                  dataKey="value" 
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosPlanos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => [`${value}%`, 'Porcentagem']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Cupons de Desconto</span>
              <Button variant="outline" size="sm" className="w-auto">
                <Ticket className="mr-2 h-4 w-4" />
                Novo Cupom
              </Button>
            </CardTitle>
            <CardDescription>
              Gerenciamento de cupons de desconto ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Usos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuponsAtivos.map(cupom => (
                  <TableRow key={cupom.codigo}>
                    <TableCell className="font-medium">{cupom.codigo}</TableCell>
                    <TableCell>{cupom.desconto}</TableCell>
                    <TableCell>{cupom.validade}</TableCell>
                    <TableCell>
                      {cupom.usos}/{cupom.limite}
                      <Progress value={cupom.usos / cupom.limite * 100} className="h-1 mt-1" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
