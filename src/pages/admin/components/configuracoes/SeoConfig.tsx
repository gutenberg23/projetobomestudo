
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SeoConfig = () => {
  const [metaTitle, setMetaTitle] = useState("BomEstudo – A Plataforma Completa para Concurseiros");
  const [metaDescription, setMetaDescription] = useState("Preparação completa para concursos com questões comentadas, videoaulas, material atualizado e estatísticas de desempenho.");
  const [keywords, setKeywords] = useState("questões de concurso, simulados online, plataforma de estudos");
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [generateSitemap, setGenerateSitemap] = useState(true);
  const [siteUrl, setSiteUrl] = useState("https://bomestudo.com.br");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui implementaria a lógica para salvar as configurações
    toast.success("Configurações de SEO atualizadas com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-[#272f3c] mb-4">SEO Global</h2>
        <p className="text-sm text-[#67748a] mb-6">
          Configure as informações para otimização em motores de busca
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-[#272f3c]">Meta Informações</h3>
        
        {/* Meta Title */}
        <div className="space-y-2">
          <Label htmlFor="meta-title">Título do Site (Meta Title)</Label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Ex: BomEstudo – A Plataforma Completa para Concurseiros"
          />
          <div className="flex justify-between">
            <p className="text-xs text-[#67748a]">
              Título que aparece na aba do navegador e nos resultados de busca
            </p>
            <p className="text-xs text-[#67748a]">
              {metaTitle.length}/60 caracteres
            </p>
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Descrição (Meta Description)</Label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Um resumo chamativo do site (até 160 caracteres)"
            rows={3}
          />
          <div className="flex justify-between">
            <p className="text-xs text-[#67748a]">
              Descrição que aparece nos resultados de busca
            </p>
            <p className="text-xs text-[#67748a]">
              {metaDescription.length}/160 caracteres
            </p>
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords">Palavras-chave principais</Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ex: questões de concurso, simulados online, plataforma de estudos"
            rows={2}
          />
          <p className="text-xs text-[#67748a]">
            Separe as palavras-chave por vírgulas
          </p>
        </div>

        <Separator className="my-6" />

        <h3 className="text-md font-medium text-[#272f3c]">Indexação e Mapeamento</h3>
        
        {/* URL do site */}
        <div className="space-y-2">
          <Label htmlFor="site-url">URL do Site</Label>
          <Input
            id="site-url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="Ex: https://bomestudo.com.br"
          />
          <p className="text-xs text-[#67748a]">
            URL base do seu site (importante para o sitemap)
          </p>
        </div>

        {/* Indexação */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow-indexing">Permitir Indexação</Label>
            <p className="text-xs text-[#67748a]">
              Permitir que mecanismos de busca indexem o site
            </p>
          </div>
          <Switch
            id="allow-indexing"
            checked={allowIndexing}
            onCheckedChange={setAllowIndexing}
          />
        </div>

        {/* Sitemap */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="generate-sitemap">Gerar Sitemap</Label>
            <p className="text-xs text-[#67748a]">
              Gerar automaticamente o arquivo sitemap.xml
            </p>
          </div>
          <Switch
            id="generate-sitemap"
            checked={generateSitemap}
            onCheckedChange={setGenerateSitemap}
          />
        </div>

        {/* Robots.txt Preview */}
        {allowIndexing ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border font-mono text-sm">
            <p>User-agent: *</p>
            <p>Allow: /</p>
            <p>Sitemap: {siteUrl}/sitemap.xml</p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border font-mono text-sm">
            <p>User-agent: *</p>
            <p>Disallow: /</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </form>
  );
};

export default SeoConfig;
