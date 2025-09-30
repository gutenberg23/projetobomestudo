import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Disciplina, Edital } from '../types';

export const useEditalActions = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const cadastrarDisciplina = async (disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('disciplinaverticalizada')
        .insert({
          titulo: disciplina.titulo,
          descricao: disciplina.descricao,
          topicos: disciplina.topicos,
          links: disciplina.links,
          // Corrigindo arrays multidimensionais para arrays simples
          assuntos: disciplina.assuntos ? disciplina.assuntos.flat() : [],
          topicos_filtro: disciplina.topicos_filtro ? disciplina.topicos_filtro.flat() : [],
          disciplinas_filtro: disciplina.disciplinas_filtro ? disciplina.disciplinas_filtro.flat() : [],
          bancas_filtro: disciplina.bancas_filtro ? disciplina.bancas_filtro.flat() : [],
          quantidade_questoes_filtro: disciplina.quantidade_questoes_filtro
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Disciplina cadastrada com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao cadastrar disciplina:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar disciplina. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarDisciplina = async (id: string, disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando atualização da disciplina:', { id, disciplina });
      
      const { data, error } = await supabase
        .from('disciplinaverticalizada')
        .update({
          titulo: disciplina.titulo,
          descricao: disciplina.descricao,
          topicos: disciplina.topicos,
          links: disciplina.links,
          // Corrigindo arrays multidimensionais para arrays simples
          assuntos: disciplina.assuntos ? disciplina.assuntos.flat() : [],
          topicos_filtro: disciplina.topicos_filtro ? disciplina.topicos_filtro.flat() : [],
          disciplinas_filtro: disciplina.disciplinas_filtro ? disciplina.disciplinas_filtro.flat() : [],
          bancas_filtro: disciplina.bancas_filtro ? disciplina.bancas_filtro.flat() : [],
          quantidade_questoes_filtro: disciplina.quantidade_questoes_filtro
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Disciplina atualizada com sucesso:', data);
      toast({
        title: "Sucesso",
        description: "Disciplina atualizada com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar disciplina:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar disciplina. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const listarDisciplinas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(d => ({ 
        ...d, 
        selecionada: false,
        assuntos: d.assuntos || [],
        topicos_filtro: d.topicos_filtro || [],
        disciplinas_filtro: d.disciplinas_filtro || [],
        bancas_filtro: d.bancas_filtro || [],
        quantidade_questoes_filtro: d.quantidade_questoes_filtro || []
      }));
    } catch (error) {
      console.error('Erro ao listar disciplinas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar disciplinas. Tente novamente.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const excluirDisciplina = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('disciplinaverticalizada')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Disciplina excluída com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir disciplina. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cadastrarEdital = async (edital: Omit<Edital, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cursoverticalizado')
        .insert({
          titulo: edital.titulo,
          curso_id: edital.curso_id,
          disciplinas_ids: edital.disciplinas_ids,
          ativo: edital.ativo
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Edital verticalizado cadastrado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao cadastrar edital:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar edital. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const listarEditais = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao listar editais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar editais. Tente novamente.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAtivoEdital = async (id: string, ativo: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('cursoverticalizado')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Edital ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do edital:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do edital. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const excluirEdital = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('cursoverticalizado')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Edital excluído com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir edital:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir edital. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cadastrarDisciplina,
    listarDisciplinas,
    atualizarDisciplina,
    excluirDisciplina,
    cadastrarEdital,
    listarEditais,
    toggleAtivoEdital,
    excluirEdital
  };
};