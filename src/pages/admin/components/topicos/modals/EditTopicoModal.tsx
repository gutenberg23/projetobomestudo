
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Topico } from "../TopicosTypes";
import { 
  BasicInfoFields, 
  MediaFields, 
  QuestionsManager 
} from "./components";

interface EditTopicoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentTopico: Topico | null;
  setCurrentTopico: React.Dispatch<React.SetStateAction<Topico | null>>;
  editQuestaoId: string;
  setEditQuestaoId: (id: string) => void;
  handleEditTopico: () => void;
  addQuestaoIdToEdit: () => void;
  removeQuestaoIdFromEdit: (index: number) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  disciplinas: string[];
}

export const EditTopicoModal: React.FC<EditTopicoModalProps> = ({
  isOpen,
  setIsOpen,
  currentTopico,
  setCurrentTopico,
  editQuestaoId,
  setEditQuestaoId,
  handleEditTopico,
  addQuestaoIdToEdit,
  removeQuestaoIdFromEdit,
  handleThumbnailUpload,
  disciplinas
}) => {
  if (!currentTopico) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Campos de informações básicas */}
            <BasicInfoFields 
              newTopico={currentTopico}
              setNewTopico={setCurrentTopico}
              handleThumbnailUpload={(e) => handleThumbnailUpload(e, true)}
              isEditMode={true}
            />
            
            {/* Campos de mídia */}
            <MediaFields 
              newTopico={currentTopico}
              setNewTopico={setCurrentTopico}
            />

            {/* Gerenciador de questões */}
            <QuestionsManager 
              questoesIds={currentTopico.questoesIds}
              newQuestaoId={editQuestaoId}
              setNewQuestaoId={setEditQuestaoId}
              addQuestaoId={addQuestaoIdToEdit}
              removeQuestaoId={removeQuestaoIdFromEdit}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleEditTopico}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
