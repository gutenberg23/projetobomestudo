
import { useState } from "react";
import { Topico } from "../TopicosTypes";

export const useTopicosState = () => {
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

  return {
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
  };
};
