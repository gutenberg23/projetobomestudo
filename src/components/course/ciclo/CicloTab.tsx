import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DisciplinaItem } from "./DisciplinaItem";
import { CicloChart } from "./CicloChart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Spinner } from "@/components/ui/spinner";
import { formatTimeValue } from "./utils";

interface Subject {
  id: string;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  horasDedicadas?: number;
  cor?: string;
}

interface CicloTabProps {
  courseId?: string;
  subjects: Subject[];
}

export const CicloTab: React.FC<CicloTabProps> = ({ courseId, subjects: initialSubjects }) => {
  const { user } = useAuth();
  const [cicloSubjects, setCicloSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [totalHoras, setTotalHoras] = useState(40); // Valor padrão de 40 horas semanais
  
  useEffect(() => {
    if (!user?.id || !courseId || initialSubjects.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const loadCiclo = async () => {
      try {
        setIsLoading(true);
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar se já existe um ciclo para este usuário e curso
        const { data: cicloData, error } = await supabase
          .from('ciclos_estudo')
          .select('*')
          .eq('user_id', user.id)
          .eq('curso_id', realCourseId)
          .single();
          
        if (error && error.code !== 'PGRST116') { // Não é erro de "não encontrado"
          console.error('Erro ao buscar ciclo:', error);
          toast.error('Erro ao carregar ciclo de estudos');
          return;
        }
        
        // Disciplinas atuais do curso (source of truth)
        const currentSubjectsMap = new Map(
          initialSubjects.map(subject => [subject.id, subject])
        );
        
        // Se já existe um ciclo, use-o como base mas garanta que está sincronizado com as disciplinas atuais
        if (cicloData) {
          const savedDisciplinas = cicloData.disciplinas || [];
          const savedDisciplinasMap = new Map<string, any>(
            savedDisciplinas.map((d: any) => [d.id, d])
          );
          
          setTotalHoras(cicloData.total_horas || 40);
          
          // Criar array de disciplinas sincronizado
          const syncedSubjects: Subject[] = [];
          
          // Primeiro, incluir todas as disciplinas do curso atual
          initialSubjects.forEach(subject => {
            const savedData = savedDisciplinasMap.get(subject.id);
            
            // Se a disciplina já existia no ciclo salvo, mesclar os dados
            if (savedData) {
              syncedSubjects.push({
                ...subject,
                ativo: savedData.ativo !== undefined ? savedData.ativo : true,
                horasDedicadas: savedData.horasDedicadas || Math.floor(totalHoras / initialSubjects.length),
                cor: savedData.cor || generateColor(syncedSubjects.length)
              });
            } 
            // Se é uma nova disciplina, adicionar com valores padrão
            else {
              syncedSubjects.push({
                ...subject,
                ativo: true,
                horasDedicadas: Math.floor(totalHoras / initialSubjects.length),
                cor: generateColor(syncedSubjects.length)
              });
            }
          });
          
          // Atualizar as disciplinas do ciclo
          setCicloSubjects(syncedSubjects);
        } else {
          // Se não existe, crie um ciclo padrão com as disciplinas do curso
          const defaultSubjects = initialSubjects.map((subject, index) => ({
            ...subject,
            ativo: true,
            horasDedicadas: Math.floor(totalHoras / initialSubjects.length),
            cor: generateColor(index)
          }));
          
          setCicloSubjects(defaultSubjects);
        }
      } catch (error) {
        console.error('Erro ao carregar ciclo:', error);
        toast.error('Erro ao carregar ciclo de estudos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCiclo();
  }, [user?.id, courseId, initialSubjects]);
  
  const handleToggleActive = (id: string) => {
    setCicloSubjects(prevSubjects => 
      prevSubjects.map(subject => 
        subject.id === id ? { ...subject, ativo: !subject.ativo } : subject
      )
    );
  };
  
  const handleUpdateHoras = (id: string, horas: number) => {
    setCicloSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      const index = newSubjects.findIndex(s => s.id === id);
      
      if (index !== -1) {
        // Atualizar as horas da disciplina modificada
        newSubjects[index] = { ...newSubjects[index], horasDedicadas: horas };
      }
      
      return newSubjects;
    });
  };
  
  const handleMoveSubject = (dragIndex: number, hoverIndex: number) => {
    setCicloSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      const draggedSubject = newSubjects[dragIndex];
      
      // Remove o item arrastado
      newSubjects.splice(dragIndex, 1);
      // Insere no novo índice
      newSubjects.splice(hoverIndex, 0, draggedSubject);
      
      return newSubjects;
    });
  };
  
  const handleTotalHorasChange = (value: number) => {
    setTotalHoras(value);
  };
  
  const handleSaveCiclo = async () => {
    if (!user?.id || !courseId) {
      toast.error('Usuário não autenticado ou curso não selecionado');
      return;
    }
    
    try {
      setIsSaving(true);
      const realCourseId = extractIdFromFriendlyUrl(courseId);
      
      // Preparar dados para salvar
      const cicloData = {
        user_id: user.id,
        curso_id: realCourseId,
        disciplinas: cicloSubjects.map(subject => ({
          id: subject.id,
          ativo: subject.ativo,
          horasDedicadas: subject.horasDedicadas,
          cor: subject.cor
        })),
        total_horas: totalHoras,
        data_criacao: new Date(),
        ultima_atualizacao: new Date()
      };
      
      // Verificar se já existe um ciclo para atualizar
      const { data: existingCiclo, error: searchError } = await supabase
        .from('ciclos_estudo')
        .select('id')
        .eq('user_id', user.id)
        .eq('curso_id', realCourseId)
        .single();
      
      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }
      
      let result;
      
      if (existingCiclo) {
        // Atualizar ciclo existente
        result = await supabase
          .from('ciclos_estudo')
          .update({
            disciplinas: cicloData.disciplinas,
            total_horas: totalHoras,
            ultima_atualizacao: cicloData.ultima_atualizacao
          })
          .eq('id', existingCiclo.id);
      } else {
        // Criar novo ciclo
        result = await supabase
          .from('ciclos_estudo')
          .insert([cicloData]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success('Ciclo de estudos salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar ciclo:', error);
      toast.error('Erro ao salvar ciclo de estudos');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função auxiliar para gerar cores diferentes para cada disciplina
  const generateColor = (index: number) => {
    const colors = [
      '#4C72B0', '#DD8452', '#55A868', '#C44E52', '#8172B3',
      '#937860', '#DA8BC3', '#8C8C8C', '#CCB974', '#64B5CD'
    ];
    return colors[index % colors.length];
  };
  
  // Calcula o total de horas dedicadas às disciplinas ativas
  const calcularTotalHorasAtivas = () => {
    return cicloSubjects
      .filter(subject => subject.ativo)
      .reduce((acc, subject) => acc + (subject.horasDedicadas || 0), 0);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner />
      </div>
    );
  }
  
  if (cicloSubjects.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ciclo de Estudos</h2>
        <p className="text-gray-600 mb-6">
          Não há disciplinas disponíveis para montar um ciclo de estudos.
          Verifique se este curso possui disciplinas cadastradas.
        </p>
      </div>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-8 p-5 bg-white rounded-[10px]">
        <div className="flex flex-col gap-4 mb-4 text-[#272f3c]">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Ciclo de Estudos</h3>
            
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleSaveCiclo}
                disabled={isSaving}
                className="bg-[#5f2ebe] hover:bg-[#4c25a3] rounded-md text-white text-sm font-medium transition-colors duration-200 ease-in-out border-0 shadow-none transform-none"
              >
                {isSaving ? 'Salvando...' : 'Salvar Ciclo'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Disciplinas</h3>
            
            <div className="space-y-3">
              {cicloSubjects.map((subject, index) => (
                <DisciplinaItem
                  key={subject.id}
                  index={index}
                  subject={subject}
                  onToggleActive={handleToggleActive}
                  onUpdateHoras={handleUpdateHoras}
                  onMove={handleMoveSubject}
                  totalHoras={totalHoras}
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Distribuição do Tempo</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <CicloChart 
                subjects={cicloSubjects.filter(s => s.ativo)}
                totalHoras={calcularTotalHorasAtivas()} 
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}; 