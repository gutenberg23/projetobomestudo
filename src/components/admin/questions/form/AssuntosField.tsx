import React from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import AssuntosToolbar from "./assuntos/AssuntosToolbar";
import AssuntosLoading from "./assuntos/AssuntosLoading";
import AddAssuntoDialog from "./assuntos/AddAssuntoDialog";
import EditAssuntoDialog from "./assuntos/EditAssuntoDialog";
import DeleteAssuntoDialog from "./assuntos/DeleteAssuntoDialog";
import { useAssuntosService } from "./assuntos/useAssuntosService";
import { Label } from "@/components/ui/label";

interface AssuntosFieldProps {
  disciplina: string;
  assuntos: string[];
  setAssuntos: (assuntos: string[]) => void;
}

const AssuntosField: React.FC<AssuntosFieldProps> = ({
  disciplina,
  assuntos,
  setAssuntos
}) => {
  const {
    assuntosList,
    loading,
    currentAssunto,
    setCurrentAssunto,
    newAssuntoNome,
    setNewAssuntoNome,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleAssuntosChange,
    handleAddAssunto,
    handleEditAssunto,
    handleDeleteAssunto
  } = useAssuntosService(disciplina, assuntos, setAssuntos);

  if (!disciplina) {
    return null;
  }

  return (
    <div className="w-full">
      <Label className="block text-sm font-medium text-[#272f3c]">
        Assuntos
      </Label>

      <div className="flex flex-col gap-2">
        {loading ? (
          <AssuntosLoading />
        ) : (
          <CheckboxGroup
            title=""
            options={assuntosList.map(t => t.nome).sort((a, b) => a.localeCompare(b))}
            selectedValues={assuntos}
            onChange={handleAssuntosChange}
            placeholder="Selecione os assuntos"
          />
        )}

        <div className="flex gap-2 justify-end">
          <AssuntosToolbar 
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            assuntosList={assuntosList}
            iconsOnly={true}
          />
        </div>
      </div>

      {/* Dialogs for adding, editing, and deleting assuntos */}
      <AddAssuntoDialog 
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        newAssuntoNome={newAssuntoNome}
        setNewAssuntoNome={setNewAssuntoNome}
        handleAddAssunto={handleAddAssunto}
      />

      <EditAssuntoDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        assuntosList={assuntosList}
        currentAssunto={currentAssunto}
        setCurrentAssunto={setCurrentAssunto}
        newAssuntoNome={newAssuntoNome}
        setNewAssuntoNome={setNewAssuntoNome}
        handleEditAssunto={handleEditAssunto}
      />

      <DeleteAssuntoDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        assuntosList={assuntosList}
        currentAssunto={currentAssunto}
        setCurrentAssunto={setCurrentAssunto}
        handleDeleteAssunto={handleDeleteAssunto}
      />
    </div>
  );
};

export default AssuntosField;
