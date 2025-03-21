import { supabase } from '@/integrations/supabase/client';

// Define explicit types for Supabase results
interface AulaResult {
  id: string;
}

interface DisciplinaResult {
  aulas_ids?: string[];
}

// Função auxiliar para buscar aulas por diferentes campos
const fetchAulasByField = async (field: string, value: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('aulas')
    .select<AulaResult[]>('id')
    .eq(field, value);

  if (error) {
    console.error(`Erro ao buscar aulas por ${field}:`, error);
    return [];
  }

  return data?.map(aula => aula.id) ?? [];
};

export const useFetchSubjectInfo = () => {
  const fetchSubjectInfo = async (subjectId: string): Promise<string[]> => {
    try {
      // Buscar disciplina e obter aulas_ids
      const { data: disciplinaData, error:
