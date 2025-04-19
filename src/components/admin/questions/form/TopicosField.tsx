import React, { useState, useEffect, useMemo } from 'react';
import { useTopicosService } from '@/hooks/useTopicosService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import OptionsMenu from '@/components/common/OptionsMenu';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface TopicosFieldProps {
  disciplina: string | null;
  assuntos: string[] | null;
  topicos: string[] | null;
  setTopicos: (topicos: string[]) => void;
  onAddTopico: (topico: string) => Promise<boolean>;
  onUpdateTopico: (oldTopico: string, newTopico: string) => Promise<boolean>;
  onDeleteTopico: (topico: string) => Promise<boolean>;
  initialAssunto?: string;
}

export default function TopicosField({
  disciplina,
  assuntos,
  topicos,
  setTopicos,
  onAddTopico,
  onUpdateTopico,
  onDeleteTopico,
  initialAssunto
}: TopicosFieldProps) {
  const { toast } = useToast();
  const [isAddingTopico, setIsAddingTopico] = useState(false);
  const [isEditingTopico, setIsEditingTopico] = useState(false);
  const [isDeletingTopico, setIsDeletingTopico] = useState(false);
  const [selectedTopicoForEdit, setSelectedTopicoForEdit] = useState<string>('');
  const [novoTopicoName, setNovoTopicoName] = useState<string>('');

  // Garantir que os arrays sejam válidos
  const safeAssuntos = useMemo(() => {
    return Array.isArray(assuntos) ? assuntos : [];
  }, [assuntos]);

  const safeTopicos = useMemo(() => {
    return Array.isArray(topicos) ? topicos : [];
  }, [topicos]);

  // Usar o hook para buscar tópicos
  const { topicos: availableTopicos, isLoading, error } = useTopicosService(disciplina, safeAssuntos, initialAssunto);

  // Adicionar um novo tópico
  const handleAddTopico = async (topico: string) => {
    if (!topico.trim()) return;
    
    try {
      const success = await onAddTopico(topico);
      
      if (success) {
        // Adicionar o novo tópico à lista e atualizar o formulário
        const newTopicos = [...safeTopicos, topico];
        setTopicos(newTopicos);
        
        toast({
          title: "Tópico adicionado",
          description: `O tópico "${topico}" foi adicionado com sucesso.`
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar tópico",
        description: "Ocorreu um erro ao tentar adicionar o tópico."
      });
    }
    
    setIsAddingTopico(false);
    setNovoTopicoName('');
  };

  // Editar um tópico existente
  const handleEditTopico = async (oldTopico: string, newTopico: string) => {
    if (!newTopico.trim() || oldTopico === newTopico) {
      setIsEditingTopico(false);
      return;
    }
    
    try {
      const success = await onUpdateTopico(oldTopico, newTopico);
      
      if (success) {
        // Atualizar o tópico na lista e no formulário
        const newTopicos = safeTopicos.map(t => 
          t === oldTopico ? newTopico : t
        );
        setTopicos(newTopicos);
        
        toast({
          title: "Tópico atualizado",
          description: `O tópico foi atualizado de "${oldTopico}" para "${newTopico}".`
        });
      }
    } catch (error) {
      console.error("Erro ao editar tópico:", error);
      toast({
        variant: "destructive",
        title: "Erro ao editar tópico",
        description: "Ocorreu um erro ao tentar editar o tópico."
      });
    }
    
    setIsEditingTopico(false);
    setSelectedTopicoForEdit('');
  };

  // Excluir um tópico
  const handleDeleteTopico = async (topico: string) => {
    try {
      const success = await onDeleteTopico(topico);
      
      if (success) {
        // Remover o tópico da lista e atualizar o formulário
        const newTopicos = safeTopicos.filter(t => t !== topico);
        setTopicos(newTopicos);
        
        toast({
          title: "Tópico excluído",
          description: `O tópico "${topico}" foi excluído com sucesso.`
        });
      }
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir tópico",
        description: "Ocorreu um erro ao tentar excluir o tópico."
      });
    }
    
    setIsDeletingTopico(false);
    setSelectedTopicoForEdit('');
  };

  const handleTopicoSelect = (topico: string, checked: boolean) => {
    let updatedTopicos;
    
    if (checked) {
      // Adicionar à lista se não existir
      updatedTopicos = [...safeTopicos, topico];
    } else {
      // Remover da lista se existir
      updatedTopicos = safeTopicos.filter(t => t !== topico);
    }
    
    setTopicos(updatedTopicos);
  };

  if (!disciplina) {
    return (
      <div className="flex flex-col space-y-2">
        <Label className="text-sm font-medium">Tópicos</Label>
        <div className="p-4 border rounded-md text-center text-gray-500">
          Selecione uma disciplina para ver os tópicos
        </div>
      </div>
    );
  }

  if (safeAssuntos?.length === 0) {
    return (
      <div className="flex flex-col space-y-2">
        <Label className="text-sm font-medium">Tópicos</Label>
        <div className="p-4 border rounded-md text-center text-gray-500">
          Selecione pelo menos um assunto para ver os tópicos
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <Label className="text-sm font-medium">Tópicos</Label>
        <div className="p-4 border rounded-md flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-500">Carregando tópicos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-2">
        <Label className="text-sm font-medium">Tópicos</Label>
        <div className="p-4 border rounded-md text-center text-red-500">
          Erro ao carregar tópicos: {error}
        </div>
      </div>
    );
  }

  if (availableTopicos.length === 0) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Tópicos</Label>
          <button
            type="button"
            onClick={() => setIsAddingTopico(true)}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Novo tópico
          </button>
        </div>
        <div className="p-4 border rounded-md text-center text-gray-500">
          Nenhum tópico encontrado para os assuntos selecionados.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Tópicos</Label>
        <button
          type="button"
          onClick={() => setIsAddingTopico(true)}
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Novo tópico
        </button>
      </div>
      
      <ScrollArea className="h-[220px] rounded-md border p-2">
        <div className="space-y-2.5">
          {availableTopicos.map((topico) => (
            <div key={topico} className="flex items-center justify-between gap-2 rounded-md border p-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`topico-${topico}`}
                  checked={safeTopicos.includes(topico)}
                  onCheckedChange={(checked) => handleTopicoSelect(topico, checked === true)}
                />
                <Label 
                  htmlFor={`topico-${topico}`}
                  className={cn(
                    "text-sm cursor-pointer select-none",
                    safeTopicos.includes(topico) ? "font-medium" : ""
                  )}
                >
                  {topico}
                </Label>
              </div>
              
              <OptionsMenu 
                trigger={
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu de opções</span>
                  </button>
                }
                items={[
                  {
                    label: "Editar",
                    onClick: () => {
                      setSelectedTopicoForEdit(topico);
                      setNovoTopicoName(topico);
                      setIsEditingTopico(true);
                    }
                  },
                  {
                    label: "Excluir",
                    onClick: () => {
                      setSelectedTopicoForEdit(topico);
                      setIsDeletingTopico(true);
                    },
                    className: "text-red-500"
                  }
                ]}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
