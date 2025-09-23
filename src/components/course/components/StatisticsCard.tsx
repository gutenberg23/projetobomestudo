import { useState, useEffect } from 'react';
import { Subject } from "../types/editorialized";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StatisticsCardProps {
  subjects: Subject[];
}

export const StatisticsCard = ({
  subjects
}: StatisticsCardProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || "");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // Estados para os dados reais
  const [realTopicStats, setRealTopicStats] = useState<Record<string, { 
    hits: number; 
    errors: number; 
    totalExercises: number;
    performance: number;
  }>>({});

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Efeito para buscar estatísticas reais quando os subjects mudam
  useEffect(() => {
    const fetchRealStats = async () => {
      if (!userId || userId === 'guest' || !subjects.length) {
        return;
      }
      
      try {
        // Criar um mapa para armazenar as estatísticas por tópico
        const statsMap: Record<string, { 
          hits: number; 
          errors: number; 
          totalExercises: number;
          performance: number;
        }> = {};

        // Processar cada subject e seus tópicos
        for (const subject of subjects) {
          for (const topic of subject.topics) {
            if (!topic.link) continue;
            
            try {
              const url = new URL(topic.link);
              const searchParams = url.searchParams;
              
              // Construir query baseada nos filtros
              let query = supabase.from('questoes').select('id');

              // Aplicar filtros baseados nos parâmetros da URL
              if (searchParams.has('disciplines')) {
                const disciplines = JSON.parse(decodeURIComponent(searchParams.get('disciplines') || '[]'));
                if (disciplines.length > 0) {
                  query = query.in('discipline', disciplines);
                }
              }

              if (searchParams.has('years')) {
                const years = JSON.parse(decodeURIComponent(searchParams.get('years') || '[]'));
                if (years.length > 0) {
                  query = query.in('year', years);
                }
              }

              if (searchParams.has('institutions')) {
                const institutions = JSON.parse(decodeURIComponent(searchParams.get('institutions') || '[]'));
                if (institutions.length > 0) {
                  query = query.in('institution', institutions);
                }
              }

              if (searchParams.has('organizations')) {
                const organizations = JSON.parse(decodeURIComponent(searchParams.get('organizations') || '[]'));
                if (organizations.length > 0) {
                  query = query.in('organization', organizations);
                }
              }

              if (searchParams.has('roles')) {
                const roles = JSON.parse(decodeURIComponent(searchParams.get('roles') || '[]'));
                if (roles.length > 0) {
                  query = query.contains('role', roles);
                }
              }

              if (searchParams.has('levels')) {
                const levels = JSON.parse(decodeURIComponent(searchParams.get('levels') || '[]'));
                if (levels.length > 0) {
                  query = query.in('level', levels);
                }
              }

              if (searchParams.has('difficulties')) {
                const difficulties = JSON.parse(decodeURIComponent(searchParams.get('difficulties') || '[]'));
                if (difficulties.length > 0) {
                  query = query.in('difficulty', difficulties);
                }
              }

              if (searchParams.has('subjects')) {
                const subjects = JSON.parse(decodeURIComponent(searchParams.get('subjects') || '[]'));
                if (subjects.length > 0) {
                  query = query.overlaps('assuntos', subjects);
                }
              }

              if (searchParams.has('topics')) {
                const topics = JSON.parse(decodeURIComponent(searchParams.get('topics') || '[]'));
                if (topics.length > 0) {
                  query = query.overlaps('assuntos', topics);
                }
              }

              if (searchParams.has('subtopics')) {
                const subtopics = JSON.parse(decodeURIComponent(searchParams.get('subtopics') || '[]'));
                if (subtopics.length > 0) {
                  query = query.overlaps('topicos', subtopics);
                }
              }

              if (searchParams.has('educationLevels')) {
                const educationLevels = JSON.parse(decodeURIComponent(searchParams.get('educationLevels') || '[]'));
                if (educationLevels.length > 0) {
                  query = query.in('level', educationLevels);
                }
              }

              // Buscar questões que correspondem aos filtros
              const { data: questions, error: questionsError } = await query;

              if (questionsError || !questions) {
                // Usar os dados locais se houver erro
                statsMap[`${subject.id}-${topic.id}`] = {
                  hits: topic.hits,
                  errors: topic.exercisesDone - topic.hits,
                  totalExercises: topic.exercisesDone,
                  performance: topic.exercisesDone > 0 ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0
                };
                continue;
              }

              const questionIds = questions.map(q => q.id);
              
              if (questionIds.length === 0) {
                // Usar os dados locais se não houver questões
                statsMap[`${subject.id}-${topic.id}`] = {
                  hits: topic.hits,
                  errors: topic.exercisesDone - topic.hits,
                  totalExercises: topic.exercisesDone,
                  performance: topic.exercisesDone > 0 ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0
                };
                continue;
              }

              // Buscar tentativas do usuário para essas questões
              const { data: attempts, error: attemptsError } = await supabase
                .from('user_question_attempts')
                .select('question_id, is_correct')
                .eq('user_id', userId)
                .in('question_id', questionIds);

              if (attemptsError) {
                // Usar os dados locais se houver erro
                statsMap[`${subject.id}-${topic.id}`] = {
                  hits: topic.hits,
                  errors: topic.exercisesDone - topic.hits,
                  totalExercises: topic.exercisesDone,
                  performance: topic.exercisesDone > 0 ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0
                };
                continue;
              }

              // Calcular estatísticas
              const totalAttempts = attempts?.length || 0;
              const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
              const wrongAnswers = totalAttempts - correctAnswers;
              const performance = totalAttempts > 0 ? Math.round(correctAnswers / totalAttempts * 100) : 0;

              statsMap[`${subject.id}-${topic.id}`] = {
                hits: correctAnswers,
                errors: wrongAnswers,
                totalExercises: totalAttempts,
                performance
              };
            } catch (error) {
              console.error('Erro ao processar tópico:', topic, error);
              // Usar os dados locais em caso de erro
              statsMap[`${subject.id}-${topic.id}`] = {
                hits: topic.hits,
                errors: topic.exercisesDone - topic.hits,
                totalExercises: topic.exercisesDone,
                performance: topic.exercisesDone > 0 ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0
              };
            }
          }
        }

        setRealTopicStats(statsMap);
      } catch (error) {
        console.error('Erro ao calcular estatísticas reais:', error);
      }
    };

    fetchRealStats();
  }, [subjects, userId]);

  // Data for radar chart - usando dados reais
  const radarData = subjects.map(subject => {
    // Calcular estatísticas usando dados reais
    let totalHits = 0;
    let totalExercises = 0;
    
    subject.topics.forEach(topic => {
      const stats = realTopicStats[`${subject.id}-${topic.id}`];
      if (stats) {
        totalHits += stats.hits;
        totalExercises += stats.totalExercises;
      } else {
        // Fallback para dados locais
        totalHits += topic.hits;
        totalExercises += topic.exercisesDone;
      }
    });
    
    const performance = totalExercises > 0 ? Math.round(totalHits / totalExercises * 100) : 0;
    return {
      subject: subject.name,
      value: performance
    };
  });

  // Dados para a lista de tópicos que precisam de melhoria - usando dados reais
  const topicsNeedingImprovement = subjects.flatMap(subject => 
    subject.topics.map(topic => {
      const stats = realTopicStats[`${subject.id}-${topic.id}`];
      let performance, exercisesDone;
      
      if (stats) {
        performance = stats.performance;
        exercisesDone = stats.totalExercises;
      } else {
        // Fallback para dados locais
        performance = topic.exercisesDone > 0 
          ? Math.round((topic.hits / topic.exercisesDone) * 100) 
          : 0;
        exercisesDone = topic.exercisesDone;
      }
      
      return {
        name: topic.name,
        subject: subject.name,
        performance,
        exercisesDone
      };
    })
  )
  .filter(topic => topic.exercisesDone > 0) // Filtra apenas tópicos com exercícios feitos
  .sort((a, b) => a.performance - b.performance) // Ordena do pior para o melhor
  .slice(0, 4); // Pega os 4 piores

  // Colors for the bar chart
  const BAR_COLORS = {
    acertos: '#5f2ebe',
    erros: '#ffac33'
  };

  // Data for stacked bar chart - usando dados reais
  const selectedSubjectData = subjects.find(s => s.name === selectedSubject)?.topics.map(topic => {
    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject) return { name: '', acertos: 0, erros: 0 };
    
    const stats = realTopicStats[`${subject.id}-${topic.id}`];
    if (stats) {
      return {
        name: topic.name.substring(0, 20) + "...",
        acertos: stats.hits,
        erros: stats.errors
      };
    } else {
      // Fallback para dados locais
      return {
        name: topic.name.substring(0, 20) + "...",
        acertos: topic.hits,
        erros: topic.exercisesDone - topic.hits
      };
    }
  }) || [];

  return (
    <div className={`bg-gradient-to-br from-[#5f2ebe10] to-[#5f2ebe20] rounded-[16px] ${isExpanded ? 'p-4 my-[15px] py-[17px]' : 'p-0 mb-4 py-0'}`}>
      <div 
        className={`flex justify-between items-center ${isExpanded ? 'mb-4' : 'p-4'} cursor-pointer`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#5f2ebe] w-1 h-8 rounded-full"></div>
          <h3 className="text-left text-2xl font-bold bg-gradient-to-r from-[#5f2ebe] to-[#8a5ee0] text-transparent bg-clip-text">
            Minhas Estatísticas
          </h3>
        </div>
        <div className="text-[#5f2ebe] hover:bg-[#f0ebff] p-2 rounded-full transition-all duration-300">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-[14px] py-[15px]">
            <h3 className="font-semibold text-center mb-4">
              Aproveitamento por Disciplina
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                  <Radar 
                    name="Aproveitamento" 
                    dataKey="value" 
                    stroke="#5f2ebe" 
                    fill="#5f2ebe" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip 
                    contentStyle={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-[14px]">
            <h3 className="font-semibold text-center mb-4">
              Tópicos que Precisam de Melhoria
            </h3>
            <div className="space-y-4">
              {topicsNeedingImprovement.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-[#272f3c]">{topic.name}</p>
                      <p className="text-[#67748a] text-xs">{topic.subject}</p>
                    </div>
                    <span className={`font-medium ${
                      topic.performance < 50 ? 'text-red-500' : 
                      topic.performance < 70 ? 'text-orange-500' : 
                      'text-green-500'
                    }`}>
                      {topic.performance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${
                        topic.performance < 50 ? 'bg-red-500' : 
                        topic.performance < 70 ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${topic.performance}%` }}
                    />
                  </div>
                </div>
              ))}

              {topicsNeedingImprovement.length === 0 && (
                <div className="text-center py-8 text-[#67748a]">
                  Nenhum tópico com exercícios realizados ainda.
                </div>
              )}
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
                  {subjects.map(subject => (
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
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    tick={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                  <YAxis 
                    tick={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                  <Tooltip 
                    contentStyle={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: window.innerWidth < 768 ? 10 : 12
                    }} 
                  />
                  <Bar 
                    dataKey="acertos" 
                    stackId="a" 
                    fill={BAR_COLORS.acertos} 
                    name="Acertos" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="erros" 
                    stackId="a" 
                    fill={BAR_COLORS.erros} 
                    name="Erros" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};