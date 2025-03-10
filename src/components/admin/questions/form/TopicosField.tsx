
import React, { useEffect } from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import TopicosToolbar from "./topicos/TopicosToolbar";
import TopicosLoading from "./topicos/TopicosLoading";
import AddTopicoDialog from "./topicos/AddTopicoDialog";
import EditTopicoDialog from "./topicos/EditTopicoDialog";
import DeleteTopicoDialog from "./topicos/DeleteTopicoDialog";
import { useTopicosService } from "./topicos/useTopicosService";
import { Label } from "@/components/ui/label";
import { Topico } from "../types";

interface TopicosFieldProps {
  disciplina: string;
  topicos: string[];
  setTopicos: (topicos: string[]) => void;
}

interface TopicOption {
  id: string;
  name: string;
  parent?: string;
  level: number;
}

const TopicosField: React.FC<TopicosFieldProps> = ({
  disciplina,
  topicos,
  setTopicos
}) => {
  const {
    topicosList,
    loading,
    currentTopico,
    setCurrentTopico,
    newTopicoNome,
    setNewTopicoNome,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleTopicosChange,
    handleAddTopico,
    handleEditTopico,
    handleDeleteTopico
  } = useTopicosService(disciplina, topicos, setTopicos);

  // Converter tópicos para o formato hierárquico
  const topicsHierarchy = React.useMemo(() => {
    const result: TopicOption[] = [];
    
    // Primeiro passo: identificar os níveis dos tópicos
    topicosList.forEach(topico => {
      const nameParts = topico.nome.split('.');
      const level = nameParts.length - 1;
      const name = topico.nome;
      
      // Encontrar o pai (se existir)
      let parent: string | undefined = undefined;
      
      if (level > 0) {
        // Remove o último número e ponto para obter o pai
        const parentName = nameParts.slice(0, -1).join('.');
        const parentTopic = topicosList.find(t => t.nome === parentName);
        if (parentTopic) {
          parent = parentTopic.id;
        }
      }
      
      result.push({
        id: topico.id,
        name,
        parent,
        level
      });
    });
    
    return result;
  }, [topicosList]);

  if (!disciplina) {
    return null;
  }

  return (
    <div className="w-full">
      <Label className="block text-sm font-medium text-[#272f3c]">
        Tópicos
      </Label>

      <div className="flex flex-col gap-2">
        {loading ? (
          <TopicosLoading />
        ) : (
          <CheckboxGroup
            title=""
            options={topicsHierarchy}
            selectedValues={topicos}
            onChange={handleTopicosChange}
            placeholder="Selecione os tópicos"
            hierarchical={true}
          />
        )}

        <div className="flex gap-2 justify-end">
          <TopicosToolbar 
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            topicosList={topicosList}
            iconsOnly={true}
          />
        </div>
      </div>

      {/* Dialogs for adding, editing, and deleting topics */}
      <AddTopicoDialog 
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        newTopicoNome={newTopicoNome}
        setNewTopicoNome={setNewTopicoNome}
        handleAddTopico={handleAddTopico}
      />

      <EditTopicoDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        topicosList={topicosList}
        currentTopico={currentTopico}
        setCurrentTopico={setCurrentTopico}
        newTopicoNome={newTopicoNome}
        setNewTopicoNome={setNewTopicoNome}
        handleEditTopico={handleEditTopico}
      />

      <DeleteTopicoDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        topicosList={topicosList}
        currentTopico={currentTopico}
        setCurrentTopico={setCurrentTopico}
        handleDeleteTopico={handleDeleteTopico}
      />
    </div>
  );
};

export default TopicosField;
