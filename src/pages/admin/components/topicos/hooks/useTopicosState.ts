
import { useState, useEffect } from "react";
import { Topico } from "../TopicosTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTopicosState = () => {
  // Estados para os tópicos e filtros
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [professorFiltro, setProfessorFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para a adição de aula
  const [tituloNovaAula, setTituloNovaAula] = useState("");
  const [descricaoNovaAula, setDescricaoNovaAula] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);

  // Buscar todos os tópicos do banco de dados quando a página carrega
  useEffect(() => {
    const fetchTopicos = async () => {
      try {
        setLoading(true);
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
          professor_id: item.professor_id || "",
          professor_nome: item.professor_nome || "",
          selecionado: false
        })) || [];
        
        setTopicos(formattedTopicos);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        toast.error("Erro ao carregar os tópicos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicos();
  }, []);

  return {
    topicos,
    setTopicos,
    loading,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    professorFiltro,
    setProfessorFiltro,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
