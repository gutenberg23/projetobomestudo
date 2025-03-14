
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

interface ProfilePhotoSectionProps {
  fotoPreview: string | null;
  handleFileSelect: () => void;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  fotoPreview,
  handleFileSelect
}) => {
  // Adicionando um estado local para controlar o carregamento
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUploadClick = () => {
    setIsUploading(true);
    
    // Simulando um upload de arquivo (em produção, isso seria um input file real)
    setTimeout(() => {
      handleFileSelect();
      setIsUploading(false);
      toast.success("Foto atualizada com sucesso");
    }, 500);
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-[#272f3c]">Foto de Perfil</Label>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 h-20 bg-[#f6f8fa] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#5f2ebe]/30">
          {fotoPreview ? (
            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-[#5f2ebe]" />
          )}
        </div>
        
        <div className="flex-1">
          <Button 
            type="button"
            variant="outline" 
            className="w-full border-[#5f2ebe]/30 text-[#272f3c] hover:bg-[#5f2ebe]/10"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Carregando..." : "Selecionar foto"}
          </Button>
          <p className="text-xs text-[#67748a] mt-1">
            Clique para selecionar uma foto de perfil (máx: 2MB)
          </p>
        </div>
      </div>
    </div>
  );
};
