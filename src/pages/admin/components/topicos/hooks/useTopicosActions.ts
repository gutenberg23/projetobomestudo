import { Topico } from "../TopicosTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTopicosActions = (
  topicos: Topico[],
  setTopicos: React.Dispatch<React.SetStateAction<Topico[]>>,
  setIsOpenEdit: (isOpen: boolean) => void,
  setIsOpenDelete: (isOpen: boolean) => void,
  setCurrentTopico: React.Dispatch<React.SetStateAction<Topico | null>>,
  setTituloNovaAula: (titulo: string) => void,
  setDescricaoNovaAula: (descricao: string) => void
) => {
  // Funções para manipulação de seleção
  const handleSelecaoTodos = (topicosFiltrados: Topico[], todosSelecionados: boolean) => {
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
    console.log('Abrindo modal de edição com tópico:', topico);
    console.log('Propriedade abrirEmNovaGuia:', topico.abrirEmNovaGuia);
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  // Função para salvar tópico editado
  const handleSaveTopico = async (updatedTopico: Topico) => {
    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('topicos')
        .update({ 
          nome: updatedTopico.titulo,
          disciplina: updatedTopico.disciplina,
          patrocinador: updatedTopico.patrocinador,
          questoes_ids: updatedTopico.questoesIds,
          professor_id: updatedTopico.professor_id,
          professor_nome: updatedTopico.professor_nome,
          video_url: updatedTopico.videoUrl,
        pdf_url: updatedTopico.pdfUrl,
        mapa_url: updatedTopico.mapaUrl,
        resumo_url: updatedTopico.resumoUrl,
        musica_url: updatedTopico.musicaUrl,
        resumo_audio_url: updatedTopico.resumoAudioUrl,
        caderno_questoes_url: updatedTopico.cadernoQuestoesUrl,
          abrir_em_nova_guia: updatedTopico.abrirEmNovaGuia
        })
        .eq('id', updatedTopico.id);

      if (error) throw error;
      
      // Atualizar na interface
      setTopicos(topicos.map(topico => 
        topico.id === updatedTopico.id ? updatedTopico : topico
      ));
      setIsOpenEdit(false);
      toast.success("Tópico atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
      toast.error("Erro ao atualizar o tópico. Tente novamente.");
    }
  };

  // Função para excluir tópico
  const handleDeleteTopico = async (id: string) => {
    try {
      // Primeiro, buscar todas as aulas que contêm este tópico
      const { data: aulas, error: aulasError } = await supabase
        .from('aulas')
        .select('id, topicos_ids')
        .contains('topicos_ids', [id]);
      
      if (aulasError) throw aulasError;
      
      // Para cada aula, atualizar removendo o tópico da lista
      for (const aula of aulas || []) {
        const topicosAtualizados = aula.topicos_ids.filter((topicoId: string) => topicoId !== id);
        
        const { error } = await supabase
          .from('aulas')
          .update({ topicos_ids: topicosAtualizados })
          .eq('id', aula.id);
        
        if (error) throw error;
      }
      
      // Agora, excluir o tópico
      const { error } = await supabase
        .from('topicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTopicos(topicos.filter(topico => topico.id !== id));
      setIsOpenDelete(false);
      toast.success("Tópico excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir o tópico. Tente novamente.");
    }
  };

  // Função para adicionar aula
  const handleAdicionarAula = async (tituloNovaAula: string, descricaoNovaAula: string) => {
    if (!tituloNovaAula.trim()) {
      toast.error("O título da aula é obrigatório");
      return;
    }
    
    // Obter os tópicos selecionados
    const topicosSelecionados = topicos
      .filter(topico => topico.selecionado)
      .map(topico => topico.id);
    
    if (topicosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um tópico para adicionar a aula");
      return;
    }

    try {
      // Coletar todos os IDs de questões dos tópicos selecionados
      const questoesIdsSet = new Set<string>(); // Usar Set para evitar duplicações
      const topicosSelecionadosCompletos = topicos.filter(topico => topico.selecionado);
      
      // Adicionar todos os IDs de questões dos tópicos selecionados
      topicosSelecionadosCompletos.forEach(topico => {
        if (topico.questoesIds && Array.isArray(topico.questoesIds)) {
          topico.questoesIds.forEach(questaoId => {
            // Verificar se o ID da questão é válido (não vazio)
            if (questaoId && questaoId.trim() !== '') {
              questoesIdsSet.add(questaoId);
            }
          });
        }
      });
      
      // Converter o Set para Array
      const questoesIds = Array.from(questoesIdsSet);
      
      console.log("Adicionando aula com tópicos:", topicosSelecionados);
      console.log("Questões únicas encontradas:", questoesIds);
      console.log("Total de questões:", questoesIds.length);
      
      // Cadastrar a aula no banco de dados usando o método insert correto
      const { data: _, error } = await supabase
        .from('aulas')
        .insert([
          {
            titulo: tituloNovaAula,
            descricao: descricaoNovaAula,
            topicos_ids: topicosSelecionados,
            questoes_ids: questoesIds, // Adicionar os IDs das questões únicas
            status: 'ativo',
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Sucesso ao adicionar a aula
      toast.success(`Aula adicionada com sucesso! Contém ${topicosSelecionados.length} tópicos e ${questoesIds.length} questões únicas.`);
      
      // Resetar campos após adicionar
      setTituloNovaAula("");
      setDescricaoNovaAula("");
      
      // Desmarcar todos os tópicos após adicionar
      setTopicos(topicos.map(topico => ({...topico, selecionado: false})));
    } catch (error: any) {
      console.error("Erro ao adicionar aula:", error);
      toast.error("Erro ao adicionar a aula. Tente novamente.");
    }
  };

  return {
    handleSelecaoTodos,
    handleSelecaoTopico,
    openEditModal,
    openDeleteModal,
    handleSaveTopico,
    handleDeleteTopico,
    handleAdicionarAula
  };
};
