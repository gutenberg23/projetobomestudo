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

  const [disciplinas, setDisciplinas] = useState([
    "Direito Administrativo",
    "Direito Constitucional",
    "Direito Civil",
    "Direito Penal",
    "Direito Tributário",
    "Português",
    "Matemática"
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("todas");
  const [patrocinadorFiltro, setPatrocinadorFiltro] = useState("todos");
  
  const [todosSelecionados, setTodosSelecionados] = useState(false);

  const [tituloAula, setTituloAula] = useState("");

  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  
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
    const novoEstado = !todosSelecionados;
    setTodosSelecionados(novoEstado);
    
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: novoEstado
    })));
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
      description: `Aula "${tituloAula}" criada com ${topicosSelecionados.length} tópicos selecionados.`,
    });
    
    setTopicos(topicos.map(topico => ({
      ...topico,
      selecionado: false
    })));
    setTodosSelecionados(false);
    setTituloAula("");
  };

  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  const topicosFiltrados = topicos.filter(topico => {
    const matchTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisciplina = disciplinaFiltro === "todas" ? true : topico.disciplina === disciplinaFiltro;
    const matchPatrocinador = patrocinadorFiltro === "todos" ? true : topico.patrocinador.toLowerCase().includes(patrocinadorFiltro.toLowerCase());
    
    return matchTitulo && matchDisciplina && matchPatrocinador;
  });

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

      <TopicosTable
        topicos={topicosFiltrados}
        todosSelecionados={todosSelecionados}
        handleSelecaoTodos={handleSelecaoTodos}
        handleSelecaoTopico={handleSelecaoTopico}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />

      <AddAulaButton
        tituloAula={tituloAula}
        setTituloAula={setTituloAula}
        temTopicosSelecionados={temTopicosSelecionados}
        handleCriarAula={handleCriarAula}
      />

      <TopicosModals
        isOpenCreate={isOpenCreate}
        setIsOpenCreate={setIsOpenCreate}
        isOpenEdit={isOpenEdit}
        setIsOpenEdit={setIsOpenEdit}
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        currentTopico={currentTopico}
        setCurrentTopico={setCurrentTopico}
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
