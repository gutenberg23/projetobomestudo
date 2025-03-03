
import React from "react";
import { PieChart, BarChart, Cell, XAxis, YAxis, Bar, Pie, Legend, ResponsiveContainer, Tooltip } from "recharts";

// Dados de exemplo para os gráficos
const performanceData = [
  { name: "Acertos", value: 60, color: "#4ade80" },
  { name: "Erros", value: 40, color: "#ef4444" },
];

const alternativesData = [
  { name: "A", value: 17, color: "#F8C471" },
  { name: "B", value: 46, color: "#5DADE2" },
  { name: "C", value: 7, color: "#F4D03F" },
  { name: "D", value: 15, color: "#ABEBC6" },
  { name: "E", value: 11, color: "#E59866" },
];

export const QuestionStats: React.FC = () => {
  return (
    <div className="bg-white rounded-md p-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-center text-[#272f3c] font-medium mb-4">Percentual de Rendimento</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="text-center text-[#272f3c] font-medium mb-4">Alternativas mais respondidas</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alternativesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {alternativesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
