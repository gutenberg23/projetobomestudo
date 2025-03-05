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
            <Youtube className="w-5 h-5 text-[#66748a] hover:text-[#ea2be2] transition-colors" />
          </a>}
        {teacher.socialMedia.instagram && <a href={teacher.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-5 h-5 text-[#66748a] hover:text-[#ea2be2] transition-colors" />
          </a>}
        {teacher.socialMedia.telegram && <a href={teacher.socialMedia.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <MessageCircle className="w-5 h-5 text-[#ffffff] hover:text-[#ea2be2] transition-colors" />
          </a>}
        {teacher.socialMedia.facebook && <a href={teacher.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="w-5 h-5 text-[#66748a] hover:text-[#ea2be2] transition-colors" />
          </a>}
        {teacher.socialMedia.twitter && <a href={teacher.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter className="w-5 h-5 text-[#66748a] hover:text-[#ea2be2] transition-colors" />
          </a>}
      </div>;
  };
  return <div className="video-container w-full">
      <div style={{
      height: responsiveHeight || 'auto'
    }} className="aspect-video bg-white rounded-xl relative">
        {/* Informações do professor sobrepondo o vídeo */}
        <div className="absolute top-0 left-0 right-0 p-3 z-10 bg-gradient-to-b from-black/50 to-transparent flex flex-col sm:flex-row sm:justify-between sm:items-center w-full rounded-t-xl">
          <div className="flex items-center flex-col sm:flex-row">
            <div className="flex flex-col items-center sm:items-start sm:flex-row">
              <Avatar className="h-12 w-12 mb-2 sm:mb-0 sm:mr-3 border-2 border-white/30">
                <AvatarImage src={teacher.photoUrl} alt={teacher.name} />
                <AvatarFallback className="bg-[#f6f8fa] text-[#272f3c]">
                  {teacher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-white">{teacher.name}</h3>
                <p className="text-sm text-white/80">Professor</p>
              </div>
            </div>
          </div>
          
          {/* Ícones de redes sociais - no mobile aparecem centralizados */}
          <div className="mt-3 sm:mt-0 flex justify-center sm:justify-start">
            <SocialMediaIcons />
          </div>
        </div>
        
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Vídeo da aula: {currentSection?.title}
        </div>
      </div>
    </div>;
};