
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeacherSocialMediaProps {
  formData: {
    instagram: string;
    twitter: string;
    facebook: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TeacherSocialMedia: React.FC<TeacherSocialMediaProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-[#022731]">Redes Sociais</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Input 
            id="instagram" 
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="Instagram (opcional)"
            className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          />
        </div>
        <div>
          <Input 
            id="twitter" 
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            placeholder="Twitter (opcional)"
            className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          />
        </div>
        <div>
          <Input 
            id="facebook" 
            name="facebook"
            value={formData.facebook}
            onChange={handleInputChange}
            placeholder="Facebook (opcional)"
            className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          />
        </div>
      </div>
    </div>
  );
};
