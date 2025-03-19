import React, { useState } from 'react';
import { Subject } from "../types/editorialized";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface StatisticsCardProps {
  subjects: Subject[];
}
export const StatisticsCard = ({
  subjects
}: StatisticsCardProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || "");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Data for radar chart
  const radarData = subjects.map(subject => {
    const totalHits = subject.topics.reduce((acc, topic) => acc + topic.hits, 0);
    const totalExercises = subject.topics.reduce((acc, topic) => acc + topic.exercisesDone, 0);
    const performance = totalExercises > 0 ? Math.round(totalHits / totalExercises * 100) : 0;
    return {
      subject: subject.name,
      value: performance
    };
  });

  // Data for donut chart
  const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const completedTopics = subjects.reduce((acc, subject) => acc + subject.topics.filter(topic => topic.isDone).length, 0);
  const progressPercentage = Math.round(completedTopics / totalTopics * 100);
  const donutData = [{
    name: 'Concluído',
    value: progressPercentage
  }, {
    name: 'Pendente',
    value: 100 - progressPercentage
  }];
  const DONUT_COLORS = ['#5f2ebe', '#cecfcd'];

  // Colors for the bar chart
  const BAR_COLORS = {
    acertos: '#5f2ebe',
    erros: '#ffac33'
  };

  // Data for stacked bar chart
  const selectedSubjectData = subjects.find(s => s.name === selectedSubject)?.topics.map(topic => ({
    name: topic.name.substring(0, 20) + "...",
    acertos: topic.hits,
    erros: topic.exercisesDone - topic.hits
  })) || [];
  return <div className={`bg-gradient-to-br from-[#5f2ebe10] to-[#5f2ebe20] rounded-[16px] ${isExpanded ? 'p-4 my-[15px] py-[17px]' : 'p-0 mb-4 py-0'}`}>
      <div className={`flex justify-between items-center ${isExpanded ? 'mb-4' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#5f2ebe] w-1 h-8 rounded-full"></div>
          <h3 className="text-left text-2xl font-bold bg-gradient-to-r from-[#5f2ebe] to-[#8a5ee0] text-transparent bg-clip-text">
            Minhas Estatísticas
          </h3>
        </div>
        <button onClick={toggleExpanded} className="text-[#5f2ebe] hover:bg-[#f0ebff] p-2 rounded-full transition-all duration-300">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-[14px] py-[15px]">
            <h3 className="font-semibold text-center mb-4">
              Aproveitamento por Disciplina
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <Radar name="Aproveitamento" dataKey="value" stroke="#5f2ebe" fill="#5f2ebe" fillOpacity={0.6} />
                  <Tooltip contentStyle={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-[14px]">
            <h3 className="font-semibold text-center mb-4">
              Progresso Geral
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <Legend wrapperStyle={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-[14px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <h3 className="font-semibold text-center">
                Distribuição de Acertos e Erros por Tópico
              </h3>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedSubjectData}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <YAxis tick={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <Tooltip contentStyle={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <Legend wrapperStyle={{
                fontSize: window.innerWidth < 768 ? 10 : 12
              }} />
                  <Bar dataKey="acertos" stackId="a" fill={BAR_COLORS.acertos} name="Acertos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="erros" stackId="a" fill={BAR_COLORS.erros} name="Erros" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>}
    </div>;
};