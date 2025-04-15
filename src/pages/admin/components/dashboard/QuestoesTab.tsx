import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DisciplinasQuestoesData } from "./types";

interface QuestoesTabProps {
  disciplinasQuestoes: DisciplinasQuestoesData[];
}

export const QuestoesTab: React.FC<QuestoesTabProps> = ({ disciplinasQuestoes }) => {
  // Ordena as disciplinas pela quantidade de questões (maior para menor)
  const dadosOrdenados = [...disciplinasQuestoes].sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Disciplinas com Mais Questões</CardTitle>
          <CardDescription>
            Ranking das disciplinas por quantidade de questões cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosOrdenados}>
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
              <Bar
                dataKey="quantidade"
                fill="#5f2ebe"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}; 