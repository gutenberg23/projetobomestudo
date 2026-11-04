import React, { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, FileQuestion, FileText, Loader2, Map as MapIcon, Plus, Settings2, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { youtubeId, youtubeThumb } from "@/utils/youtube";
import { CardLateral } from "../posts/components/formulario/CardLateral";
import { cn } from "@/lib/utils";

export interface FiltrosQuestoes {
  disciplinas?: string[];
  assuntos?: string[];
  bancas?: string[];
  topicos?: string[];
}

const mover = <T,>(lista: T[], de: number, para: number): T[] => {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
};

/** Botões de subir/descer/remover de um item de lista. */
const AcoesItem: React.FC<{
  i: number;
  total: number;
  onMover: (de: number, para: number) => void;
  onRemover: () => void;
}> = ({ i, total, onMover, onRemover }) => (
  <div className="flex shrink-0 items-center opacity-60 transition-opacity group-hover:opacity-100">
    <button
      type="button"
      disabled={i === 0}
      onClick={() => onMover(i, i - 1)}
      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
      aria-label="Subir"
    >
      <ArrowUp className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      disabled={i === total - 1}
      onClick={() => onMover(i, i + 1)}
      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
      aria-label="Descer"
    >
      <ArrowDown className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onClick={onRemover}
      className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
      aria-label="Remover"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </div>
);

const Contagem: React.FC<{ n: number }> = ({ n }) =>
  n > 0 ? (
    <span className="rounded-full bg-[#5f2ebe]/10 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[#5f2ebe]">{n}</span>
  ) : null;

export const CardQuestoes: React.FC<{
  filtros: FiltrosQuestoes;
  link: string;
  onConfigurar: () => void;
  onLimpar: () => void;
}> = ({ filtros, link, onConfigurar, onLimpar }) => {
  const grupos = [
    { rotulo: "Disciplinas", itens: filtros.disciplinas || [] },
    { rotulo: "Assuntos", itens: filtros.assuntos || [] },
    { rotulo: "Tópicos", itens: filtros.topicos || [] },
    { rotulo: "Bancas", itens: filtros.bancas || [] },
  ].filter((g) => g.itens.length > 0);

  return (
    <CardLateral
      titulo="Questões"
      descricao="Aparecem na aba Questões da teoria."
      icone={<FileQuestion className="h-4 w-4 text-slate-400" />}
      acao={
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onConfigurar}>
          <Settings2 className="mr-1 h-3.5 w-3.5" />
          {grupos.length ? "Alterar" : "Configurar"}
        </Button>
      }
    >
      {grupos.length === 0 ? (
        <p className="text-xs text-slate-500">Nenhum filtro. Sem ele, a aba Questões não aparece para o aluno.</p>
      ) : (
        <>
          <dl className="space-y-2 text-xs">
            {grupos.map((g) => (
              <div key={g.rotulo}>
                <dt className="mb-1 text-slate-400">{g.rotulo}</dt>
                <dd className="flex flex-wrap gap-1">
                  {g.itens.slice(0, 6).map((it) => (
                    <span key={it} className="max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      {it}
                    </span>
                  ))}
                  {g.itens.length > 6 && <span className="px-1 py-0.5 text-slate-400">+{g.itens.length - 6}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#5f2ebe] hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />
                Ver questões
              </a>
            ) : (
              <span />
            )}
            <button type="button" onClick={onLimpar} className="text-slate-400 hover:text-red-600">
              Remover filtro
            </button>
          </div>
        </>
      )}
    </CardLateral>
  );
};

export const CardVideoaulas: React.FC<{ videos: string[]; onChange: (v: string[]) => void }> = ({ videos, onChange }) => {
  const [novo, setNovo] = useState("");
  const valido = !!youtubeId(novo);

  const adicionar = () => {
    const link = novo.trim();
    if (!link) return;
    if (!youtubeId(link)) {
      toast.error("Não reconheci esse link. Cole um link do YouTube (youtube.com ou youtu.be).");
      return;
    }
    if (videos.some((v) => youtubeId(v) === youtubeId(link))) {
      toast.info("Esse vídeo já está na lista.");
      setNovo("");
      return;
    }
    onChange([...videos, link]);
    setNovo("");
  };

  return (
    <CardLateral
      titulo="Videoaulas"
      icone={<Video className="h-4 w-4 text-slate-400" />}
      acao={<Contagem n={videos.length} />}
    >
      <div className="flex gap-2">
        <Input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Link do YouTube"
          className={cn("h-9", novo && !valido && "border-amber-300")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" className="h-9 shrink-0" onClick={adicionar} disabled={!novo.trim()}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Adicionar vídeo</span>
        </Button>
      </div>
      {videos.length > 0 && (
        <ul className="space-y-2">
          {videos.map((url, i) => {
            const thumb = youtubeThumb(url);
            return (
              <li key={`${url}-${i}`} className="group flex items-center gap-2 rounded-lg border border-slate-100 p-1.5">
                <a href={url} target="_blank" rel="noopener noreferrer" className="relative block h-11 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                  {thumb ? (
                    <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Video className="m-auto h-4 w-4 text-slate-300" />
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700">Videoaula {i + 1}</p>
                  <p className="truncate text-[11px] text-slate-400" title={url}>
                    {url.replace(/^https?:\/\/(www\.)?/, "")}
                  </p>
                </div>
                <AcoesItem
                  i={i}
                  total={videos.length}
                  onMover={(de, para) => onChange(mover(videos, de, para))}
                  onRemover={() => onChange(videos.filter((_, j) => j !== i))}
                />
              </li>
            );
          })}
        </ul>
      )}
    </CardLateral>
  );
};

export const CardMapasMentais: React.FC<{ mapas: string[]; onChange: (v: string[]) => void }> = ({ mapas, onChange }) => {
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const enviar = async (arquivos: FileList | File[]) => {
    const lista = Array.from(arquivos);
    if (!lista.length) return;
    setEnviando(true);
    const urls: string[] = [];
    for (const arquivo of lista) {
      if (arquivo.type !== "application/pdf") {
        toast.error(`${arquivo.name} não é um PDF.`);
        continue;
      }
      const caminho = `mindmaps/${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.pdf`;
      const { error } = await supabase.storage.from("blog-images").upload(caminho, arquivo);
      if (error) {
        console.error("Erro ao enviar PDF:", error);
        toast.error(`Não foi possível enviar ${arquivo.name}.`);
        continue;
      }
      urls.push(supabase.storage.from("blog-images").getPublicUrl(caminho).data.publicUrl);
    }
    if (urls.length) {
      onChange([...mapas, ...urls]);
      toast.success(urls.length === 1 ? "Mapa mental enviado" : `${urls.length} mapas mentais enviados`);
    }
    setEnviando(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <CardLateral
      titulo="Mapas mentais"
      descricao="PDFs que o aluno abre ou baixa."
      icone={<MapIcon className="h-4 w-4 text-slate-400" />}
      acao={<Contagem n={mapas.length} />}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          enviar(e.dataTransfer.files);
        }}
        disabled={enviando}
        className={cn(
          "flex w-full flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-4 text-center text-xs transition-colors",
          arrastando ? "border-[#5f2ebe] bg-[#5f2ebe]/5 text-[#5f2ebe]" : "border-slate-300 text-slate-500 hover:border-[#5f2ebe]/50 hover:bg-slate-50"
        )}
      >
        {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        <span className="font-medium">{enviando ? "Enviando..." : "Enviar PDF"}</span>
        {!enviando && <span className="text-slate-400">Clique ou arraste os arquivos aqui</span>}
      </button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => e.target.files && enviar(e.target.files)} />
      {mapas.length > 0 && (
        <ul className="space-y-1.5">
          {mapas.map((url, i) => (
            <li key={`${url}-${i}`} className="group flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5">
              <FileText className="h-4 w-4 shrink-0 text-red-500" />
              <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 hover:text-[#5f2ebe]">
                Mapa mental {i + 1}
              </a>
              <AcoesItem
                i={i}
                total={mapas.length}
                onMover={(de, para) => onChange(mover(mapas, de, para))}
                onRemover={() => onChange(mapas.filter((_, j) => j !== i))}
              />
            </li>
          ))}
        </ul>
      )}
    </CardLateral>
  );
};
