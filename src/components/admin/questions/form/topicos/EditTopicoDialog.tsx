
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topico } from "../../types";

interface EditTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  topicosList: Topico[];
  currentTopico: Topico | null;
  setCurrentTopico: (topico: Topico | null) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleEditTopico: () => void;
}

const EditTopicoDialog: React.FC<EditTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  topicosList,
  currentTopico,
  setCurrentTopico,
  newTopicoNome,
  setNewTopicoNome,
  handleEditTopico
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="topico-select">Selecione o Tópico</Label>
            <Select
              onValueChange={(value) => {
                const selected = topicosList.find(t => t.id === value);
                if (selected) {
                  setCurrentTopico(selected);
                  setNewTopicoNome(selected.nome);
                }
              }}
              value={currentTopico?.id || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tópico" />
              </SelectTrigger>
              <SelectContent>
                {topicosList.map(topico => (
                  <SelectItem key={topico.id} value={topico.id}>
                    {topico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentTopico && (
            <div className="space-y-2">
              <Label htmlFor="novo-nome-topico">Novo Nome</Label>
              <Input
                id="novo-nome-topico"
                value={newTopicoNome}
                onChange={(e) => setNewTopicoNome(e.target.value)}
                placeholder="Digite o novo nome"
              />
            </div>
          )}
          <Button 
            onClick={handleEditTopico} 
            className="w-full"
            disabled={!currentTopico}
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicoDialog;
