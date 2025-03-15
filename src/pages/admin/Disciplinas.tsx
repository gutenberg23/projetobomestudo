import React, { useState, useEffect } from "react";
import { 
  DisciplinasFilter, 
  DisciplinasTable, 
  AdicionarDisciplina,
  EditDisciplinaModal,
  DeleteDisciplinaModal
} from "./components/disciplinas";
import { Disciplina } from "./components/disciplinas/DisciplinasTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const Disciplinas = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");

  // Estados para a adição de disciplina
  const [tituloNovaDisciplina, setTituloNovaDisciplina] = useState("");
  const [descricaoNovaDisciplina, setDescricaoNovaDisciplina] = useState("");
  const [informacoesCurso, setInformacoesCurso] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentDisciplina, setCurrentDisciplina] = useState<Disciplina | null>(null);

  // Estado para a lista de disciplinas
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);

  // Função melhorada para calcular o total de questões de uma disciplina
  const calcularTotalQuestoesDisciplina = async (aulasIds: string[]): Promise<number> => {
    if (!aulasIds || aulasIds.length === 0) return 0;
    
    let totalQuestoes = 0;
    
    try {
      console.log("Calculando questões para aulas:", aulasIds);
      
      // Buscar todas as aulas desta disciplina
      const { data: aulas, error: aulasError } = await supabase
        .from('aulas')
        .select('questoes_ids, topicos_ids')
        .in('id', aulasIds);
      
      if (aulasError) {
        console.error("Erro ao buscar aulas:", aulasError);
        return 0;
      }
      
      if (!aulas || aulas.length === 0) return 0;
      
      console.log("Aulas encontradas:", aulas.length);
      
      // Para cada aula, contar suas questões diretas
      for (const aula of aulas) {
        if (aula.questoes_ids && aula.questoes_ids.length > 0) {
          console.log(`Aula com ${aula.questoes_ids.length} questões diretas`);
          totalQuestoes += aula.questoes_ids.length;
        }
        
        // Buscar questões dos tópicos da aula
        if (aula.topicos_ids && aula.topicos_ids.length > 0) {
          console.log(`Aula com ${aula.topicos_ids.length} tópicos`);
          
          const { data: topicos, error: topicosError } = await supabase
            .from('topicos')
            .select('questoes_ids')
            .in('id', aula.topicos_ids);
          
          if (topicosError) {
            console.error("Erro ao buscar tópicos:", topicosError);
            continue;
          }
          
          if (topicos) {
            for (const topico of topicos) {
              if (topico.questoes_ids && topico.questoes_ids.length > 0) {
                console.log(`Tópico com ${topico.questoes_ids.length} questões`);
                totalQuestoes += topico.questoes_ids.length;
              }
            }
          }
        }
      }
      
      console.log("Total de questões calculado:", totalQuestoes);
      return totalQuestoes;
    } catch (error) {
      console.error("Erro ao calcular total de questões:", error);
      return 0;
    }
  };

  // Função para carregar disciplinas do banco de dados
  const fetchDisciplinas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*');
      
      if (error) throw error;
      
      const disciplinasProcessadas: Disciplina[] = [];
      
      // Processar cada disciplina para calcular totais
      for (const disciplina of data || []) {
        console.log(`Processando disciplina: ${disciplina.titulo}`);
        
        // Calcular total de questões para cada disciplina
        const totalQuestoes = await calcularTotalQuestoesDisciplina(disciplina.aulas_ids || []);
        
        // Calcular total de tópicos
        let totalTopicos = 0;
        let topicosIds: string[] = [];
        
        if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
          const { data: aulas } = await supabase
            .from('aulas')
            .select('topicos_ids')
            .in('id', disciplina.aulas_ids);
          
          if (aulas) {
            // Usar um Set para evitar contagem duplicada de tópicos
            const todosTopicos = new Set<string>();
            
            for (const aula of aulas) {
              if (aula.topicos_ids) {
                aula.topicos_ids.forEach((id: string) => todosTopicos.add(id));
              }
            }
            
            totalTopicos = todosTopicos.size;
            topicosIds = Array.from(todosTopicos);
          }
        }
        
        disciplinasProcessadas.push({
          id: disciplina.id,
          titulo: disciplina.titulo,
          descricao: disciplina.descricao || "",
          aulasIds: disciplina.aulas_ids || [],
          topicosIds: topicosIds,
          questoesIds: Array(totalQuestoes).fill("").map((_, i) => String(i)),
          selecionada: false,
          favoritos: 0
        });
      }
      
      setDisciplinas(disciplinasProcessadas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setLoading(false);
    }
  };

  // Carregar disciplinas quando a página é montada
  useEffect(() => {
    fetchDisciplinas();
  }, []);

  // Função para filtrar disciplinas
  const disciplinasFiltradas = disciplinas.filter((disciplina) => {
    const matchesTitulo = disciplina.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = disciplina.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Função para verificar se todas as disciplinas estão selecionadas
  const todasSelecionadas = disciplinasFiltradas.length > 0 && disciplinasFiltradas.every(disciplina => disciplina.selecionada);

  // Funções para manipulação de seleção
  const handleSelecaoTodas = () => {
    setDisciplinas(disciplinas.map(disciplina => {
      if (disciplinasFiltradas.some(disciplinaFiltrada => disciplinaFiltrada.id === disciplina.id)) {
        return { ...disciplina, selecionada: !todasSelecionadas };
      }
      return disciplina;
    }));
  };

  const handleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(disciplina => 
      disciplina.id === id ? { ...disciplina, selecionada: !disciplina.selecionada } : disciplina
    ));
  };

  // Funções para abrir modais
  const openEditModal = (disciplina: Disciplina) => {
    setCurrentDisciplina(disciplina);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (disciplina: Disciplina) => {
    setCurrentDisciplina(disciplina);
    setIsOpenDelete(true);
  };

  // Função para salvar disciplina editada
  const handleSaveDisciplina = async (updatedDisciplina: Disciplina) => {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .update({
          titulo: updatedDisciplina.titulo,
          descricao: updatedDisciplina.descricao, // This now contains the rating value
          aulas_ids: updatedDisciplina.aulasIds
        })
        .eq('id', updatedDisciplina.id);
      
      if (error) throw error;
      
      // Atualizar a disciplina com totais recalculados
      const totalQuestoes = await calcularTotalQuestoesDisciplina(updatedDisciplina.aulasIds);
      
      // Atualizar o estado local
      setDisciplinas(disciplinas.map(disciplina => 
        disciplina.id === updatedDisciplina.id 
          ? { 
              ...updatedDisciplina, 
              questoesIds: Array(totalQuestoes).fill("").map((_, i) => String(i)) 
            } 
          : disciplina
      ));
      
      setIsOpenEdit(false);
      toast.success("Disciplina atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      toast.error("Erro ao atualizar disciplina");
    }
  };

  // Função para excluir disciplina
  const handleDeleteDisciplina = async (id: string) => {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDisciplinas(disciplinas.filter(disciplina => disciplina.id !== id));
      setIsOpenDelete(false);
      toast.success("Disciplina excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir disciplina:", error);
      toast.error("Erro ao excluir disciplina");
    }
  };

  // Função para adicionar disciplina
  const handleAdicionarDisciplina = async () => {
    if (!tituloNovaDisciplina.trim()) {
      toast.error("O título da disciplina é obrigatório");
      return;
    }
    
    // Lógica para adicionar disciplina com as aulas selecionadas
    const aulasIds = disciplinas
      .filter(disciplina => disciplina.selecionada)
      .flatMap(disciplina => disciplina.aulasIds);
    
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([
          {
            titulo: tituloNovaDisciplina,
            descricao: descricaoNovaDisciplina, // This will store the rating
            aulas_ids: aulasIds
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Disciplina adicionada com sucesso!");
      
      // Resetar campos após adicionar
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      setInformacoesCurso("");
      
      // Desmarcar todas as disciplinas após adicionar
      setDisciplinas(disciplinas.map(disciplina => ({...disciplina, selecionada: false})));
      
      // Recarregar disciplinas
      fetchDisciplinas();
    } catch (error) {
      console.error("Erro ao adicionar disciplina:", error);
      toast.error("Erro ao adicionar disciplina");
    }
  };

  // Função para adicionar curso
  const handleAdicionarCurso = async () => {
    if (!tituloNovaDisciplina.trim()) {
      toast.error("O título do curso é obrigatório");
      return;
    }
    
    const disciplinasSelecionadas = disciplinas
      .filter(disciplina => disciplina.selecionada)
      .map(disciplina => disciplina.id);
    
    if (disciplinasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma disciplina para o curso");
      return;
    }
    
    try {
      // Buscar aulas, tópicos e questões relacionadas às disciplinas
      let todasAulasIds: string[] = [];
      let todosTopicosIds: string[] = [];
      let todasQuestoesIds: string[] = [];
      
      for (const disciplinaId of disciplinasSelecionadas) {
        const disciplina = disciplinas.find(d => d.id === disciplinaId);
        
        if (disciplina && disciplina.aulasIds?.length) {
          // Adicionar aulas desta disciplina
          todasAulasIds = [...todasAulasIds, ...disciplina.aulasIds];
          
          // Buscar tópicos e questões para cada aula
          for (const aulaId of disciplina.aulasIds) {
            const { data: aula } = await supabase
              .from('aulas')
              .select('topicos_ids, questoes_ids')
              .eq('id', aulaId)
              .single();
            
            if (aula) {
              if (aula.topicos_ids) {
                todosTopicosIds = [...todosTopicosIds, ...aula.topicos_ids];
                
                // Buscar questões de cada tópico
                for (const topicoId of aula.topicos_ids) {
                  const { data: topico } = await supabase
                    .from('topicos')
                    .select('questoes_ids')
                    .eq('id', topicoId)
                    .single();
                  
                  if (topico && topico.questoes_ids) {
                    todasQuestoesIds = [...todasQuestoesIds, ...topico.questoes_ids];
                  }
                }
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
      
      // Criar o curso
      const { data, error } = await supabase
        .from('cursos')
        .insert([
          {
            titulo: tituloNovaDisciplina,
            descricao: descricaoNovaDisciplina,
            informacoes_curso: informacoesCurso,
            disciplinas_ids: disciplinasSelecionadas,
            aulas_ids: todasAulasIds,
            topicos_ids: todosTopicosIds,
            questoes_ids: todasQuestoesIds
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Curso adicionado com sucesso!");
      
      // Resetar campos após adicionar
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      setInformacoesCurso("");
      
      // Desmarcar todas as disciplinas após adicionar
      setDisciplinas(disciplinas.map(disciplina => ({...disciplina, selecionada: false})));
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      toast.error("Erro ao adicionar curso");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Disciplinas</h1>
      <p className="text-[#67748a]">Gerenciamento de disciplinas</p>
      
      {/* Componente de filtro */}
      <DisciplinasFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de disciplinas */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <DisciplinasTable 
          disciplinas={disciplinasFiltradas}
          todasSelecionadas={todasSelecionadas}
          handleSelecaoTodas={handleSelecaoTodas}
          handleSelecaoDisciplina={handleSelecaoDisciplina}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
      )}
      
      {/* Componente para adicionar disciplina */}
      <AdicionarDisciplina 
        tituloNovaDisciplina={tituloNovaDisciplina}
        setTituloNovaDisciplina={setTituloNovaDisciplina}
        descricaoNovaDisciplina={descricaoNovaDisciplina}
        setDescricaoNovaDisciplina={setDescricaoNovaDisciplina}
        informacoesCurso={informacoesCurso}
        setInformacoesCurso={setInformacoesCurso}
        handleAdicionarDisciplina={handleAdicionarCurso}
        todasSelecionadas={todasSelecionadas}
        disciplinas={disciplinas}
      />
      
      {/* Modais de edição e exclusão */}
      <EditDisciplinaModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        disciplina={currentDisciplina}
        onSave={handleSaveDisciplina}
      />
      
      <DeleteDisciplinaModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        disciplina={currentDisciplina}
        onDelete={handleDeleteDisciplina}
      />
    </div>
  );
};

export default Disciplinas;
