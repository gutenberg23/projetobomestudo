
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormularioDestaqueProps {
  destacado: boolean;
  onChangeDestacado: (value: boolean) => void;
}

export const FormularioDestaque: React.FC<FormularioDestaqueProps> = ({
  destacado,
  onChangeDestacado
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Opções de Destaque</h3>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="destacado" 
          checked={destacado} 
          onCheckedChange={(checked) => onChangeDestacado(!!checked)} 
        />
        <Label htmlFor="destacado" className="font-normal">
          Destacar post na página inicial
        </Label>
      </div>
      <p className="text-xs text-[#67748a] mt-2">
        Posts destacados aparecem com destaque visual na página principal do blog e no topo da listagem.
      </p>
    </div>
  );
};
