
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditAulaModalProps } from "../AulasTypes";
import { X } from "lucide-react";

export const EditAulaModal: React.FC<EditAulaModalProps> = ({
  isOpen,
  onClose,
  aula,
  onSave,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [topicoId, setTopicoId] = useState("");
  const [topicosIds, setTopicosIds] = useState<string[]>([]);

  useEffect(() => {
    if (aula) {
      setTitulo(aula.titulo);
      setDescricao(aula.descricao);
      setTopicosIds([...aula.topicosIds]);
    }
  }, [aula]);

  const handleAddTopico = () => {
    if (topicoId.trim()) {
      setTopicosIds([...topicosIds, topicoId.trim()]);
      setTopicoId("");
    }
  };

  const handleRemoveTopico = (index: number) => {
    const newTopicosIds = [...topicosIds];
    newTopicosIds.splice(index, 1);
    setTopicosIds(newTopicosIds);
  };

  const handleSave = () => {
    if (aula && titulo.trim() && descricao.trim()) {
      onSave({
        ...aula,
        titulo,
        descricao,
        topicosIds,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Aula</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right">
              Título
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="col-span-3 border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descricao" className="text-right">
              Descrição
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="col-span-3 border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topicos" className="text-right">
              IDs dos Tópicos
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="topicos"
                value={topicoId}
                onChange={(e) => setTopicoId(e.target.value)}
                placeholder="Digite o ID do tópico"
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
              <Button
                type="button"
                onClick={handleAddTopico}
                className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 w-auto"
              >
                Adicionar
              </Button>
            </div>
          </div>
          {topicosIds.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-start-2 col-span-3">
                <div className="text-sm font-medium mb-2">Tópicos adicionados:</div>
                <div className="flex flex-wrap gap-2">
                  {topicosIds.map((id, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-[#f6f8fa] px-2 py-1 rounded-md"
                    >
                      <span className="text-sm text-[#67748a]">{id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopico(index)}
                        className="text-[#67748a] hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 w-auto"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
