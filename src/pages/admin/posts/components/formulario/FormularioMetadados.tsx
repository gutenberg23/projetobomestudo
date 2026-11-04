import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardLateral, Contador } from "./CardLateral";

interface FormularioMetadadosProps {
  tags: string;
  onChangeTags: (value: string) => void;
  metaDescricao: string;
  onChangeMetaDescricao: (value: string) => void;
  metaKeywords: string;
  onChangeMetaKeywords: (value: string) => void;
  postsRelacionados: string;
  onChangePostsRelacionados: (value: string) => void;
  /** Para a prévia do Google */
  titulo?: string;
  resumo?: string;
  slug?: string;
}

const lista = (v: string) => v.split(",").map((t) => t.trim()).filter(Boolean);

export const FormularioMetadados: React.FC<FormularioMetadadosProps> = ({
  tags,
  onChangeTags,
  metaDescricao,
  onChangeMetaDescricao,
  metaKeywords,
  onChangeMetaKeywords,
  postsRelacionados,
  onChangePostsRelacionados,
  titulo = "",
  resumo = "",
  slug,
}) => {
  const descricao = metaDescricao || resumo;
  const tagsLista = lista(tags);
  return (
    <CardLateral titulo="SEO e tags" descricao="Como o post aparece no Google e nas buscas do site.">
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="truncate text-[11px] text-slate-500">bomestudo.com.br › blog › {slug || "novo-post"}</p>
        <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug text-[#1a0dab]">{titulo || "Título do post"}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{descricao || "A meta descrição (ou o resumo) aparece aqui."}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaDescricao" className="text-xs">Meta descrição</Label>
          <Contador atual={metaDescricao.length} ideal={160} />
        </div>
        <Textarea
          id="metaDescricao"
          rows={3}
          value={metaDescricao}
          onChange={(e) => onChangeMetaDescricao(e.target.value)}
          placeholder="Se ficar vazio, usamos o resumo"
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags" className="text-xs">Tags <span className="font-normal text-slate-400">(separadas por vírgula)</span></Label>
        <Input id="tags" value={tags} onChange={(e) => onChangeTags(e.target.value)} placeholder="FGV, prefeitura, nível médio" className="h-9" />
        {tagsLista.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagsLista.map((t) => (
              <span key={t} className="rounded-full bg-[#5f2ebe]/10 px-2 py-0.5 text-[11px] font-medium text-[#5f2ebe]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="metaKeywords" className="text-xs">Palavras-chave</Label>
        <Input id="metaKeywords" value={metaKeywords} onChange={(e) => onChangeMetaKeywords(e.target.value)} placeholder="concurso campinas, edital 2026" className="h-9" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="postsRelacionados" className="text-xs">IDs de posts relacionados</Label>
        <Input id="postsRelacionados" value={postsRelacionados} onChange={(e) => onChangePostsRelacionados(e.target.value)} placeholder="id1, id2" className="h-9 font-mono text-xs" />
      </div>
    </CardLateral>
  );
};
