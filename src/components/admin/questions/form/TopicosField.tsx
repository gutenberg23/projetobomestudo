
import React from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import TopicosToolbar from "./topicos/TopicosToolbar";
import TopicosLoading from "./topicos/TopicosLoading";
import AddTopicoDialog from "./topicos/AddTopicoDialog";
import EditTopicoDialog from "./topicos/EditTopicoDialog";
import DeleteTopicoDialog from "./topicos/DeleteTopicoDialog";
import { useTopicosService } from "./topicos/useTopicosService";
import { Label } from "@/components/ui/label";

interface TopicosFieldProps {
  disciplina: string;
  topicos: string[];
  setTopicos: (topicos: string[]) => void;
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
            options={topicosList.map(t => t.nome).sort((a, b) => a.localeCompare(b))}
            selectedValues={topicos}
            onChange={handleTopicosChange}
            placeholder="Selecione os tópicos"
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
