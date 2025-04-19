import React, { useMemo } from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import AddAssuntoDialog from "./assuntos/AddAssuntoDialog";
import EditAssuntoDialog from "./assuntos/EditAssuntoDialog";
import DeleteAssuntoDialog from "./assuntos/DeleteAssuntoDialog";
import { useAssuntosService } from "./assuntos/useAssuntosService";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "lucide-react";

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
  // Garantir que assuntos é sempre um array
  const safeAssuntos = useMemo(() => Array.isArray(assuntos) ? assuntos : [], [assuntos]);

  // Usar diretamente a função passada, pois já foi verificada no componente pai
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
  } = useAssuntosService(
    disciplina, 
    safeAssuntos, 
    setAssuntos // Usar diretamente a função passada
  );

  // Extrair apenas os nomes dos assuntos para exibição
  const assuntosNomes = useMemo(() => 
    assuntosList.map(a => a.nome).sort((a, b) => a.localeCompare(b)),
    [assuntosList]
  );

  if (!disciplina) {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-[#272f3c]">
          Assuntos
        </Label>
        <div className="text-sm text-muted-foreground">
          Selecione uma disciplina primeiro
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-[#272f3c]">
        Assuntos
      </Label>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        <CheckboxGroup
          title=""
          options={assuntosNomes}
          selectedValues={safeAssuntos}
          onChange={handleAssuntosChange}
          placeholder="Selecione os assuntos"
          handleEditOption={(oldValue) => {
            setCurrentAssunto(assuntosList.find(a => a.nome === oldValue) || null);
            setIsEditDialogOpen(true);
          }}
          handleDeleteOption={(value) => {
            setCurrentAssunto(assuntosList.find(a => a.nome === value) || null);
            setIsDeleteDialogOpen(true);
          }}
          openAddDialog={() => setIsAddDialogOpen(true)}
        />
      )}

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
