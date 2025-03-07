
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

  // Estado para disciplinas
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para cursos
  const [cursos, setCursos] = useState<Curso[]>([]);

  // Função para buscar cursos
  const fetchCursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('*');
      
      if (error) throw error;
      
      // Formatar os cursos
      const formattedCursos: Curso[] = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao || "",
        disciplinasIds: item.disciplinas_ids || [],
        aulasIds: item.aulas_ids || [],
        topicosIds: item.topicos_ids || [],
        questoesIds: item.questoes_ids || [],
        favoritos: item.favoritos || 0,
        informacoesCurso: item.informacoes_curso || ""
      }));
      
      setCursos(formattedCursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar os cursos");
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar disciplinas
  const fetchDisciplinas = async () => {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*');
      
      if (error) throw error;
      
      // Adicionar campo selecionada às disciplinas
      setDisciplinas((data || []).map(disciplina => ({
        ...disciplina,
        selecionada: false
      })));
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar as disciplinas");
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchCursos();
    fetchDisciplinas();
  }, []);

  // Função para filtrar cursos
  const cursosFiltrados = cursos.filter((curso) => {
    const matchesTitulo = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = curso.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Funções para manipulação de seleção de disciplinas
  const handleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(disciplina => 
      disciplina.id === id ? { ...disciplina, selecionada: !disciplina.selecionada } : disciplina
    ));
  };

  // Verificar se alguma disciplina está selecionada
  const temDisciplinasSelecionadas = disciplinas.some(disciplina => disciplina.selecionada);

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
      const { error } = await supabase
        .from('cursos')
        .update({ 
          titulo: updatedCurso.titulo,
          descricao: updatedCurso.descricao,
          informacoes_curso: updatedCurso.informacoesCurso,
          disciplinas_ids: updatedCurso.disciplinasIds
        })
        .eq('id', updatedCurso.id);
      
      if (error) throw error;
      
      // Atualizar o curso na lista
      setCursos(cursos.map(curso => 
        curso.id === updatedCurso.id ? updatedCurso : curso
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
    
    // Obter as disciplinas selecionadas
    const disciplinasSelecionadas = disciplinas
      .filter(disciplina => disciplina.selecionada)
      .map(disciplina => disciplina.id);
    
    if (disciplinasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma disciplina para o curso");
      return;
    }

    try {
      // Coletar IDs de aulas, tópicos e questões das disciplinas selecionadas
      let todasAulasIds: string[] = [];
      let todosTopicosIds: string[] = [];
      let todasQuestoesIds: string[] = [];

      // Buscar todas as aulas das disciplinas selecionadas
      for (const disciplinaId of disciplinasSelecionadas) {
        const disciplina = disciplinas.find(d => d.id === disciplinaId);
        
        if (disciplina && disciplina.aulas_ids) {
          // Adicionar IDs de aulas desta disciplina
          todasAulasIds = [...todasAulasIds, ...disciplina.aulas_ids];
          
          // Buscar tópicos e questões para cada aula
          for (const aulaId of disciplina.aulas_ids) {
            const { data: aula } = await supabase
              .from('aulas')
              .select('topicos_ids, questoes_ids')
              .eq('id', aulaId)
              .single();
            
            if (aula) {
              if (aula.topicos_ids) {
                todosTopicosIds = [...todosTopicosIds, ...aula.topicos_ids];
              }
              
              if (aula.questoes_ids) {
                todasQuestoesIds = [...todasQuestoesIds, ...aula.questoes_ids];
              }
            }
          }
        }
      }
      
      // Remover duplicatas
      todasAulasIds = Array.from(new Set(todasAulasIds));
      todosTopicosIds = Array.from(new Set(todosTopicosIds));
      todasQuestoesIds = Array.from(new Set(todasQuestoesIds));
      
      // Cadastrar o curso no banco de dados
      const { data, error } = await supabase
        .from('cursos')
        .insert([{
          titulo: tituloNovoCurso,
          descricao: descricaoNovoCurso,
          informacoes_curso: informacoesCurso,
          disciplinas_ids: disciplinasSelecionadas,
          aulas_ids: todasAulasIds,
          topicos_ids: todosTopicosIds,
          questoes_ids: todasQuestoesIds
        }])
        .select();
      
      if (error) throw error;
      
      // Adicionar o novo curso à lista e resetar campos
      if (data && data.length > 0) {
        const novoCurso: Curso = {
          id: data[0].id,
          titulo: data[0].titulo,
          descricao: data[0].descricao || "",
          disciplinasIds: data[0].disciplinas_ids || [],
          aulasIds: data[0].aulas_ids || [],
          topicosIds: data[0].topicos_ids || [],
          questoesIds: data[0].questoes_ids || [],
          favoritos: 0,
          informacoesCurso: data[0].informacoes_curso || ""
        };
        
        setCursos([...cursos, novoCurso]);
      }
      
      // Resetar campos e seleções
      setTituloNovoCurso("");
      setDescricaoNovoCurso("");
      setInformacoesCurso("");
      setDisciplinas(disciplinas.map(disciplina => ({...disciplina, selecionada: false})));
      
      toast.success("Curso adicionado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar curso:", error);
      toast.error("Erro ao adicionar o curso: " + (error.message || "Tente novamente."));
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
        <div className="text-center py-10">Carregando cursos...</div>
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
        temDisciplinasSelecionadas={temDisciplinasSelecionadas}
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
      
      {/* Visualização de disciplinas para seleção */}
      {disciplinas.length > 0 && (
        <div className="mt-6 border rounded-md p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3 text-[#272f3c]">Selecionar Disciplinas para o Curso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {disciplinas.map((disciplina) => (
              <div 
                key={disciplina.id} 
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  disciplina.selecionada 
                    ? 'border-[#ea2be2] bg-[#ea2be2]/10' 
                    : 'border-gray-200 hover:border-[#ea2be2]/50'
                }`}
                onClick={() => handleSelecaoDisciplina(disciplina.id)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={disciplina.selecionada || false}
                    onChange={() => handleSelecaoDisciplina(disciplina.id)}
                    className="mt-1 mr-2"
                  />
                  <div>
                    <h3 className="font-medium text-[#272f3c]">{disciplina.titulo}</h3>
                    <p className="text-sm text-[#67748a]">{disciplina.descricao}</p>
                    <p className="text-xs text-[#67748a] mt-1">
                      {disciplina.aulas_ids?.length || 0} aulas
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cursos;
