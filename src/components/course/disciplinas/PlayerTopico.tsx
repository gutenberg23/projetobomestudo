import React, { useEffect, useState } from "react";
import { BookOpenText, ExternalLink, FileText, HelpCircle, Layers, ListChecks, Map, NotebookPen, PlayCircle, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/new/AudioPlayer";
import { MultiAudioPlayer } from "@/components/new/MultiAudioPlayer";
import { QuestionCard } from "@/components/new/QuestionCard";
import { useQuestions } from "@/hooks/useQuestions";
import { Carregando } from "../ui";
import type { TopicoCurso } from "./useDisciplinasCurso";

const ID_YOUTUBE = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

/** Vídeo do tópico em 16:9 (YouTube, arquivo de vídeo ou link para abrir em nova guia). */
export const VideoTopico: React.FC<{ topico: TopicoCurso | null; className?: string }> = ({ topico, className }) => {
  const url = topico?.videoUrl;
  const yt = url?.match(ID_YOUTUBE)?.[1];
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900", className)}>
      {!url ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center text-slate-300">
          <PlayCircle className="h-10 w-10 opacity-60" />
          <p className="text-sm">{topico ? "Este tópico não tem videoaula. Use os materiais abaixo." : "Escolha um tópico para começar."}</p>
        </div>
      ) : topico?.abrirEmNovaGuia ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2b1460] via-[#5f2ebe] to-[#ea2be2] p-6 text-center text-white"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-transform group-hover:scale-105">
            <ExternalLink className="h-7 w-7" />
          </span>
          <span className="max-w-md text-base font-semibold">{topico.nome}</span>
          <span className="text-xs text-white/80">A videoaula abre em uma nova guia</span>
        </a>
      ) : yt ? (
        <iframe
          key={yt}
          src={`https://www.youtube.com/embed/${yt}?rel=0`}
          title={topico?.nome}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video key={url} src={url} controls className="absolute inset-0 h-full w-full">
          Seu navegador não suporta vídeo.
        </video>
      )}
    </div>
  );
};

const Chip: React.FC<{ href?: string; onClick?: () => void; icone: React.ElementType; ativo?: boolean; children: React.ReactNode }> = ({
  href,
  onClick,
  icone: Icone,
  ativo,
  children,
}) => {
  const classe = cn(
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
    ativo
      ? "border-[#5f2ebe] bg-[#5f2ebe] text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:border-[#5f2ebe]/40 hover:bg-[#f8f5ff] hover:text-[#5f2ebe]"
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classe}>
        <Icone className="h-4 w-4" />
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={classe}>
      <Icone className="h-4 w-4" />
      {children}
    </button>
  );
};

export const temMateriais = (t: TopicoCurso) =>
  !!(t.temQuestoes || t.teoriaId || t.pdfUrl || t.mapaUrl || t.resumoUrl || t.cadernoQuestoesUrl || t.musicaUrl.length || t.resumoAudioUrl.length);

/** Botões de materiais do tópico; o de questões abre/fecha a lista. */
export const MateriaisTopico: React.FC<{
  topico: TopicoCurso;
  questoesAbertas: boolean;
  onQuestoes: () => void;
  /** Quantos flashcards o tópico tem neste curso */
  flashcards?: number;
  /** Leva para a aba Flashcards, nos cartões deste tópico */
  onFlashcards?: () => void;
  className?: string;
}> = ({ topico: t, questoesAbertas, onQuestoes, flashcards = 0, onFlashcards, className }) => {
  const temFlashcards = flashcards > 0 && !!onFlashcards;
  if (!temMateriais(t) && !temFlashcards) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {t.temQuestoes && (
        <Chip icone={ListChecks} onClick={onQuestoes} ativo={questoesAbertas}>
          {questoesAbertas ? "Fechar questões" : "Resolver questões"}
        </Chip>
      )}
      {t.teoriaId && (
        <Chip icone={BookOpenText} href={`/teoria/${t.teoriaId}`}>
          Aula em texto
        </Chip>
      )}
      {t.pdfUrl && (
        <Chip icone={FileText} href={t.pdfUrl}>
          PDF
        </Chip>
      )}
      {temFlashcards && (
        <Chip icone={Layers} onClick={onFlashcards}>
          Flashcards ({flashcards})
        </Chip>
      )}
      {t.mapaUrl && (
        <Chip icone={Map} href={t.mapaUrl}>
          Mapa mental
        </Chip>
      )}
      {t.resumoUrl && (
        <Chip icone={ScrollText} href={t.resumoUrl}>
          Resumo
        </Chip>
      )}
      {t.cadernoQuestoesUrl && (
        <Chip icone={NotebookPen} href={t.cadernoQuestoesUrl}>
          Caderno de questões
        </Chip>
      )}
      {t.musicaUrl.length === 1 && <AudioPlayer label="Música" audioUrl={t.musicaUrl[0]} />}
      {t.musicaUrl.length > 1 && <MultiAudioPlayer label="Música" audioUrls={t.musicaUrl} />}
      {t.resumoAudioUrl.length === 1 && <AudioPlayer label="Resumo em áudio" audioUrl={t.resumoAudioUrl[0]} />}
      {t.resumoAudioUrl.length > 1 && <MultiAudioPlayer label="Resumo em áudio" audioUrls={t.resumoAudioUrl} />}
    </div>
  );
};

/** Questões do tópico, carregadas só quando abertas. */
export const QuestoesTopico: React.FC<{ topicoId: string }> = ({ topicoId }) => {
  const { questions, isLoading, refetch } = useQuestions();
  const [riscadas, setRiscadas] = useState<string[]>([]);

  useEffect(() => {
    refetch(topicoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicoId]);

  if (isLoading) return <Carregando texto="Carregando questões..." />;
  if (questions.length === 0)
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <HelpCircle className="h-6 w-6 text-slate-300" />
        Este tópico ainda não tem questões cadastradas.
      </div>
    );
  return (
    <div>
      {questions.map((q, i) => (
        <QuestionCard
          key={`${q.id}-${i}`}
          question={q}
          disabledOptions={riscadas}
          onToggleDisabled={(id, e) => {
            e.stopPropagation();
            setRiscadas((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
          }}
        />
      ))}
    </div>
  );
};

/** Caixa de seleção redonda usada para marcar tópicos. */
export const MarcaConcluido: React.FC<{ marcado: boolean; onClick: (e: React.MouseEvent) => void; rotulo: string; tamanho?: "sm" | "md" }> = ({
  marcado,
  onClick,
  rotulo,
  tamanho = "md",
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={marcado}
    aria-label={rotulo}
    title={marcado ? "Desmarcar como concluído" : "Marcar como concluído"}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors",
      tamanho === "sm" ? "h-5 w-5" : "h-6 w-6",
      marcado ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent hover:border-[#5f2ebe]"
    )}
  >
    <svg viewBox="0 0 14 14" fill="none" className={tamanho === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}>
      <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

/** Anel de progresso pequeno. */
export const AnelProgresso: React.FC<{ valor: number; tamanho?: number; espessura?: number; className?: string; children?: React.ReactNode }> = ({
  valor,
  tamanho = 48,
  espessura = 5,
  className,
  children,
}) => {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" strokeWidth={espessura} className="stroke-slate-100" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className={cn("transition-all", v >= 100 ? "stroke-emerald-500" : "stroke-[#5f2ebe]")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-slate-700">
        {children ?? `${v}%`}
      </div>
    </div>
  );
};
