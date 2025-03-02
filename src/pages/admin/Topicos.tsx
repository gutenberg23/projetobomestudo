import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TopicosFilter } from "./components/topicos/TopicosFilter";
import { TopicosTable } from "./components/topicos/TopicosTable";
import { TopicosModals } from "./components/topicos/TopicosModals";
import { AddAulaButton } from "./components/topicos/TopicosPage";
import { Topico } from "./components/topicos/TopicosTypes";

const Topicos = () => {
  const { toast } = useToast();
  
  // Estado para armazenar tópicos
  const [topicos, setTopicos] = useState<Topico[]>([
    {
      id: "1",
      titulo: "Introdução ao Direito Administrativo",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      patrocinador: "JurisConsult",
      disciplina: "Direito Administrativo",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      pdfUrl: "https://example.com/pdf/direito-admin.pdf",
      mapaUrl: "https://example.com/mapa/direito-admin.pdf",
      resumoUrl: "https://example.com/resumo/direito-admin.pdf",
      questoesIds: ["101", "102", "103"],
      selecionado: false,
      abrirVideoEm: "site"
    },
    {
      id: "2",
      titulo: "Princípios Constitucionais",
      thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      patrocinador: "LegisPro",
      disciplina: "Direito Constitucional",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      pdfUrl: "https://example.com/pdf/principios.pdf",
      mapaUrl: "https://example.com/mapa/principios.pdf",
      resumoUrl: "https://example.com/resumo/principios.pdf",
      questoesIds: ["201", "202"],
      selecionado: false,
      abrirVideoEm: "destino"
    }
  ]);

  // Lista de disciplinas disponíveis
  const [disciplinas, setDisciplinas] = useState([
    "Direito Administrativo",
    "Direito Constitucional",
    "Direito Civil",
    "Direito Penal",
    "Direito Tributário",
    "Português",
    "Matemática"
  ]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("todas");
  const [patrocinadorFiltro, setPatrocinadorFiltro] = useState("todos");
  
  // Estado para indicar se todos os tópicos estão selecionados
  const [todosSelecionados, setTodosSelecionados] = useState(false);

  // Estado para título da aula
  const [tituloAula, setTituloAula] = useState("");

  // Estados para diálogos
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  
  // Estado para o tópico atual (edição/exclusão)
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  
  // Estado para novo tópico
  const [newTopico, setNewTopico] = useState<Omit<Topico, 'id'>>({
    titulo: "",
    thumbnail: "",
    patrocinador: "",
    disciplina: "",
    videoUrl: "",
    pdfUrl: "",
    mapaUrl: "",
    resumoUrl: "",
    questoesIds: [],
    abrirVideoEm: "site"
  });
  
  // Estado para novo ID de questão
  const [newQuestaoId, setNewQuestaoId] = useState("");
  const [editQuestaoId, setEditQuestaoId] = useState("");

  // Função para adicionar ID de questão
  const addQuestaoId = () => {
    if (newQuestaoId.trim() !== "") {
      setNewTopico({
        ...newTopico,
        questoesIds: [...newTopico.questoesIds, newQuestaoId.trim()]
      });
      setNewQuestaoId("");
    }
  };

  // Função para adicionar ID de questão durante edição
  const addQuestaoIdToEdit = () => {
    if (editQuestaoId.trim() !== "" && currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: [...currentTopico.questoesIds, editQuestaoId.trim()]
      });
      setEditQuestaoId("");
    }
  };

  // Função para remover ID de questão
  const removeQuestaoId = (index: number) => {
    setNewTopico({
      ...newTopico,
      questoesIds: newTopico.questoesIds.filter((_, i) => i !== index)
    });
  };

  // Função para remover ID de questão durante edição
  const removeQuestaoIdFromEdit = (index: number) => {
    if (currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: currentTopico.questoesIds.filter((_, i) => i !== index)
      });
    }
  };

  // Função para criar tópico
  const handleCreateTopico = () => {
    if (!newTopico.titulo) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const id = (topicos.length + 1).toString();
    setTopicos([...topicos, { ...newTopico, id, selecionado: false }]);
    
    // Resetar formulário
    setNewTopico({
      titulo: "",
      thumbnail: "",
      patrocinador: "",
      disciplina: "",
      videoUrl: "",
      pdfUrl: "",
      mapaUrl: "",
      resumoUrl: "",
      questoesIds: [],
      abrirVideoEm: "site"
    });
    
    setIsOpenCreate(false);
    
    toast({
      title: "Sucesso",
      description: "Tópico criado com sucesso!",
    });
  };

  // Função para editar tópico
  const handleEditTopico = () => {
    if (currentTopico && !currentTopico.titulo) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (currentTopico) {
      setTopicos(topicos.map(t => t.id === currentTopico.id ? currentTopico : t));
      setIsOpenEdit(false);
      
      toast({
        title: "Sucesso",
        description: "Tópico atualizado com sucesso!",
      });
    }
  };

  // Função para deletar tópico
  const handleDeleteTopico = () => {
    if (currentTopico) {
      setTopicos(topicos.filter(t => t.id !== currentTopico.id));
      setIsOpenDelete(false);
      
      toast({
        title: "Sucesso",
        description: "Tópico removido com sucesso!",
      });
    }
  };

  // Função para abrir modal de edição
  const openEditModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  // Função para abrir modal de exclusão
  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  // Função para simular o upload de thumbnail
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      // Em um ambiente real, você enviaria o arquivo para um servidor
      // Aqui, vamos apenas simular com uma URL fictícia
      const fakeThumbnailUrl = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158`;
      
      if (isEdit && currentTopico) {
        setCurrentTopico({
          ...currentTopico,
          thumbnail: fakeThumbnailUrl
        });
      } else {
        setNewTopico({
          ...newTopico,
          thumbnail: fakeThumbnailUrl
        });
      }

      toast({
        title: "Upload realizado",
        description: "Thumbnail carregada com sucesso!",
      });
    }
  };

  // Função para selecionar/deselecionar um tópico
  const handleSelecaoTopico = (id: string) => {
    const topicoAtualizado = topicos.map(topico => {
      if (topico.id === id) {
        return { ...topico, selecionado: !topico.selecionado };
      }
      return topico;
    });
    
    setTopicos(topicoAtualizado);
    
    // Verifica se todos os tópicos estão selecionados
    const todosMarcados = topicoAtualizado.every(topico => topico.selecionado);
    setTodosSelecionados(todosMarcados);
  };

  // Função para selecionar/deselecionar todos os tópicos
  const handleSelecaoTodos = () => {
    const novoEstado = !todosSelecionados;
    setTodosSelecionados(novoEstado);
    
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: novoEstado
    })));
  };

  // Função para iniciar a criação de uma aula com os tópicos selecionados
  const handleCriarAula = () => {
    const topicosSelecionados = topicos.filter(topico => topico.selecionado);
    
    if (topicosSelecionados.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um tópico para adicionar à aula.",
        variant: "destructive"
      });
      return;
    }
    
    if (!tituloAula.trim()) {
      toast({
        title: "Atenção",
        description: "Informe o título da aula.",
        variant: "destructive"
      });
      return;
    }
    
    // Aqui você implementaria a lógica para criar uma aula com os tópicos selecionados
    toast({
      title: "Aula criada",
      description: `Aula "${tituloAula}" criada com ${topicosSelecionados.length} tópicos selecionados.`,
    });
    
    // Limpa a seleção após criar a aula
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: false
    })));
    setTodosSelecionados(false);
    setTituloAula("");
  };

  // Verificar se há algum tópico selecionado
  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  // Filtragem dos tópicos
  const topicosFiltrados = topicos.filter(topico => {
    const matchTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisciplina = disciplinaFiltro === "todas" ? true : topico.disciplina === disciplinaFiltro;
    const matchPatrocinador = patrocinadorFiltro === "todos" ? true : topico.patrocinador.toLowerCase().includes(patrocinadorFiltro.toLowerCase());
    
    return matchTitulo && matchDisciplina && matchPatrocinador;
  });

  // Lista de patrocinadores únicos para o filtro
  const patrocinadores = Array.from(new Set(topicos.map(topico => topico.patrocinador))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#272f3c]">Tópicos</h1>
          <p className="text-[#67748a]">Gerenciamento de tópicos das aulas</p>
        </div>
        <Button 
          onClick={() => setIsOpenCreate(true)}
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Tópico
        </Button>
      </div>

      {/* Componente de Filtros */}
      <TopicosFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        disciplinaFiltro={disciplinaFiltro}
        setDisciplinaFiltro={setDisciplinaFiltro}
        patrocinadorFiltro={patrocinadorFiltro}
        setPatrocinadorFiltro={setPatrocinadorFiltro}
        disciplinas={disciplinas}
        patrocinadores={patrocinadores}
      />

      {/* Componente de Tabela */}
      <TopicosTable
        topicos={topicosFiltrados}
        todosSelecionados={todosSelecionados}
        handleSelecaoTodos={handleSelecaoTodos}
        handleSelecaoTopico={handleSelecaoTopico}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />

      {/* Componente de Botão Adicionar Aula */}
      <AddAulaButton
        tituloAula={tituloAula}
        setTituloAula={setTituloAula}
        temTopicosSelecionados={temTopicosSelecionados}
        handleCriarAula={handleCriarAula}
      />

      {/* Componente de Modais */}
      <TopicosModals
        isOpenCreate={isOpenCreate}
        setIsOpenCreate={setIsOpenCreate}
        isOpenEdit={isOpenEdit}
        setIsOpenEdit={setIsOpenEdit}
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        currentTopico={currentTopico}
        newTopico={newTopico}
        setNewTopico={setNewTopico}
        newQuestaoId={newQuestaoId}
        setNewQuestaoId={setNewQuestaoId}
        editQuestaoId={editQuestaoId}
        setEditQuestaoId={setEditQuestaoId}
        handleCreateTopico={handleCreateTopico}
        handleEditTopico={handleEditTopico}
        handleDeleteTopico={handleDeleteTopico}
        addQuestaoId={addQuestaoId}
        removeQuestaoId={removeQuestaoId}
        addQuestaoIdToEdit={addQuestaoIdToEdit}
        removeQuestaoIdFromEdit={removeQuestaoIdFromEdit}
        handleThumbnailUpload={handleThumbnailUpload}
        disciplinas={disciplinas}
      />
    </div>
  );
};

export default Topicos;
