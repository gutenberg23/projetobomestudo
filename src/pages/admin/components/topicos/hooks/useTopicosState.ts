
import { useState } from "react";
import { Topico } from "../TopicosTypes";
import { useToast } from "@/hooks/use-toast";

export const useTopicosState = () => {
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

  const [disciplinas] = useState([
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

  return {
    topicos,
    setTopicos,
    disciplinas,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    patrocinadorFiltro,
    setPatrocinadorFiltro,
    todosSelecionados,
    setTodosSelecionados,
    toast
  };
};
