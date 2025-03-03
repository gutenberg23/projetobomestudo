
import { Topico } from "../TopicosTypes";
import { useTopicosState } from "./useTopicosState";

export const useTopicosFiltrados = () => {
  const { 
    topicos, 
    searchTerm, 
    disciplinaFiltro, 
    patrocinadorFiltro 
  } = useTopicosState();

  const topicosFiltrados = topicos.filter(topico => {
    const matchTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisciplina = disciplinaFiltro === "todas" ? true : topico.disciplina === disciplinaFiltro;
    const matchPatrocinador = patrocinadorFiltro === "todos" ? true : topico.patrocinador.toLowerCase().includes(patrocinadorFiltro.toLowerCase());
    
    return matchTitulo && matchDisciplina && matchPatrocinador;
  });

  const patrocinadores = Array.from(new Set(topicos.map(topico => topico.patrocinador))).filter(Boolean);
  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  return {
    topicosFiltrados,
    patrocinadores,
    temTopicosSelecionados
  };
};
