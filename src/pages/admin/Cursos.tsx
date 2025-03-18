import React, { useState, useEffect } from "react";
import { 
  CursosFilter, 
  CursosTable, 
  AdicionarCurso,
  EditCursoModal,
  DeleteCursoModal
} from "./components/cursos";
import { Curso } from "./components/cursos/CursosTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const Cursos = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");

  // Estados para a adição de curso
  const [tituloNovoCurso, setTituloNovoCurso] = useState("");
  const [descricaoNovoCurso, setDescricaoNovoCurso] = useState("");
  const [informacoesCurso, setInformacoesCurso] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);

  // Estado para cursos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para calcular o número total de questões para um curso
  const calcularTotalQuestoesCurso = async (curso: any) => {
    try {
      console.log(`Calculando questões para o curso: ${curso.titulo}`);
      
      // Usar um Set para armazenar IDs únicos de questões
      const questoesUnicas = new Set<string>();
      
      // Adicionar questões diretamente associadas ao curso
      if (curso.questoes_ids && Array.isArray(curso.questoes_ids)) {
        curso.questoes_ids.forEach((questaoId: string) => {
          if (questaoId && questaoId.trim() !== '') {
            questoesUnicas.add(questaoId);
          }
        });
      }
      
      // Questões associadas aos tópicos do curso
      if (curso.topicos_ids && curso.topicos_ids.length > 0) {
        // Buscar dados de todos os tópicos de uma vez
        const { data: topicosData, error: topicosError } = await supabase
          .from('topicos')
          .select('questoes_ids')
          .in('id', curso.topicos_ids);
          
        if (topicosError) throw topicosError;
        
        // Adicionar questões de todos os tópicos ao Set
        if (topicosData) {
          topicosData.forEach(topico => {
            if (topico.questoes_ids && Array.isArray(topico.questoes_ids)) {
              topico.questoes_ids.forEach(questaoId => {
                if (questaoId && questaoId.trim() !== '') {
                  questoesUnicas.add(questaoId);
                }
              });
            }
          });
        }
      }
      
      // Questões associadas às disciplinas do curso
      if (curso.disciplinas_ids && curso.disciplinas_ids.length > 0) {
        // Buscar aulas de todas as disciplinas
        for (const disciplinaId of curso.disciplinas_ids) {
          const { data: disciplina } = await supabase
            .from('disciplinas')
            .select('aulas_ids')
            .eq('id', disciplinaId)
            .single();
            
          if (disciplina && disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
            // Buscar dados de todas as aulas da disciplina de uma vez
            const { data: aulasData } = await supabase
              .from('aulas')
              .select('questoes_ids, topicos_ids')
              .in('id', disciplina.aulas_ids);
              
            if (aulasData) {
              // Adicionar questões diretamente associadas às aulas ao Set
              for (const aula of aulasData) {
                if (aula.questoes_ids && Array.isArray(aula.questoes_ids)) {
                  aula.questoes_ids.forEach(questaoId => {
                    if (questaoId && questaoId.trim() !== '') {
                      questoesUnicas.add(questaoId);
                    }
                  });
                }
                
                // Adicionar questões dos tópicos das aulas ao Set
                if (aula.topicos_ids && aula.topicos_ids.length > 0) {
                  const { data: topicosAula } = await supabase
                    .from('topicos')
                    .select('questoes_ids')
                    .in('id', aula.topicos_ids);
                    
                  if (topicosAula) {
                    topicosAula.forEach(topico => {
                      if (topico.questoes_ids && Array.isArray(topico.questoes_ids)) {
                        topico.questoes_ids.forEach(questaoId => {
                          if (questaoId && questaoId.trim() !== '') {
                            questoesUnicas.add(questaoId);
                          }
                        });
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      // Total de questões únicas
      console.log(`Total de questões únicas calculado: ${questoesUnicas.size}`);
      return questoesUnicas.size;
    } catch (error) {
      console.error("Erro ao calcular total de questões:", error);
      return 0;
    }
  };

  // Função para buscar cursos
  const fetchCursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('*');
      
      if (error) throw error;
      
      // Buscar contagem de favoritos para cada curso
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('cursos_favoritos');
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
      }
      
      // Calcular contagem de favoritos para cada curso
      const favoritosCount: Record<string, number> = {};
      
      if (profiles) {
        profiles.forEach(profile => {
          if (profile.cursos_favoritos && Array.isArray(profile.cursos_favoritos)) {
            profile.cursos_favoritos.forEach(favorito => {
              // Usar o ID diretamente, sem tentar extrair de um formato URL
              favoritosCount[favorito] = (favoritosCount[favorito] || 0) + 1;
            });
          }
        });
      }
      
      console.log("Contagem de favoritos para cursos:", favoritosCount);
      
      // Formatar os cursos e calcular contagens
      const cursosPromises = (data || []).map(async (item) => {
        // Usar a função melhorada para calcular o total de questões
        const totalQuestoes = await calcularTotalQuestoesCurso(item);
        
        return {
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao || "",
          disciplinasIds: item.disciplinas_ids || [],
          aulasIds: item.aulas_ids || [],
          topicosIds: item.topicos_ids || [],
          questoesIds: Array(totalQuestoes).fill("").map((_, i) => String(i)), // Criar array com o tamanho correto
          favoritos: favoritosCount[item.id] || 0,
          informacoesCurso: item.informacoes_curso || ""
        };
      });
      
      const formattedCursos: Curso[] = await Promise.all(cursosPromises);
      
      setCursos(formattedCursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar os cursos");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchCursos();
  }, []);

  // Função para filtrar cursos
  const cursosFiltrados = cursos.filter((curso) => {
    const matchesTitulo = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = curso.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Funções para abrir modais
  const openEditModal = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsOpenDelete(true);
  };

  // Função para salvar curso editado
  const handleSaveCurso = async (updatedCurso: Curso) => {
    try {
      console.log("Salvando curso atualizado:", updatedCurso);
      
      const { error } = await supabase
        .from('cursos')
        .update({ 
          titulo: updatedCurso.titulo,
          descricao: updatedCurso.descricao,
          informacoes_curso: updatedCurso.informacoesCurso,
          disciplinas_ids: updatedCurso.disciplinasIds
        })
        .eq('id', updatedCurso.id);
      
      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }
      
      // Atualizar o curso na lista com o novo número de questões calculado
      const totalQuestoes = await calcularTotalQuestoesCurso({
        ...updatedCurso,
        disciplinas_ids: updatedCurso.disciplinasIds,
        topicos_ids: updatedCurso.topicosIds,
        questoes_ids: updatedCurso.questoesIds
      });
      
      setCursos(cursos.map(curso => 
        curso.id === updatedCurso.id ? {...updatedCurso, totalQuestoes} : curso
      ));
      
      setIsOpenEdit(false);
      toast.success("Curso atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      toast.error("Erro ao atualizar o curso");
    }
  };

  // Função para excluir curso
  const handleDeleteCurso = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remover o curso da lista
      setCursos(cursos.filter(curso => curso.id !== id));
      setIsOpenDelete(false);
      toast.success("Curso excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error("Erro ao excluir o curso");
    }
  };

  // Função para adicionar curso
  const handleAdicionarCurso = async () => {
    if (!tituloNovoCurso.trim()) {
      toast.error("O título do curso é obrigatório");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('cursos')
        .insert([{
          titulo: tituloNovoCurso,
          descricao: descricaoNovoCurso,
          informacoes_curso: informacoesCurso,
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("Curso adicionado com sucesso!");
      fetchCursos();
      
      // Resetar campos
      setTituloNovoCurso("");
      setDescricaoNovoCurso("");
      setInformacoesCurso("");
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      toast.error("Erro ao adicionar o curso");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Cursos</h1>
      <p className="text-[#67748a]">Gerenciamento de cursos</p>
      
      {/* Componente de filtro */}
      <CursosFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de cursos */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <CursosTable 
          cursos={cursosFiltrados}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
      )}
      
      {/* Componente para adicionar curso */}
      <AdicionarCurso 
        tituloNovoCurso={tituloNovoCurso}
        setTituloNovoCurso={setTituloNovoCurso}
        descricaoNovoCurso={descricaoNovoCurso}
        setDescricaoNovoCurso={setDescricaoNovoCurso}
        informacoesCurso={informacoesCurso}
        setInformacoesCurso={setInformacoesCurso}
        handleAdicionarCurso={handleAdicionarCurso}
        temDisciplinasSelecionadas={true}
      />
      
      {/* Modais de edição e exclusão */}
      <EditCursoModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        curso={currentCurso}
        onSave={handleSaveCurso}
      />
      
      <DeleteCursoModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        curso={currentCurso}
        onDelete={handleDeleteCurso}
      />
    </div>
  );
};

export default Cursos;
