
import { Aula } from "../AulasTypes";

export const useAulasFiltrados = (
  aulas: Aula[],
  searchTerm: string,
  descricaoFiltro: string,
  currentPage: number,
  itemsPerPage: number
) => {
  // Filtrar aulas com base nos termos de pesquisa
  const aulasFiltradas = aulas.filter((aula) => {
    const matchesTitulo = aula.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = aula.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Paginar as aulas filtradas
  const totalPages = Math.max(1, Math.ceil(aulasFiltradas.length / itemsPerPage));
  const paginatedAulas = aulasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Verificar se todas as aulas na página atual estão selecionadas
  const todasSelecionadas = paginatedAulas.length > 0 && paginatedAulas.every(aula => aula.selecionada);

  return {
    aulasFiltradas: paginatedAulas,
    todasSelecionadas,
    totalPages,
    totalItems: aulasFiltradas.length
  };
};
