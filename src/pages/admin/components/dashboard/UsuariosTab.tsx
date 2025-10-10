import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { CadastrosData } from "./types";

interface UsuariosTabProps {
  dadosCadastros: CadastrosData[];
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({ dadosCadastros }) => {
  // Calcular o somatório acumulado
  const dadosComAcumulado = dadosCadastros.map((item, index) => {
    const acumulado = dadosCadastros
      .slice(0, index + 1)
      .reduce((sum, current) => sum + current.usuarios, 0);
    
    return {
      ...item,
      acumulado
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Evolução de Usuários Cadastrados</CardTitle>
          <CardDescription>
            Barras: Novos usuários por mês | Linha: Total acumulado de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dadosComAcumulado}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="usuarios"
                name="Novos Usuários (Mensal)"
                fill="#5f2ebe"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="acumulado"
                name="Total Acumulado"
                stroke="#ff7300"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};