
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from "recharts";
import { AssinanteData } from "./types";

interface AssinantesTabProps {
  dadosAssinantes: AssinanteData[];
}

export const AssinantesTab: React.FC<AssinantesTabProps> = ({ dadosAssinantes }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Assinantes</CardTitle>
          <CardDescription>
            Crescimento de assinantes ativos ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosAssinantes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ativos" 
                name="Assinantes Ativos" 
                stroke="#5f2ebe" 
                activeDot={{ r: 8 }} 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novos Assinantes vs Cancelamentos</CardTitle>
          <CardDescription>
            Comparativo entre novos assinantes e cancelamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosAssinantes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="novos" name="Novos Assinantes" fill="#00C49F" />
              <Bar dataKey="cancelados" name="Cancelamentos" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
