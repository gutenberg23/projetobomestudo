import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { MultiFileUploadField } from "@/components/ui/multi-file-upload-field";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopicoFormValues } from "./TopicosTypes";
import { QuestionsManager } from "./modals/components/QuestionsManager";
import { AulaEmTextoField } from "./AulaEmTextoField";
import { FlashcardsTopicoField } from "./FlashcardsTopicoField";

export interface ProfessorOpcao {
  id: string;
  nomeCompleto: string;
  disciplina: string;
}

let cacheProfessores: ProfessorOpcao[] | null = null;

/** Lista real de professores (antes a edição usava uma lista fictícia). */
export const useProfessores = () => {
  const [professores, setProfessores] = useState<ProfessorOpcao[]>(cacheProfessores || []);
  const [carregando, setCarregando] = useState(!cacheProfessores);

  useEffect(() => {
    if (cacheProfessores) return;
    let ativo = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("professores")
          .select("id, nome_completo, disciplina")
          .order("nome_completo");
        if (error) throw error;
        cacheProfessores = (data || []).map((p) => ({
          id: p.id,
          nomeCompleto: p.nome_completo,
          disciplina: p.disciplina,
        }));
        if (ativo) setProfessores(cacheProfessores);
      } catch (e) {
        console.error("Erro ao buscar professores:", e);
        toast.error("Erro ao carregar professores.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return { professores, carregando };
};

/** Converte links do YouTube (watch, youtu.be, shorts) para o formato de incorporação. */
export const converterLinkYoutube = (url: string): string => {
  const padroes = [
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ];
  for (const padrao of padroes) {
    const m = url.match(padrao);
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return url;
};

const comoLista = (v: string | string[] | undefined | null): string[] =>
  Array.isArray(v) ? v : v ? v.split(",").filter(Boolean) : [];

const Secao: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/40 p-3 sm:p-4">
    <legend className="rounded bg-white px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</legend>
    {children}
  </fieldset>
);

interface TopicoFormFieldsProps {
  idPrefix: string;
  value: TopicoFormValues;
  onChange: (value: TopicoFormValues) => void;
  /** Disciplinas já usadas em outros tópicos, para autocompletar */
  disciplinasSugeridas?: string[];
}

/** Campos do tópico, compartilhados entre "Criar tópico" e "Editar tópico". */
export const TopicoFormFields: React.FC<TopicoFormFieldsProps> = ({
  idPrefix,
  value,
  onChange,
  disciplinasSugeridas = [],
}) => {
  const { professores, carregando } = useProfessores();
  const [novaQuestao, setNovaQuestao] = useState("");
  const set = <K extends keyof TopicoFormValues>(campo: K, v: TopicoFormValues[K]) =>
    onChange({ ...value, [campo]: v });

  const adicionarQuestoes = () => {
    // Aceita vários IDs de uma vez, separados por vírgula, espaço ou quebra de linha
    const ids = novaQuestao
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      toast.error("Digite um ID de questão válido");
      return;
    }
    const novos = ids.filter((id) => !value.questoesIds.includes(id));
    if (novos.length === 0) {
      toast.error("Essas questões já foram adicionadas");
      return;
    }
    set("questoesIds", [...value.questoesIds, ...Array.from(new Set(novos))]);
    setNovaQuestao("");
  };

  const removerQuestao = (indice: number) => {
    const lista = [...value.questoesIds];
    lista.splice(indice, 1);
    set("questoesIds", lista);
  };

  const listaDisciplinas = `${idPrefix}-disciplinas`;

  return (
    <div className="space-y-4">
      <Secao titulo="Informações básicas">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-titulo`}>Título *</Label>
          <Input
            id={`${idPrefix}-titulo`}
            value={value.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ex.: Princípios da Administração Pública"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-disciplina`}>Disciplina *</Label>
            <Input
              id={`${idPrefix}-disciplina`}
              list={listaDisciplinas}
              value={value.disciplina}
              onChange={(e) => set("disciplina", e.target.value)}
              placeholder="Comece a digitar para ver as existentes"
            />
            <datalist id={listaDisciplinas}>
              {disciplinasSugeridas.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-professor`}>Professor</Label>
            {carregando ? (
              <div className="text-sm text-[#67748a] p-2 border rounded">Carregando professores...</div>
            ) : (
              <Select
                value={value.professor_id || "__nenhum"}
                onValueChange={(v) => {
                  const prof = professores.find((p) => p.id === v);
                  onChange({
                    ...value,
                    professor_id: v === "__nenhum" ? "" : v,
                    professor_nome: prof ? prof.nomeCompleto : "",
                  });
                }}
              >
                <SelectTrigger id={`${idPrefix}-professor`}>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__nenhum">Sem professor</SelectItem>
                  {professores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nomeCompleto} - {p.disciplina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-patrocinador`}>Patrocinador</Label>
          <Input
            id={`${idPrefix}-patrocinador`}
            value={value.patrocinador}
            onChange={(e) => set("patrocinador", e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </Secao>

      <Secao titulo="Aula">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-video`}>Link da videoaula</Label>
          <Input
            id={`${idPrefix}-video`}
            value={value.videoUrl}
            onChange={(e) => set("videoUrl", converterLinkYoutube(e.target.value))}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-[#67748a]">Links do YouTube são convertidos automaticamente para o formato de incorporação.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${idPrefix}-nova-guia`}
            checked={value.abrirEmNovaGuia || false}
            onCheckedChange={(checked) => set("abrirEmNovaGuia", checked === true)}
          />
          <Label htmlFor={`${idPrefix}-nova-guia`} className="cursor-pointer text-sm text-[#272f3c]">
            Abrir aula em nova guia
          </Label>
        </div>
        <AulaEmTextoField
          id={`${idPrefix}-teoria`}
          teoriaId={value.teoriaId}
          onTeoriaChange={(id) => set("teoriaId", id)}
          pdfUrl={value.pdfUrl}
          onPdfChange={(url) => set("pdfUrl", url)}
          disciplina={value.disciplina}
        />
      </Secao>

      <Secao titulo="Materiais de apoio">
        <FileUploadField
          id={`${idPrefix}-mapa`}
          label="Link do mapa mental"
          value={value.mapaUrl}
          onChange={(v) => set("mapaUrl", v)}
          placeholder="URL do mapa mental ou faça upload"
          allowedTypes={["pdf", "jpg", "jpeg", "png", "gif"]}
          rootFolder="mapa-mental"
        />
        <FileUploadField
          id={`${idPrefix}-resumo`}
          label="Link do resumo"
          value={value.resumoUrl}
          onChange={(v) => set("resumoUrl", v)}
          placeholder="URL do resumo ou faça upload"
          allowedTypes={["pdf", "doc", "docx"]}
          rootFolder="resumo"
        />
        <MultiFileUploadField
          id={`${idPrefix}-musica`}
          label="Link da música"
          values={comoLista(value.musicaUrl)}
          onChange={(v) => set("musicaUrl", v)}
          placeholder="URLs das músicas ou faça upload"
          allowedTypes={["mp3", "wav", "ogg", "m4a", "aac"]}
          rootFolder="musica"
        />
        <MultiFileUploadField
          id={`${idPrefix}-resumo-audio`}
          label="Link do resumo em áudio"
          values={comoLista(value.resumoAudioUrl)}
          onChange={(v) => set("resumoAudioUrl", v)}
          placeholder="URLs dos resumos em áudio ou faça upload"
          allowedTypes={["mp3", "wav", "ogg", "m4a", "aac"]}
          rootFolder="resumo-audio"
        />
      </Secao>

      <Secao titulo="Questões">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-caderno`}>Link do caderno de questões</Label>
          <Input
            id={`${idPrefix}-caderno`}
            value={value.cadernoQuestoesUrl || ""}
            onChange={(e) => set("cadernoQuestoesUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <QuestionsManager
          questoesIds={value.questoesIds}
          newQuestaoId={novaQuestao}
          setNewQuestaoId={setNovaQuestao}
          addQuestaoId={adicionarQuestoes}
          removeQuestaoId={removerQuestao}
          label="Questões (cole vários IDs separados por vírgula ou espaço)"
        />
      </Secao>

      <Secao titulo="Flashcards">
        <FlashcardsTopicoField idPrefix={idPrefix} value={value.flashcards} onChange={(v) => set("flashcards", v)} />
      </Secao>
    </div>
  );
};
