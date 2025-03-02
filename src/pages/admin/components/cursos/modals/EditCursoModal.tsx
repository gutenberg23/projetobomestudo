
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
import { EditCursoModalProps } from "../CursosTypes";
import { X } from "lucide-react";

export const EditCursoModal: React.FC<EditCursoModalProps> = ({
  isOpen,
  onClose,
  curso,
  onSave,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinasIds, setDisciplinasIds] = useState<string[]>([]);

  useEffect(() => {
    if (curso) {
      setTitulo(curso.titulo);
      setDescricao(curso.descricao);
      setDisciplinasIds([...curso.disciplinasIds]);
    }
  }, [curso]);

  const handleAddDisciplina = () => {
    if (disciplinaId.trim()) {
      setDisciplinasIds([...disciplinasIds, disciplinaId.trim()]);
      setDisciplinaId("");
    }
  };

  const handleRemoveDisciplina = (index: number) => {
    const newDisciplinasIds = [...disciplinasIds];
    newDisciplinasIds.splice(index, 1);
    setDisciplinasIds(newDisciplinasIds);
  };

  const handleSave = () => {
    if (curso && titulo.trim() && descricao.trim()) {
      onSave({
        ...curso,
        titulo,
        descricao,
        disciplinasIds,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Curso</DialogTitle>
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
              className="col-span-3 border-[#ea2be2] focus-visible:ring-[#ea2be2]"
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
              className="col-span-3 border-[#ea2be2] focus-visible:ring-[#ea2be2]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="disciplinas" className="text-right">
              IDs das Disciplinas
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="disciplinas"
                value={disciplinaId}
                onChange={(e) => setDisciplinaId(e.target.value)}
                placeholder="Digite o ID da disciplina"
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
              <Button
                type="button"
                onClick={handleAddDisciplina}
                className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
              >
                Adicionar
              </Button>
            </div>
          </div>
          {disciplinasIds.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-start-2 col-span-3">
                <div className="text-sm font-medium mb-2">Disciplinas adicionadas:</div>
                <div className="flex flex-wrap gap-2">
                  {disciplinasIds.map((id, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-[#f6f8fa] px-2 py-1 rounded-md"
                    >
                      <span className="text-sm text-[#67748a]">{id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDisciplina(index)}
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
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
