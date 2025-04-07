"use client";

import React, { useEffect, useState, useRef } from "react";
import type { Section } from "../types";

interface VideoSectionProps {
  selectedSection: string;
  sections: Section[];
  videoHeight: number;
  forceUpdate?: number;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  selectedSection,
  sections,
  videoHeight,
  forceUpdate = 0
}) => {
  const currentSection = sections.find(s => s.id === selectedSection);
  const [responsiveHeight, setResponsiveHeight] = useState(videoHeight);
  
  // Criar uma referência para armazenar o valor de abrirEmNovaGuia
  const abrirEmNovaGuiaRef = useRef<boolean | undefined>(undefined);
  
  // Atualizar a referência quando o valor mudar
  useEffect(() => {
    if (currentSection && currentSection.abrirEmNovaGuia !== undefined) {
      abrirEmNovaGuiaRef.current = currentSection.abrirEmNovaGuia;
      console.log('Valor de abrirEmNovaGuia salvo na referência:', abrirEmNovaGuiaRef.current);
    }
  }, [currentSection, currentSection?.abrirEmNovaGuia, forceUpdate]);

  // Resetar a referência quando mudar para uma seção diferente
  useEffect(() => {
    // Quando a seção mudar, limpar a referência até recebermos o novo valor
    if (!currentSection) {
      abrirEmNovaGuiaRef.current = undefined;
      console.log('Valor de abrirEmNovaGuia na referência foi resetado devido à mudança de seção');
    }
  }, [selectedSection]);

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
    if (currentSection) {
      console.log('Seção mudou para:', currentSection.title);
      console.log('abrirEmNovaGuia na mudança de seção:', currentSection.abrirEmNovaGuia);
      console.log('forceUpdate valor:', forceUpdate);
    }
  }, [currentSection, forceUpdate]);

  const renderVideoContent = () => {
    if (!currentSection || !currentSection.videoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Selecione um tópico para assistir à videoaula
        </div>
      );
    }

    console.log('=== VIDEO SECTION RENDERING ===');
    console.log('Seção atual:', currentSection.title);
    console.log('ID da seção:', currentSection.id);
    console.log('URL do vídeo:', currentSection.videoUrl);
    console.log('abrirEmNovaGuia do objeto currentSection:', currentSection.abrirEmNovaGuia);
    console.log('abrirEmNovaGuia da referência (persistente):', abrirEmNovaGuiaRef.current);
    console.log('Tipo de abrirEmNovaGuia:', typeof currentSection.abrirEmNovaGuia);
    
    // Priorizar o valor da referência se ele existir (isso mantém o estado entre re-renderizações)
    // caso contrário, usar o valor do objeto currentSection
    const shouldUseNewTab = abrirEmNovaGuiaRef.current !== undefined 
      ? checkTrueValue(abrirEmNovaGuiaRef.current) 
      : checkTrueValue(currentSection.abrirEmNovaGuia);
    
    console.log('Resultado da validação final (usando referência persistente):', shouldUseNewTab);

    if (shouldUseNewTab) {
      console.log('Mostrando thumbnail devido ao checkbox "Abrir aula em nova guia"');
      return showThumbnail(currentSection.videoUrl);
    }

    console.log('Mostrando player de vídeo incorporado (padrão)');
    return showVideoPlayer(currentSection.videoUrl, currentSection.title);
  };

  const showThumbnail = (videoUrl: string) => {
    return (
      <>
        {/* Título do tópico acima da thumbnail */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 text-white rounded-t-xl">
          <h2 className="font-semibold text-lg md:text-xl line-clamp-2">
            {currentSection?.title || "Aula sem título"}
          </h2>
        </div>
        
        <div 
          className="w-full h-full absolute top-0 left-0 rounded-xl cursor-pointer"
          onClick={() => {
            window.open(videoUrl, '_blank');
            // Não fazer nada aqui que altere o estado, apenas abrir a URL
          }}
        >
          <img 
            src="/lovable-uploads/thumbnail.png" 
            alt="Thumbnail da aula"
            className="w-full h-full object-cover rounded-xl"
          />
          
          <div className="absolute inset-0 bg-black/40 rounded-xl">
          </div>
        </div>
      </>
    );
  };

  const showVideoPlayer = (videoUrl: string, title: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoUrl.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={title}
          className="w-full h-full absolute top-0 left-0 rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full absolute top-0 left-0 rounded-xl"
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }
  };

  const checkTrueValue = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return false;
  };

  // Função para alternar diretamente a propriedade abrirEmNovaGuia (apenas para testes)
  // Comentada por não estar sendo utilizada
  /*
  const toggleAbrirEmNovaGuia = async () => {
    if (!currentSection || !currentSection.id) return;
    
    try {
      console.log('Tentando alternar abrirEmNovaGuia para o tópico:', currentSection.id);
      console.log('Valor atual:', currentSection.abrirEmNovaGuia);
      
      // Alternar o valor atual
      const newValue = !checkTrueValue(currentSection.abrirEmNovaGuia);
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('topicos')
        .update({ abrir_em_nova_guia: newValue })
        .eq('id', currentSection.id);
        
      if (error) {
        console.error('Erro ao atualizar tópico:', error);
        return;
      }
      
      console.log('Valor de abrirEmNovaGuia alterado para:', newValue);
      
      // Atualizar localmente o tópico para efeito imediato
      // Isso é apenas para visualização, a próxima navegação buscará do banco
      if (currentSection) {
        currentSection.abrirEmNovaGuia = newValue;
        console.log('Atualização local feita. Recarregue a página para ver os efeitos.');
      }
      
    } catch (err) {
      console.error('Erro ao alternar abrirEmNovaGuia:', err);
    }
  };
  */

  return (
    <div className="video-container w-full">
      <div 
        className="aspect-video bg-slate-200 rounded-xl relative overflow-hidden" 
        style={{ height: responsiveHeight || 'auto' }}
      >
        {renderVideoContent()}
      </div>
    </div>
  );
};