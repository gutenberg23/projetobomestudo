
import { useState } from "react";
import { Topico } from "../TopicosTypes";
import { useTopicosState } from "./useTopicosState";

export const useTopicosActions = () => {
  const { topicos, setTopicos, setTodosSelecionados, toast } = useTopicosState();
  
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  
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
  
  const [newQuestaoId, setNewQuestaoId] = useState("");
  const [editQuestaoId, setEditQuestaoId] = useState("");

  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  const [tituloAula, setTituloAula] = useState("");
  const [descricaoAula, setDescricaoAula] = useState("");

  const addQuestaoId = () => {
    if (newQuestaoId.trim() !== "") {
      setNewTopico({
        ...newTopico,
        questoesIds: [...newTopico.questoesIds, newQuestaoId.trim()]
      });
      setNewQuestaoId("");
    }
  };

  const addQuestaoIdToEdit = () => {
    if (editQuestaoId.trim() !== "" && currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: [...currentTopico.questoesIds, editQuestaoId.trim()]
      });
      setEditQuestaoId("");
    }
  };

  const removeQuestaoId = (index: number) => {
    setNewTopico({
      ...newTopico,
      questoesIds: newTopico.questoesIds.filter((_, i) => i !== index)
    });
  };

  const removeQuestaoIdFromEdit = (index: number) => {
    if (currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: currentTopico.questoesIds.filter((_, i) => i !== index)
      });
    }
  };

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

  const openEditModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSelecaoTopico = (id: string) => {
    const topicoAtualizado = topicos.map(topico => {
      if (topico.id === id) {
        return { ...topico, selecionado: !topico.selecionado };
      }
      return topico;
    });
    
    setTopicos(topicoAtualizado);
    
    const todosMarcados = topicoAtualizado.every(topico => topico.selecionado);
    setTodosSelecionados(todosMarcados);
  };

  const handleSelecaoTodos = () => {
    const novoEstado = !topicos.every(topico => topico.selecionado);
    
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: novoEstado
    })));

    setTodosSelecionados(novoEstado);
  };

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
    
    toast({
      title: "Aula criada",
      description: `Aula "${tituloAula}" ${descricaoAula ? `(${descricaoAula})` : ""} criada com ${topicosSelecionados.length} tópicos selecionados.`,
    });
    
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: false
    })));
    setTodosSelecionados(false);
    setTituloAula("");
    setDescricaoAula("");
  };

  return {
    currentTopico,
    setCurrentTopico,
    newTopico,
    setNewTopico,
    newQuestaoId,
    setNewQuestaoId,
    editQuestaoId,
    setEditQuestaoId,
    isOpenCreate,
    setIsOpenCreate,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    tituloAula,
    setTituloAula,
    descricaoAula,
    setDescricaoAula,
    addQuestaoId,
    addQuestaoIdToEdit,
    removeQuestaoId,
    removeQuestaoIdFromEdit,
    handleCreateTopico,
    handleEditTopico,
    handleDeleteTopico,
    openEditModal,
    openDeleteModal,
    handleThumbnailUpload,
    handleSelecaoTopico,
    handleSelecaoTodos,
    handleCriarAula
  };
};
