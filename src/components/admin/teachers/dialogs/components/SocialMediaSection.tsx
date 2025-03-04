
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialMediaSectionProps {
  formData: {
    instagram: string;
    twitter: string;
    facebook: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-[#272f3c]">Redes Sociais</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Input 
            id="instagram" 
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="Instagram (opcional)"
            className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
          />
        </div>
        <div>
          <Input 
            id="twitter" 
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            placeholder="Twitter (opcional)"
            className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
          />
        </div>
        <div>
          <Input 
            id="facebook" 
            name="facebook"
            value={formData.facebook}
            onChange={handleInputChange}
            placeholder="Facebook (opcional)"
            className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
          />
        </div>
      </div>
    </div>
  );
};
