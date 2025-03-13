
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
  const calcularTotalQuestoes = async (curso: any) => {
    try {
      console.log(`Calculando questões para o curso: ${curso.titulo}`);
      
      // Questões diretamente associadas ao curso
      const questoesDiretas = curso.questoes_ids?.length || 0;
      
      // Questões associadas às disciplinas do curso
      let questoesDisciplinas = 0;
      
      if (curso.disciplinas_ids && curso.disciplinas_ids.length > 0) {
        console.log(`Processando ${curso.disciplinas_ids.length} disciplinas para o curso ${curso.titulo}`);
        
        for (const disciplinaId of curso.disciplinas_ids) {
          console.log(`Processando disciplina: ${disciplinaId}`);
          
          // Buscar dados da disciplina
          const { data: disciplina } = await supabase
            .from('disciplinas')
            .select('*')
            .eq('id', disciplinaId)
            .single();
            
          if (disciplina) {
            console.log(`Calculando questões para aulas: ${JSON.stringify(disciplina.aulas_ids)}`);
            // Questões associadas às aulas da disciplina
            if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
              console.log(`Aulas encontradas: ${disciplina.aulas_ids.length}`);
              
              for (const aulaId of disciplina.aulas_ids) {
                // Buscar dados da aula
                const { data: aula } = await supabase
                  .from('aulas')
                  .select('*')
                  .eq('id', aulaId)
                  .single();
                  
                if (aula) {
                  // Questões diretamente associadas à aula
                  questoesDisciplinas += aula.questoes_ids?.length || 0;
                  
                  // Questões associadas aos tópicos da aula
                  if (aula.topicos_ids && aula.topicos_ids.length > 0) {
                    console.log(`Aula com ${aula.topicos_ids.length} tópicos`);
                    
                    for (const topicoId of aula.topicos_ids) {
                      // Buscar dados do tópico
                      const { data: topico } = await supabase
                        .from('topicos')
                        .select('*')
                        .eq('id', topicoId)
                        .single();
                        
                      if (topico) {
                        const questoesTopico = topico.questoes_ids?.length || 0;
                        console.log(`Tópico com ${questoesTopico} questões`);
                        questoesDisciplinas += questoesTopico;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Questões associadas aos tópicos do curso
      let questoesTopicos = 0;
      
      if (curso.topicos_ids && curso.topicos_ids.length > 0) {
        for (const topicoId of curso.topicos_ids) {
          // Buscar dados do tópico
          const { data: topico } = await supabase
            .from('topicos')
            .select('*')
            .eq('id', topicoId)
            .single();
            
          if (topico) {
            questoesTopicos += topico.questoes_ids?.length || 0;
          }
        }
      }
      
      // Total de questões
      const total = questoesDiretas + questoesDisciplinas + questoesTopicos;
      console.log(`Total de questões calculado: ${total}`);
      
      return total;
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
      
      // Formatar os cursos e calcular contagens
      const cursosPromises = (data || []).map(async (item) => {
        const totalQuestoes = await calcularTotalQuestoes(item);
        
        return {
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao || "",
          disciplinasIds: item.disciplinas_ids || [],
          aulasIds: item.aulas_ids || [],
          topicosIds: item.topicos_ids || [],
          questoesIds: item.questoes_ids || [],
          favoritos: item.favoritos || 0,
          informacoesCurso: item.informacoes_curso || "",
          totalQuestoes
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
      const totalQuestoes = await calcularTotalQuestoes({
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
