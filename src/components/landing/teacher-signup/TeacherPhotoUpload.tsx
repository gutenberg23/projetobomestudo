
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload } from "lucide-react";

interface TeacherPhotoUploadProps {
  fotoPreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TeacherPhotoUpload: React.FC<TeacherPhotoUploadProps> = ({
  fotoPreview,
  handleFileChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-[#022731]">Foto de Perfil</Label>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-24 h-24 bg-[#e8f1f3] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#2a8e9e]/30">
          {fotoPreview ? (
            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-[#2a8e9e]" />
          )}
        </div>
        
        <div className="flex-1">
          <Button 
            type="button"
            variant="outline" 
            className="w-full border-[#2a8e9e]/30 text-[#022731] hover:bg-[#2a8e9e]/10"
            onClick={() => document.getElementById('fotoPerfil')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Enviar foto
          </Button>
          <input
            id="fotoPerfil"
            name="fotoPerfil"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-[#022731]/60 mt-1">
            Formatos suportados: JPG, PNG. Tamanho máximo: 2MB
          </p>
        </div>
      </div>
    </div>
  );
};
