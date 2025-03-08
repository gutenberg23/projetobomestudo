
import { Topico } from "../TopicosTypes";

export const useTopicosFiltrados = (
  topicos: Topico[],
  searchTerm: string,
  disciplinaFiltro: string,
  professorFiltro: string,
  currentPage: number,
  itemsPerPage: number
) => {
  // Filtrar tópicos com base nos termos de pesquisa
  const topicosFiltrados = topicos.filter((topico) => {
    const matchesTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisciplina = disciplinaFiltro 
      ? topico.disciplina.toLowerCase().includes(disciplinaFiltro.toLowerCase())
      : true;
    const matchesProfessor = professorFiltro
      ? (topico.professor_nome || "").toLowerCase().includes(professorFiltro.toLowerCase())
      : true;
    
    return matchesTitulo && matchesDisciplina && matchesProfessor;
  });

  // Paginar os tópicos filtrados
  const totalPages = Math.max(1, Math.ceil(topicosFiltrados.length / itemsPerPage));
  const paginatedTopicos = topicosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Verificar se todos os tópicos na página atual estão selecionados
  const todosSelecionados = paginatedTopicos.length > 0 && paginatedTopicos.every(topico => topico.selecionado);

  return { 
    topicosFiltrados: paginatedTopicos, 
    todosSelecionados,
    totalPages,
    totalItems: topicosFiltrados.length
  };
};
