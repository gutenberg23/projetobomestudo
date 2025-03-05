
import React, { useState } from "react";
import { 
  TopicosFilter, 
  TopicosTable, 
  AdicionarAula,
  EditTopicoModal,
  DeleteTopicoModal
} from "./components/topicos";
import { Topico } from "./components/topicos/TopicosTypes";

const Topicos = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");

  // Estados para a adição de aula
  const [tituloNovaAula, setTituloNovaAula] = useState("");
  const [descricaoNovaAula, setDescricaoNovaAula] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);

  // Dados mockados de tópicos para demonstração
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
      selecionado: false
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
      selecionado: false
    },
    {
      id: "3",
      titulo: "Matemática Financeira",
      thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3",
      patrocinador: "NumeroUm",
      disciplina: "Matemática",
      videoUrl: "https://www.youtube.com/watch?v=example3",
      pdfUrl: "https://example.com/pdf/matematica.pdf",
      mapaUrl: "https://example.com/mapa/matematica.pdf",
      resumoUrl: "https://example.com/resumo/matematica.pdf",
      questoesIds: ["301", "302", "303", "304"],
      selecionado: false
    }
  ]);

  // Função para filtrar tópicos
  const topicosFiltrados = topicos.filter((topico) => {
    const matchesTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisciplina = disciplinaFiltro 
      ? topico.disciplina.toLowerCase().includes(disciplinaFiltro.toLowerCase())
      : true;
    
    return matchesTitulo && matchesDisciplina;
  });

  // Função para verificar se todos os tópicos estão selecionados
  const todosSelecionados = topicosFiltrados.length > 0 && topicosFiltrados.every(topico => topico.selecionado);

  // Funções para manipulação de seleção
  const handleSelecaoTodos = () => {
    setTopicos(topicos.map(topico => {
      if (topicosFiltrados.some(topicoFiltrado => topicoFiltrado.id === topico.id)) {
        return { ...topico, selecionado: !todosSelecionados };
      }
      return topico;
    }));
  };

  const handleSelecaoTopico = (id: string) => {
    setTopicos(topicos.map(topico => 
      topico.id === id ? { ...topico, selecionado: !topico.selecionado } : topico
    ));
  };

  // Funções para abrir modais
  const openEditModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  // Função para salvar tópico editado
  const handleSaveTopico = (updatedTopico: Topico) => {
    setTopicos(topicos.map(topico => 
      topico.id === updatedTopico.id ? updatedTopico : topico
    ));
    setIsOpenEdit(false);
  };

  // Função para excluir tópico
  const handleDeleteTopico = (id: string) => {
    setTopicos(topicos.filter(topico => topico.id !== id));
    setIsOpenDelete(false);
  };

  // Função para adicionar aula
  const handleAdicionarAula = () => {
    if (tituloNovaAula.trim()) {
      // Lógica para adicionar aula com os tópicos selecionados
      const topicosSelecionados = topicos
        .filter(topico => topico.selecionado)
        .map(topico => topico.id);
      
      console.log("Adicionando aula:", {
        titulo: tituloNovaAula,
        descricao: descricaoNovaAula,
        topicosIds: topicosSelecionados
      });
      
      // Resetar campos após adicionar
      setTituloNovaAula("");
      setDescricaoNovaAula("");
      
      // Desmarcar todos os tópicos após adicionar
      setTopicos(topicos.map(topico => ({...topico, selecionado: false})));
    }
  };

  // Verificar se algum tópico está selecionado
  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Tópicos</h1>
      <p className="text-[#67748a]">Gerenciamento de tópicos das aulas</p>
      
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
        handleSelecaoTodos={handleSelecaoTodos}
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
        handleAdicionarAula={handleAdicionarAula}
        temTopicosSelecionados={temTopicosSelecionados}
      />
      
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
