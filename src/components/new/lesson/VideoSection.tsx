"use client";

import React, { useEffect, useState } from "react";
import type { Section } from "../types";
import { Youtube, Instagram, Facebook, MessageCircle, Twitter, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface TeacherInfo {
  name: string;
  photoUrl: string;
  socialMedia: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

interface VideoSectionProps {
  sections?: Section[];
  selectedSection?: string;
  section?: Section;
  videoHeight: number;
  teacher?: TeacherInfo;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  sections,
  selectedSection,
  section: propSection,
  videoHeight,
  teacher = {
    name: "Professor(a)",
    photoUrl: "",
    socialMedia: {}
  }
}) => {
  const currentSection = propSection || (sections && selectedSection ? sections.find(s => s.id === selectedSection) : undefined);
  const [responsiveHeight, setResponsiveHeight] = useState(videoHeight);
  const [professorData, setProfessorData] = useState<TeacherInfo | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const parentElement = document.querySelector('.video-container');
      if (parentElement) {
        const width = parentElement.clientWidth;
        const calculatedHeight = width * 9 / 16;
        setResponsiveHeight(calculatedHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProfessorData = async () => {
      if (!currentSection || !currentSection.professorId) {
        setProfessorData(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('professores')
          .select('*')
          .eq('id', currentSection.professorId)
          .single();

        if (data && !error) {
          setProfessorData({
            name: data.nome_completo,
            photoUrl: data.foto_perfil || "/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg",
            socialMedia: {
              youtube: data.link_youtube,
              instagram: data.instagram,
              facebook: data.facebook,
              twitter: data.twitter,
              website: data.website
            }
          });
        } else {
          if (currentSection.professorNome) {
            const { data: nameData, error: nameError } = await supabase
              .from('professores')
              .select('*')
              .ilike('nome_completo', `%${currentSection.professorNome}%`)
              .single();

            if (nameData && !nameError) {
              setProfessorData({
                name: nameData.nome_completo,
                photoUrl: nameData.foto_perfil || "/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg",
                socialMedia: {
                  youtube: nameData.link_youtube,
                  instagram: nameData.instagram,
                  facebook: nameData.facebook,
                  twitter: nameData.twitter,
                  website: nameData.website
                }
              });
            } else {
              setProfessorData({
                name: currentSection.professorNome,
                photoUrl: "/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg",
                socialMedia: {}
              });
            }
          } else {
            setProfessorData(null);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do professor:", error);
        setProfessorData(null);
      }
    };

    fetchProfessorData();
  }, [currentSection]);

  const SocialMediaIcons = () => {
    const teacherData = professorData || teacher;
    
    return <div className="flex items-center gap-3">
        {teacherData.socialMedia.youtube && <a href={teacherData.socialMedia.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube">
            <Youtube className="w-5 h-5 text-white hover:text-[#5f2ebe] transition-colors" />
          </a>}
        {teacherData.socialMedia.instagram && <a href={teacherData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-5 h-5 text-white hover:text-[#5f2ebe] transition-colors" />
          </a>}
        {teacherData.socialMedia.telegram && <a href={teacherData.socialMedia.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <MessageCircle className="w-5 h-5 text-white hover:text-[#5f2ebe] transition-colors" />
          </a>}
        {teacherData.socialMedia.facebook && <a href={teacherData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="w-5 h-5 text-white hover:text-[#5f2ebe] transition-colors" />
          </a>}
        {teacherData.socialMedia.twitter && <a href={teacherData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter className="w-5 h-5 text-white hover:text-[#5f2ebe] transition-colors" />
          </a>}
        {teacherData.socialMedia.website && <a href={teacherData.socialMedia.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
            <Globe className="w-5 h-5 text-white hover:text-[#ea2be2] transition-colors" />
          </a>}
      </div>;
  };

  const renderVideoContent = () => {
    if (!currentSection || !currentSection.videoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Selecione um tópico para assistir à videoaula
        </div>
      );
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = currentSection.videoUrl.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={currentSection.title}
          className="w-full h-full absolute top-0 left-0 rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video 
          src={currentSection.videoUrl} 
          controls 
          className="w-full h-full absolute top-0 left-0 rounded-xl"
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }
  };

  const teacherData = professorData || teacher;

  const [showTeacherInfo, setShowTeacherInfo] = useState(false);

  return <div className="video-container w-full">
      <div 
        className="aspect-video bg-slate-200 rounded-xl relative overflow-hidden" 
        style={{ height: responsiveHeight || 'auto' }}
        onMouseEnter={() => setShowTeacherInfo(true)}
        onMouseLeave={() => setShowTeacherInfo(false)}
      >
        {renderVideoContent()}
        
        <div 
          className={`absolute bottom-0 left-0 right-0 p-3 z-10 bg-gradient-to-t from-black/70 to-transparent flex flex-col sm:flex-row sm:justify-between sm:items-center w-full rounded-b-xl transition-opacity duration-300 ${showTeacherInfo ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center flex-col sm:flex-row">
            <div className="flex flex-col items-center sm:items-start sm:flex-row">
              <Avatar className="h-12 w-12 mb-2 sm:mb-0 sm:mr-3 border-2 border-white/30">
                <AvatarImage src={teacherData.photoUrl} alt={teacherData.name} />
                <AvatarFallback className="bg-[#f6f8fa] text-[#272f3c]">
                  {teacherData.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-white">{teacherData.name}</h3>
                <p className="text-sm text-white/80 font-extralight">Professor</p>
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-0 flex justify-center sm:justify-start">
            <SocialMediaIcons />
          </div>
        </div>
      </div>
    </div>;
};
