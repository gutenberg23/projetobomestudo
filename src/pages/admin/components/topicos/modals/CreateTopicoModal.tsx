
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

interface CreateTopicoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newTopico: Omit<Topico, 'id'>;
  setNewTopico: React.Dispatch<React.SetStateAction<Omit<Topico, 'id'>>>;
  newQuestaoId: string;
  setNewQuestaoId: (id: string) => void;
  handleCreateTopico: () => void;
  addQuestaoId: () => void;
  removeQuestaoId: (index: number) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  disciplinas: string[];
}

export const CreateTopicoModal: React.FC<CreateTopicoModalProps> = ({
  isOpen,
  setIsOpen,
  newTopico,
  setNewTopico,
  newQuestaoId,
  setNewQuestaoId,
  handleCreateTopico,
  addQuestaoId,
  removeQuestaoId,
  handleThumbnailUpload,
  disciplinas
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Campos de informações básicas */}
            <BasicInfoFields 
              newTopico={newTopico} 
              setNewTopico={setNewTopico} 
              handleThumbnailUpload={handleThumbnailUpload} 
            />
            
            {/* Campos de mídia */}
            <MediaFields 
              newTopico={newTopico} 
              setNewTopico={setNewTopico} 
            />

            {/* Gerenciador de questões */}
            <QuestionsManager 
              questoesIds={newTopico.questoesIds}
              newQuestaoId={newQuestaoId}
              setNewQuestaoId={setNewQuestaoId}
              addQuestaoId={addQuestaoId}
              removeQuestaoId={removeQuestaoId}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleCreateTopico}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Criar Tópico
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
