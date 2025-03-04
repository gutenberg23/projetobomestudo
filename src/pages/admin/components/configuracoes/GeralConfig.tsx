
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const GeralConfig = () => {
  const [siteName, setSiteName] = useState("BomEstudo");
  const [siteSlogan, setSiteSlogan] = useState("A plataforma completa para concurseiros");
  const [heroTitle, setHeroTitle] = useState("Sua aprovação começa aqui");
  const [heroSubtitle, setHeroSubtitle] = useState("Estude com os melhores professores e material atualizado para concursos públicos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui implementaria a lógica para salvar as configurações
    toast.success("Configurações gerais atualizadas com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Configurações Gerais</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Configure informações básicas do seu site
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-[#272f3c]">Informações do Site</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome do Site */}
          <div className="space-y-2">
            <Label htmlFor="site-name">Nome da Plataforma</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Ex: BomEstudo"
            />
            <p className="text-xs text-[#67748a]">
              Nome principal da sua plataforma
            </p>
          </div>

          {/* Slogan do Site */}
          <div className="space-y-2">
            <Label htmlFor="site-slogan">Slogan</Label>
            <Input
              id="site-slogan"
              value={siteSlogan}
              onChange={(e) => setSiteSlogan(e.target.value)}
              placeholder="Ex: A plataforma completa para concurseiros"
            />
            <p className="text-xs text-[#67748a]">
              Frase curta que acompanha o nome do site
            </p>
          </div>
        </div>

        <h3 className="text-md font-medium text-[#272f3c] mt-6">Seção Hero (Página Inicial)</h3>
        
        <div className="space-y-4">
          {/* Título Hero */}
          <div className="space-y-2">
            <Label htmlFor="hero-title">Título Principal</Label>
            <Input
              id="hero-title"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Ex: Sua aprovação começa aqui"
            />
            <p className="text-xs text-[#67748a]">
              Título principal exibido na seção de destaque da página inicial
            </p>
          </div>

          {/* Subtítulo Hero */}
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Subtítulo</Label>
            <Textarea
              id="hero-subtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Ex: Estude com os melhores professores e material atualizado para concursos públicos"
              rows={3}
            />
            <p className="text-xs text-[#67748a]">
              Texto descritivo que aparece abaixo do título principal na página inicial
            </p>
          </div>
        </div>

        {/* Visualização */}
        <div className="mt-8 p-6 border rounded-md bg-gray-50">
          <h3 className="text-md font-medium text-[#272f3c] mb-4">Visualização</h3>
          
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="max-w-md mx-auto text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#272f3c]">{heroTitle}</h1>
              <p className="text-[#67748a]">{heroSubtitle}</p>
              <div className="pt-4">
                <Button className="bg-[#ea2be2]">Comece Agora</Button>
              </div>
            </div>
            <div className="text-center mt-8 text-sm text-[#67748a]">
              <p>{siteName} - {siteSlogan}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </form>
  );
};

export default GeralConfig;
