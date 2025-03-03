
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VincularCursoModalProps } from "./SimuladosTypes";
import { toast } from "sonner";

export const VincularCursoModal: React.FC<VincularCursoModalProps> = ({
  isOpen,
  onClose,
  simuladoId,
  onVincular,
}) => {
  const [cursoId, setCursoId] = useState("");

  const handleVincular = () => {
    if (cursoId.trim()) {
      onVincular(simuladoId, cursoId.trim());
      setCursoId("");
      onClose();
    } else {
      toast.error("Por favor, informe o ID do curso.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Vincular Simulado a um Curso</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Informe o ID do curso para vincular este simulado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cursoId" className="text-right">
              ID do Curso
            </Label>
            <Input
              id="cursoId"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="col-span-3 border-[#ea2be2] focus-visible:ring-[#ea2be2]"
            />
          </div>
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
            onClick={handleVincular}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
