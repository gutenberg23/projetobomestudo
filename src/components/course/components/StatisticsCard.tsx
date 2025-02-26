
import React from 'react';
import { Subject } from "../types/editorialized";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

interface StatisticsCardProps {
  subjects: Subject[];
}

export const StatisticsCard = ({ subjects }: StatisticsCardProps) => {
  const [selectedSubject, setSelectedSubject] = React.useState<string>(subjects[0]?.name || "");

  // Data for radar chart
  const radarData = subjects.map(subject => {
    const totalHits = subject.topics.reduce((acc, topic) => acc + topic.hits, 0);
    const totalExercises = subject.topics.reduce((acc, topic) => acc + topic.exercisesDone, 0);
    const performance = totalExercises > 0 ? Math.round((totalHits / totalExercises) * 100) : 0;

    return {
      subject: subject.name,
      value: performance
    };
  });

  // Data for donut chart
  const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const completedTopics = subjects.reduce((acc, subject) => 
    acc + subject.topics.filter(topic => topic.isDone).length, 0);
  const progressPercentage = Math.round((completedTopics / totalTopics) * 100);
  const donutData = [
    { name: 'Concluído', value: progressPercentage },
    { name: 'Pendente', value: 100 - progressPercentage }
  ];
  const COLORS = ['#54cd5d', '#E0E0E0'];

  // Data for stacked bar chart
  const selectedSubjectData = subjects.find(s => s.name === selectedSubject)?.topics.map(topic => ({
    name: topic.name.substring(0, 20) + "...",
    acertos: topic.hits,
    erros: topic.exercisesDone - topic.hits
  })) || [];

  return (
    <div className="flex items-center mt-2 text-sm text-gray-600">
      <Dialog>
        <DialogTrigger asChild>
          <button className="hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
            Minhas Estatísticas
          </button>
        </DialogTrigger>
        <DialogContent className="w-[800px] max-w-[90vw] p-6 bg-[#F1F1F1] rounded-[10px]">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-[10px]">
              <h3 className="font-semibold text-center mb-4">
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
            
            <div className="bg-white p-4 rounded-[10px]">
              <h3 className="font-semibold text-center mb-4">
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

            <div className="col-span-2 bg-white p-4 rounded-[10px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-center flex-1">
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
                    <Bar dataKey="acertos" stackId="a" fill="#54cd5d" name="Acertos" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="erros" stackId="a" fill="#e33e4e" name="Erros" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

