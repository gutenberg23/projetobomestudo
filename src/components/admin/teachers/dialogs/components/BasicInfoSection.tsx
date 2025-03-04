
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfoSectionProps {
  formData: {
    nomeCompleto: string;
    email: string;
    linkYoutube: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ 
  formData, 
  handleInputChange 
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nomeCompleto" className="text-[#272f3c]">Nome Completo*</Label>
        <Input 
          id="nomeCompleto" 
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={handleInputChange}
          placeholder="Digite o nome completo"
          className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#272f3c]">E-mail*</Label>
        <Input 
          id="email" 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="email@exemplo.com"
          className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkYoutube" className="text-[#272f3c]">Link do Canal no YouTube</Label>
        <Input 
          id="linkYoutube" 
          name="linkYoutube"
          value={formData.linkYoutube}
          onChange={handleInputChange}
          placeholder="https://youtube.com/c/seucanal"
          className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
        />
      </div>
    </div>
  );
};
