"use client";

import React, { useEffect, useState } from "react";
import type { Section } from "../types";
import { Youtube, Instagram, Facebook, MessageCircle, Twitter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface TeacherInfo {
  name: string;
  photoUrl: string;
  socialMedia: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
    facebook?: string;
    twitter?: string;
  };
}
interface VideoSectionProps {
  selectedSection: string;
  sections: Section[];
  videoHeight: number;
  teacher?: TeacherInfo;
}
export const VideoSection: React.FC<VideoSectionProps> = ({
  selectedSection,
  sections,
  videoHeight,
  teacher = {
    name: "Professor(a)",
    photoUrl: "",
    socialMedia: {}
  }
}) => {
  const currentSection = sections.find(s => s.id === selectedSection);
  const [responsiveHeight, setResponsiveHeight] = useState(videoHeight);
  useEffect(() => {
    const handleResize = () => {
      // Ajusta a altura do vídeo de acordo com a largura da tela
      const parentElement = document.querySelector('.video-container');
      if (parentElement) {
        const width = parentElement.clientWidth;
        // Calculando a altura baseada em uma proporção de aspecto 16:9
        const calculatedHeight = width * 9 / 16;
        setResponsiveHeight(calculatedHeight);
      }
    };

    // Chama handleResize quando o componente monta
    handleResize();

    // Adiciona event listener para resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Componente para renderizar os ícones de redes sociais
  const SocialMediaIcons = () => {
    return <div className="flex items-center gap-3">
        {teacher.socialMedia.youtube && <a href={teacher.socialMedia.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube">
            <Youtube className="w-5 h-5 text-[#ea2be2] hover:text-[#f11ce3]" />
          </a>}
        {teacher.socialMedia.instagram && <a href={teacher.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-5 h-5 text-[#ea2be2] hover:text-[#f11ce3]" />
          </a>}
        {teacher.socialMedia.telegram && <a href={teacher.socialMedia.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <MessageCircle className="w-5 h-5 text-[#ea2be2] hover:text-[#f11ce3]" />
          </a>}
        {teacher.socialMedia.facebook && <a href={teacher.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="w-5 h-5 text-[#ea2be2] hover:text-[#f11ce3]" />
          </a>}
        {teacher.socialMedia.twitter && <a href={teacher.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter className="w-5 h-5 text-[#ea2be2] hover:text-[#f11ce3]" />
          </a>}
      </div>;
  };
  return <div className="video-container w-full">
      {/* Informações do professor */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3 border-3 border-slate-50">
            <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
            <AvatarFallback className="bg-[#f6f8fa] text-[#272f3c]">
              {teacher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-[#272f3c]">{teacher.name}</h3>
            <p className="text-sm text-[#67748a]">Professor</p>
          </div>
        </div>
        
        {/* Ícones de redes sociais */}
        <SocialMediaIcons />
      </div>
      
      <div className="aspect-video bg-slate-200 rounded-xl" style={{
      height: responsiveHeight || 'auto'
    }}>
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Vídeo da aula: {currentSection?.title}
        </div>
      </div>
    </div>;
};