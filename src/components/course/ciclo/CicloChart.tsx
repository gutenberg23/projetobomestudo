import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Text } from "recharts";
import { formatTimeValue } from "./utils";

interface Subject {
  id: string;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  horasDedicadas?: number;
  cor?: string;
}

interface CicloChartProps {
  subjects: Subject[];
  totalHoras: number;
}

export const CicloChart: React.FC<CicloChartProps> = ({ subjects, totalHoras }) => {
  // Prepara os dados para o gráfico
  const data = useMemo(() => {
    const activeSubjects = subjects
      .filter(subject => subject.ativo && (subject.horasDedicadas || 0) > 0);
      
    // Calcular o total de horas para usar nas proporções
    const totalHorasAtivas = activeSubjects.reduce((sum, s) => sum + (s.horasDedicadas || 0), 0);
    
    return activeSubjects.map(subject => ({
      name: subject.titulo,
      value: subject.horasDedicadas || 0,
      formattedValue: formatTimeValue(subject.horasDedicadas || 0),
      percentage: totalHorasAtivas > 0 ? Math.round((subject.horasDedicadas || 0) * 100 / totalHorasAtivas) : 0,
      color: subject.cor
    }));
  }, [subjects]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-100 shadow-sm rounded-md text-xs">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.color }}>
            {`${payload[0].payload.formattedValue} (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs truncate max-w-[180px]" title={entry.value}>
              {entry.value} - {entry.payload.formattedValue}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Componente para renderizar o texto no centro do gráfico
  const renderCenterText = () => {
    return (
      <text 
        x="50%" 
        y="50%" 
        textAnchor="middle" 
        dominantBaseline="middle"
        className="font-bold"
        fill="#272F3C"
      >
        {formatTimeValue(totalHoras)}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Nenhuma disciplina ativa para exibir no gráfico.<br />
          Ative pelo menos uma disciplina.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {renderCenterText()}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}; 