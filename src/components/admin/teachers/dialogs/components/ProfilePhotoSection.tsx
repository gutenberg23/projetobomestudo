
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload } from "lucide-react";

interface ProfilePhotoSectionProps {
  fotoPreview: string | null;
  handleFileSelect: () => void;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  fotoPreview,
  handleFileSelect
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-[#272f3c]">Foto de Perfil</Label>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 h-20 bg-[#f6f8fa] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#ea2be2]/30">
          {fotoPreview ? (
            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-[#ea2be2]" />
          )}
        </div>
        
        <div className="flex-1">
          <Button 
            type="button"
            variant="outline" 
            className="w-full border-[#ea2be2]/30 text-[#272f3c] hover:bg-[#ea2be2]/10"
            onClick={handleFileSelect}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar foto
          </Button>
          <p className="text-xs text-[#67748a] mt-1">
            Em produção: upload de arquivos JPG, PNG. Máx: 2MB
          </p>
        </div>
      </div>
    </div>
  );
};
