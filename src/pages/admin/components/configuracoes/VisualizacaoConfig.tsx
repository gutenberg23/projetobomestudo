
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const VisualizacaoConfig = () => {
  const [primaryColor, setPrimaryColor] = useState("#ea2be2");
  const [secondaryColor, setSecondaryColor] = useState("#f6f8fa");
  const [textTitleColor, setTextTitleColor] = useState("#272f3c");
  const [textParagraphColor, setTextParagraphColor] = useState("#67748a");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaviconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui implementaria a lógica para salvar as configurações
    toast.success("Configurações visuais atualizadas com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">Personalização Visual</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Ajuste a aparência do seu site alterando cores, logotipo e favicon
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-[#272f3c]">Logotipo e Favicon</h3>
        
        {/* Logo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Logotipo</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md h-36 p-4 bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Preview do logo" 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload className="h-8 w-8 mb-2" />
                    <span>Carregar logotipo</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="max-w-sm"
                />
                {logoPreview && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLogoPreview(null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <Label htmlFor="favicon-upload">Favicon</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md h-36 p-4 bg-gray-50">
                {faviconPreview ? (
                  <img 
                    src={faviconPreview} 
                    alt="Preview do favicon" 
                    className="max-h-16 max-w-16 object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload className="h-8 w-8 mb-2" />
                    <span>Carregar favicon</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="max-w-sm"
                />
                {faviconPreview && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setFaviconPreview(null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="text-md font-medium text-[#272f3c] mb-4">Esquema de Cores</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cor Primária */}
          <div className="space-y-2">
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-[#67748a]">
              Usada em botões, links e elementos de destaque
            </p>
          </div>

          {/* Cor Secundária */}
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: secondaryColor }}
              />
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-[#67748a]">
              Usada em fundos, cards e elementos secundários
            </p>
          </div>

          {/* Cor de Título */}
          <div className="space-y-2">
            <Label htmlFor="title-color">Cor dos Títulos</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: textTitleColor }}
              />
              <Input
                id="title-color"
                type="color"
                value={textTitleColor}
                onChange={(e) => setTextTitleColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
              <Input
                type="text"
                value={textTitleColor}
                onChange={(e) => setTextTitleColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-[#67748a]">
              Usada em títulos e cabeçalhos
            </p>
          </div>

          {/* Cor de Parágrafo */}
          <div className="space-y-2">
            <Label htmlFor="paragraph-color">Cor dos Parágrafos</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: textParagraphColor }}
              />
              <Input
                id="paragraph-color"
                type="color"
                value={textParagraphColor}
                onChange={(e) => setTextParagraphColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
              <Input
                type="text"
                value={textParagraphColor}
                onChange={(e) => setTextParagraphColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-[#67748a]">
              Usada em textos e parágrafos do site
            </p>
          </div>
        </div>

        {/* Visualização */}
        <div className="mt-8 p-6 border rounded-md">
          <h3 className="text-md font-medium text-[#272f3c] mb-4">Visualização</h3>
          
          <div className="space-y-6 p-4 rounded-md" style={{ backgroundColor: secondaryColor }}>
            <h4 className="text-xl font-bold" style={{ color: textTitleColor }}>
              Exemplo de Título
            </h4>
            <p style={{ color: textParagraphColor }}>
              Este é um exemplo de como os textos ficarão com as cores selecionadas.
              Você pode ver como a combinação de cores afeta a legibilidade do conteúdo.
            </p>
            <div className="flex gap-3">
              <Button style={{ backgroundColor: primaryColor, color: 'white' }}>
                Botão Primário
              </Button>
              <Button variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                Botão Secundário
              </Button>
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

export default VisualizacaoConfig;
