
import { useState, useMemo } from "react";
import { Topico } from "../TopicosTypes";

export const useTopicosFiltrados = (
  topicos: Topico[],
  searchTerm: string,
  disciplinaFiltro: string
) => {
  // Função para filtrar tópicos
  const topicosFiltrados = useMemo(() => {
    return topicos.filter((topico) => {
      const matchesTitulo = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDisciplina = disciplinaFiltro 
        ? topico.disciplina.toLowerCase().includes(disciplinaFiltro.toLowerCase())
        : true;
      
      return matchesTitulo && matchesDisciplina;
    });
  }, [topicos, searchTerm, disciplinaFiltro]);

  // Verificar se todos os tópicos estão selecionados
  const todosSelecionados = useMemo(() => {
    return topicosFiltrados.length > 0 && topicosFiltrados.every(topico => topico.selecionado);
  }, [topicosFiltrados]);

  return {
    topicosFiltrados,
    todosSelecionados
  };
};
