
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeacherBasicInfoProps {
  formData: {
    nomeCompleto: string;
    email: string;
    linkYoutube: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TeacherBasicInfo: React.FC<TeacherBasicInfoProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeCompleto" className="text-[#022731]">Nome Completo*</Label>
        <Input 
          id="nomeCompleto" 
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={handleInputChange}
          placeholder="Digite seu nome completo"
          className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#022731]">E-mail*</Label>
        <Input 
          id="email" 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="seu.email@exemplo.com"
          className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkYoutube" className="text-[#022731]">Link do Canal no YouTube*</Label>
        <Input 
          id="linkYoutube" 
          name="linkYoutube"
          value={formData.linkYoutube}
          onChange={handleInputChange}
          placeholder="https://youtube.com/c/seucanal"
          className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          required
        />
      </div>
    </div>
  );
};
