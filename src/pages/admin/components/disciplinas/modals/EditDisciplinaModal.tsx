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
import { EditDisciplinaModalProps } from "../DisciplinasTypes";
import { X } from "lucide-react";

export const EditDisciplinaModal: React.FC<EditDisciplinaModalProps> = ({
  isOpen,
  onClose,
  disciplina,
  onSave,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [aulasIds, setAulasIds] = useState<string[]>([]);
  const [rating, setRating] = useState("");

  useEffect(() => {
    if (disciplina) {
      setTitulo(disciplina.titulo);
      setDescricao(disciplina.descricao);
      setAulasIds([...disciplina.aulasIds]);
      setRating(disciplina.descricao || "");
    }
  }, [disciplina]);

  const handleAddAula = () => {
    if (aulaId.trim()) {
      setAulasIds([...aulasIds, aulaId.trim()]);
      setAulaId("");
    }
  };

  const handleRemoveAula = (index: number) => {
    const newAulasIds = [...aulasIds];
    newAulasIds.splice(index, 1);
    setAulasIds(newAulasIds);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers between 1 and 10
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) {
      setRating(value);
      setDescricao(value); // Update descricao with rating value
    }
  };

  const handleSave = () => {
    if (disciplina && titulo.trim() && rating.trim()) {
      onSave({
        ...disciplina,
        titulo,
        descricao: rating, // Use rating as descricao
        aulasIds,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Disciplina</DialogTitle>
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
              Nota de rating
            </Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="10"
              value={rating}
              onChange={handleRatingChange}
              placeholder="adicione o rating"
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
            <Label htmlFor="aulas" className="text-right">
              IDs das Aulas
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="aulas"
                value={aulaId}
                onChange={(e) => setAulaId(e.target.value)}
                placeholder="Digite o ID da aula"
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
              <Button
                type="button"
                onClick={handleAddAula}
                className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
              >
                Adicionar
              </Button>
            </div>
          </div>
          {aulasIds.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-start-2 col-span-3">
                <div className="text-sm font-medium mb-2">Aulas adicionadas:</div>
                <div className="flex flex-wrap gap-2">
                  {aulasIds.map((id, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-[#f6f8fa] px-2 py-1 rounded-md"
                    >
                      <span className="text-sm text-[#67748a]">{id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAula(index)}
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
