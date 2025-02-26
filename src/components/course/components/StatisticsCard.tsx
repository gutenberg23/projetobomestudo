
import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ChartBarStacked, ChartPie, ChartRadar } from "lucide-react";
import { Subject } from "../types/editorialized";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

interface StatisticsCardProps {
  subjects: Subject[];
}

export const StatisticsCard = ({ subjects }: StatisticsCardProps) => {
  const [selectedSubject, setSelectedSubject] = React.useState<string>(subjects[0]?.name || "");

  // Dados para o gráfico de radar
  const radarData = subjects.map(subject => {
    const totalHits = subject.topics.reduce((acc, topic) => acc + topic.hits, 0);
    const totalExercises = subject.topics.reduce((acc, topic) => acc + topic.exercisesDone, 0);
    const performance = totalExercises > 0 ? Math.round((totalHits / totalExercises) * 100) : 0;

    return {
      subject: subject.name,
      value: performance
    };
  });

  // Dados para o gráfico de rosca
  const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const completedTopics = subjects.reduce((acc, subject) => 
    acc + subject.topics.filter(topic => topic.isDone).length, 0);
  const progressPercentage = Math.round((completedTopics / totalTopics) * 100);
  const donutData = [
    { name: 'Concluído', value: progressPercentage },
    { name: 'Pendente', value: 100 - progressPercentage }
  ];
  const COLORS = ['#4CAF50', '#E0E0E0'];

  // Dados para o gráfico de barras empilhadas
  const selectedSubjectData = subjects.find(s => s.name === selectedSubject)?.topics.map(topic => ({
    name: topic.name.substring(0, 20) + "...",
    acertos: topic.hits,
    erros: topic.exercisesDone - topic.hits
  })) || [];

  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
      <ChartBarStacked className="w-5 h-5" />
      <HoverCard>
        <HoverCardTrigger className="cursor-pointer hover:text-gray-900">
          Minhas Estatísticas
        </HoverCardTrigger>
        <HoverCardContent className="w-[800px] p-6 bg-white shadow-lg rounded-xl border">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <ChartRadar className="w-5 h-5" />
                Aproveitamento por Disciplina
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar
                      name="Aproveitamento"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <ChartPie className="w-5 h-5" />
                Progresso Geral
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <ChartBarStacked className="w-5 h-5" />
                  Distribuição de Acertos e Erros por Tópico
                </h3>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedSubjectData}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="acertos" stackId="a" fill="#4CAF50" name="Acertos" />
                    <Bar dataKey="erros" stackId="a" fill="#FF5252" name="Erros" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
