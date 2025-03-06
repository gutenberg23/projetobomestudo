
import React, { useState, useEffect } from "react";
import { 
  TopicosFilter, 
  TopicosTable, 
  AdicionarAula,
  EditTopicoModal,
  DeleteTopicoModal,
  TopicosHeader
} from "./components/topicos";
import { 
  useTopicosState,
  useTopicosFiltrados,
  useTopicosActions
} from "./components/topicos/hooks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "./components/topicos/TopicosTypes";
import { QuestionsManager } from "./components/topicos/modals/components/QuestionsManager";

const Topicos = () => {
  // Obter estados do hook personalizado
  const {
    topicos,
    setTopicos,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    tituloNovaAula,
    setTituloNovaAula,
    descricaoNovaAula,
    setDescricaoNovaAula,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentTopico,
    setCurrentTopico
  } = useTopicosState();

  // Estado para o modal de criação de tópicos
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopico, setNewTopico] = useState({
    titulo: "",
    disciplina: "",
    patrocinador: "",
    questoesIds: [] as string[]
  });
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  
  // Estado para gerenciamento de questões
  const [newQuestaoId, setNewQuestaoId] = useState("");

  // Obter tópicos filtrados
  const { topicosFiltrados, todosSelecionados } = useTopicosFiltrados(
    topicos,
    searchTerm,
    disciplinaFiltro
  );

  // Obter ações para os tópicos
  const {
    handleSelecaoTodos,
    handleSelecaoTopico,
    openEditModal,
    openDeleteModal,
    handleSaveTopico,
    handleDeleteTopico,
    handleAdicionarAula
  } = useTopicosActions(
    topicos,
    setTopicos,
    setIsOpenEdit,
    setIsOpenDelete,
    setCurrentTopico,
    setTituloNovaAula,
    setDescricaoNovaAula
  );

  // Buscar dados de disciplinas quando o modal é aberto
  useEffect(() => {
    if (isCreateModalOpen) {
      fetchDisciplinas();
    }
  }, [isCreateModalOpen]);

  // Buscar todos os tópicos do banco de dados quando a página carrega
  useEffect(() => {
    fetchTopicos();
  }, []);

  const fetchTopicos = async () => {
    try {
      const { data, error } = await supabase
        .from('topicos')
        .select('*');
      
      if (error) throw error;
      
      // Transformar os dados do Supabase para o formato usado na aplicação
      const formattedTopicos: Topico[] = data?.map(item => ({
        id: item.id,
        titulo: item.nome,
        thumbnail: "",
        patrocinador: item.patrocinador || "Não informado",
        disciplina: item.disciplina,
        videoUrl: "",
        pdfUrl: "",
        mapaUrl: "",
        resumoUrl: "",
        questoesIds: item.questoes_ids || [],
        selecionado: false
      })) || [];
      
      setTopicos(formattedTopicos);
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      toast.error("Erro ao carregar os tópicos. Tente novamente.");
    }
  };

  const fetchDisciplinas = async () => {
    setLoadingDisciplinas(true);
    try {
      // Usamos o select para obter todas as disciplinas e depois filtramos os valores únicos no JavaScript
      const { data, error } = await supabase
        .from('questoes')
        .select('discipline');
      
      if (error) throw error;
      
      // Extrair disciplinas únicas usando Set
      const uniqueDisciplinas = [...new Set(data?.map(item => item.discipline) || [])];
      setDisciplinas(uniqueDisciplinas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar as disciplinas.");
    } finally {
      setLoadingDisciplinas(false);
    }
  };

  // Funções para gerenciar questões
  const addQuestaoId = () => {
    if (!newQuestaoId.trim()) {
      toast.error("Digite um ID de questão válido");
      return;
    }

    if (newTopico.questoesIds.includes(newQuestaoId)) {
      toast.error("Esta questão já foi adicionada");
      return;
    }

    setNewTopico({
      ...newTopico,
      questoesIds: [...newTopico.questoesIds, newQuestaoId]
    });
    setNewQuestaoId("");
  };

  const removeQuestaoId = (index: number) => {
    const updatedQuestoes = [...newTopico.questoesIds];
    updatedQuestoes.splice(index, 1);
    setNewTopico({
      ...newTopico,
      questoesIds: updatedQuestoes
    });
  };

  const handleCreateTopico = async () => {
    if (!newTopico.titulo || !newTopico.disciplina) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topicos')
        .insert([
          { 
            nome: newTopico.titulo,
            disciplina: newTopico.disciplina,
            patrocinador: newTopico.patrocinador,
            questoes_ids: newTopico.questoesIds
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Adicionar o novo tópico à lista
      if (data && data.length > 0) {
        const newCreatedTopico: Topico = {
          id: data[0].id,
          titulo: data[0].nome,
          thumbnail: "",
          patrocinador: data[0].patrocinador || "Não informado",
          disciplina: data[0].disciplina,
          videoUrl: "",
          pdfUrl: "",
          mapaUrl: "",
          resumoUrl: "",
          questoesIds: data[0].questoes_ids || [],
          selecionado: false
        };
        
        setTopicos([...topicos, newCreatedTopico]);
        toast.success("Tópico criado com sucesso!");
        
        // Limpar o formulário
        setNewTopico({
          titulo: "",
          disciplina: "",
          patrocinador: "",
          questoesIds: []
        });
        
        // Fechar o modal
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      toast.error("Erro ao criar o tópico. Tente novamente.");
    }
  };

  // Verificar se algum tópico está selecionado
  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TopicosHeader />
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Criar Tópico
        </Button>
      </div>
      
      {/* Componente de filtro */}
      <TopicosFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        disciplinaFiltro={disciplinaFiltro}
        setDisciplinaFiltro={setDisciplinaFiltro}
      />
      
      {/* Tabela de tópicos */}
      <TopicosTable 
        topicos={topicosFiltrados}
        todosSelecionados={todosSelecionados}
        handleSelecaoTodos={() => handleSelecaoTodos(topicosFiltrados, todosSelecionados)}
        handleSelecaoTopico={handleSelecaoTopico}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      
      {/* Componente para adicionar aula */}
      <AdicionarAula 
        tituloNovaAula={tituloNovaAula}
        setTituloNovaAula={setTituloNovaAula}
        descricaoNovaAula={descricaoNovaAula}
        setDescricaoNovaAula={setDescricaoNovaAula}
        handleAdicionarAula={() => handleAdicionarAula(tituloNovaAula, descricaoNovaAula)}
        temTopicosSelecionados={temTopicosSelecionados}
      />
      
      {/* Modal de criação de tópico */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="topico-titulo">Título</Label>
              <Input
                id="topico-titulo"
                value={newTopico.titulo}
                onChange={(e) => setNewTopico({ ...newTopico, titulo: e.target.value })}
                placeholder="Digite o título do tópico"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-disciplina">Disciplina</Label>
              {loadingDisciplinas ? (
                <div className="text-sm text-[#67748a] p-2 border rounded flex items-center">
                  Carregando disciplinas...
                </div>
              ) : (
                <Select 
                  value={newTopico.disciplina} 
                  onValueChange={(value) => setNewTopico({ ...newTopico, disciplina: value })}
                >
                  <SelectTrigger id="topico-disciplina">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina} value={disciplina}>
                        {disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-patrocinador">Patrocinador</Label>
              <Input
                id="topico-patrocinador"
                value={newTopico.patrocinador}
                onChange={(e) => setNewTopico({ ...newTopico, patrocinador: e.target.value })}
                placeholder="Digite o nome do patrocinador"
              />
            </div>
            
            <QuestionsManager
              questoesIds={newTopico.questoesIds}
              newQuestaoId={newQuestaoId}
              setNewQuestaoId={setNewQuestaoId}
              addQuestaoId={addQuestaoId}
              removeQuestaoId={removeQuestaoId}
              label="Questões"
            />
            
            <Button onClick={handleCreateTopico} className="w-full">Cadastrar Tópico</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modais de edição e exclusão */}
      <EditTopicoModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        topico={currentTopico}
        onSave={handleSaveTopico}
      />
      
      <DeleteTopicoModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        topico={currentTopico}
        onDelete={handleDeleteTopico}
      />
    </div>
  );
};

export default Topicos;
