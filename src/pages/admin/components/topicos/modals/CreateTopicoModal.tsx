
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Topico } from "../TopicosTypes";

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Criar Novo Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Conteúdo do formulário */}
          <p className="text-[#67748a]">Adicione os detalhes do novo tópico</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button className="bg-[#ea2be2] hover:bg-[#ea2be2]/90" onClick={handleCreateTopico}>
            Criar Tópico
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
