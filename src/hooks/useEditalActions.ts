import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Disciplina } from '../types/edital';
import { useToast } from '@/components/ui/use-toast';

export const useEditalActions = () => {
  const { toast } = useToast();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDisciplinas, setFilteredDisciplinas] = useState<Disciplina[]>([]);
  const [todasSelecionadas, setTodasSelecionadas] = useState(false);

  useEffect(() => {
    const filtered = disciplinas.filter(disciplina =>
      disciplina.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciplina.topicos.some(topico => 
        topico.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredDisciplinas(filtered);
  }, [searchTerm, disciplinas]);

  const toggleSelecaoTodas = () => {
    const novoEstado = !todasSelecionadas;
    setTodasSelecionadas(novoEstado);
    setDisciplinas(disciplinas.map(d => ({
      ...d,
      selecionada: novoEstado
    })));
  };

  const toggleSelecao = (id: string) => {
    setDisciplinas(disciplinas.map(d => 
      d.id === id ? {...d, selecionada: !d.selecionada} : d
    ));
  };

  const adicionarDisciplina = async (disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([disciplina])
        .select()
        .single();

      if (error) throw error;

      const novaDisciplina: Disciplina = {
        ...data,
        selecionada: false
      };

      setDisciplinas(prev => [...prev, novaDisciplina]);
      toast({
        title: "Sucesso!",
        description: "Disciplina adicionada com sucesso.",
      });

      return novaDisciplina;
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a disciplina.",
        variant: "destructive",
      });
      return null;
    }
  };

  const atualizarDisciplina = async (disciplina: Disciplina) => {
    try {
      const { id, selecionada, ...disciplinaData } = disciplina;
      const { data, error } = await supabase
        .from('disciplinas')
        .update(disciplinaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const disciplinaAtualizada: Disciplina = {
        ...data,
        selecionada: selecionada
      };

      setDisciplinas(prev => 
        prev.map(d => d.id === id ? disciplinaAtualizada : d)
      );

      toast({
        title: "Sucesso!",
        description: "Disciplina atualizada com sucesso.",
      });

      return disciplinaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a disciplina.",
        variant: "destructive",
      });
      return null;
    }
  };

  const excluirDisciplina = async (id: string) => {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDisciplinas(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Sucesso!",
        description: "Disciplina excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a disciplina.",
        variant: "destructive",
      });
    }
  };

  const criarEdital = async () => {
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    if (disciplinasSelecionadas.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos uma disciplina para criar o edital.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('editais')
        .insert({
          titulo: 'Novo Edital',
          disciplinas_ids: disciplinasSelecionadas.map(d => d.id),
          ativo: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Edital criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar edital:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o edital.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    disciplinas,
    filteredDisciplinas,
    searchTerm,
    setSearchTerm,
    todasSelecionadas,
    toggleSelecaoTodas,
    toggleSelecao,
    adicionarDisciplina,
    atualizarDisciplina,
    excluirDisciplina,
    criarEdital
  };
}; 