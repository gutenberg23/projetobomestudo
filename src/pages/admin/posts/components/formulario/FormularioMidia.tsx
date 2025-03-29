
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormularioMidiaProps {
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
}

export const FormularioMidia: React.FC<FormularioMidiaProps> = ({
  imagemDestaque,
  onChangeImagemDestaque
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Mídia</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imagemDestaque">URL da Imagem Destaque</Label>
          <Input 
            id="imagemDestaque" 
            value={imagemDestaque} 
            onChange={(e) => onChangeImagemDestaque(e.target.value)} 
            placeholder="URL da imagem destaque do post"
          />
        </div>
        
        {imagemDestaque && (
          <div className="border rounded-md overflow-hidden h-40 w-full md:w-1/2 bg-gray-100">
            <img 
              src={imagemDestaque} 
              alt="Imagem Destaque" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
