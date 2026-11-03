import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ItemPicker } from "./ItemPicker";
import {
  Submissao,
  SubmissaoInput,
  TipoSubmissao,
  TIPO_DESTINO,
  TIPO_FILHO,
  TIPO_LABEL,
  linkValido,
} from "@/services/contribuicoes";

interface SubmissaoFormProps {
  inicial?: Partial<Submissao>;
  /** Permite trocar o tipo (somente em novos envios) */
  tipoEditavel?: boolean;
  /** Envios do mesmo autor, para compor aulas/disciplinas/cursos */
  minhasSubmissoes?: Submissao[];
  enviando?: boolean;
  textoBotao?: string;
  onSubmit: (input: SubmissaoInput) => void;
  onCancel?: () => void;
}

const CAMPOS_LINK: { chave: keyof SubmissaoInput["dados"]; label: string; multiplo?: boolean }[] = [
  { chave: "video_url", label: "Link do vídeo (YouTube, Vimeo...)" },
  { chave: "pdf_url", label: "Link do PDF" },
  { chave: "mapa_url", label: "Link do mapa mental" },
  { chave: "resumo_url", label: "Link do resumo" },
  { chave: "caderno_questoes_url", label: "Link do caderno de questões" },
  { chave: "musica_url", label: "Links de músicas (separe por vírgula)", multiplo: true },
  { chave: "resumo_audio_url", label: "Links de resumos em áudio (separe por vírgula)", multiplo: true },
];

const DICA_TIPO: Record<TipoSubmissao, string> = {
  topico: "Um tópico é a menor unidade de estudo: um assunto com vídeo, materiais e questões.",
  aula: "Uma aula agrupa tópicos. Escolha tópicos já publicados ou tópicos que você enviou.",
  disciplina: "Uma disciplina agrupa aulas. Escolha aulas já publicadas ou aulas que você enviou.",
  curso: "Um curso agrupa disciplinas. Escolha disciplinas já publicadas ou que você enviou.",
};

export const SubmissaoForm = ({
  inicial,
  tipoEditavel = true,
  minhasSubmissoes = [],
  enviando = false,
  textoBotao = "Enviar para análise",
  onSubmit,
  onCancel,
}: SubmissaoFormProps) => {
  const [tipo, setTipo] = useState<TipoSubmissao>(inicial?.tipo || "topico");
  const [titulo, setTitulo] = useState(inicial?.titulo || "");
  const [descricao, setDescricao] = useState(inicial?.descricao || "");
  const [dados, setDados] = useState<SubmissaoInput["dados"]>(inicial?.dados || {});
  const [questoesTexto, setQuestoesTexto] = useState((inicial?.dados?.questoes_ids || []).join(", "));
  const [itensIds, setItensIds] = useState<string[]>(inicial?.itens_ids || []);
  const [itensSubmissaoIds, setItensSubmissaoIds] = useState<string[]>(inicial?.itens_submissao_ids || []);
  const [destino, setDestino] = useState<string[]>(inicial?.destino_id ? [inicial.destino_id] : []);

  const tipoFilho = TIPO_FILHO[tipo];
  const tipoDestino = TIPO_DESTINO[tipo];
  const outrasSubmissoes = minhasSubmissoes.filter((s) => s.id !== inicial?.id);

  const trocarTipo = (novo: TipoSubmissao) => {
    setTipo(novo);
    setItensIds([]);
    setItensSubmissaoIds([]);
    setDestino([]);
  };

  const setCampo = (chave: keyof SubmissaoInput["dados"], valor: unknown) =>
    setDados((prev) => ({ ...prev, [chave]: valor }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (titulo.trim().length < 3) {
      toast.error("O título precisa ter pelo menos 3 caracteres");
      return;
    }

    const dadosFinais: SubmissaoInput["dados"] = {};
    if (tipo === "topico") {
      if (!dados.disciplina?.trim()) {
        toast.error("Informe a disciplina do tópico");
        return;
      }
      dadosFinais.disciplina = dados.disciplina;
      for (const campo of CAMPOS_LINK) {
        const valor = (dados[campo.chave] as string | undefined)?.trim();
        if (!valor) continue;
        const partes = campo.multiplo ? valor.split(",").map((p) => p.trim()).filter(Boolean) : [valor];
        if (partes.some((p) => !linkValido(p))) {
          toast.error(`${campo.label}: use links completos começando com https://`);
          return;
        }
        (dadosFinais as Record<string, unknown>)[campo.chave] = partes.join(",");
      }
      const questoes = Array.from(
        new Set(questoesTexto.split(/[\s,;]+/).map((q) => q.trim()).filter(Boolean))
      );
      if (questoes.length > 0) dadosFinais.questoes_ids = questoes;
      if (dados.abrir_em_nova_guia) dadosFinais.abrir_em_nova_guia = true;
    }
    if (tipo === "disciplina" && dados.banca?.trim()) dadosFinais.banca = dados.banca;
    if (tipo === "curso" && dados.informacoes_curso?.trim()) dadosFinais.informacoes_curso = dados.informacoes_curso;

    if (tipoFilho && itensIds.length + itensSubmissaoIds.length === 0) {
      toast.error(`Selecione ao menos um(a) ${TIPO_LABEL[tipoFilho].toLowerCase()}`);
      return;
    }

    onSubmit({
      tipo,
      titulo,
      descricao: tipo === "topico" ? null : descricao,
      dados: dadosFinais,
      itens_ids: tipoFilho ? itensIds : [],
      itens_submissao_ids: tipoFilho ? itensSubmissaoIds : [],
      destino_id: tipoDestino ? destino[0] || null : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de conteúdo</Label>
        <Select value={tipo} onValueChange={(v) => trocarTipo(v as TipoSubmissao)} disabled={!tipoEditavel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TIPO_LABEL) as TipoSubmissao[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TIPO_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">{DICA_TIPO[tipo]}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sub-titulo">Título *</Label>
        <Input id="sub-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} required />
      </div>

      {tipo !== "topico" && (
        <div className="space-y-2">
          <Label htmlFor="sub-descricao">Descrição</Label>
          <Textarea
            id="sub-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={5000}
            rows={3}
          />
        </div>
      )}

      {tipo === "topico" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sub-disciplina">Disciplina *</Label>
            <Input
              id="sub-disciplina"
              value={dados.disciplina || ""}
              onChange={(e) => setCampo("disciplina", e.target.value)}
              placeholder="Ex.: Língua Portuguesa"
              maxLength={200}
            />
          </div>
          {CAMPOS_LINK.map((campo) => (
            <div className="space-y-2" key={campo.chave}>
              <Label htmlFor={`sub-${campo.chave}`}>{campo.label}</Label>
              <Input
                id={`sub-${campo.chave}`}
                type={campo.multiplo ? "text" : "url"}
                value={(dados[campo.chave] as string) || ""}
                onChange={(e) => setCampo(campo.chave, e.target.value)}
                placeholder="https://"
                maxLength={4000}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="sub-questoes">IDs das questões relacionadas</Label>
            <Textarea
              id="sub-questoes"
              value={questoesTexto}
              onChange={(e) => setQuestoesTexto(e.target.value)}
              placeholder="Separe os IDs por vírgula ou espaço"
              rows={2}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={!!dados.abrir_em_nova_guia}
              onCheckedChange={(v) => setCampo("abrir_em_nova_guia", v === true)}
            />
            Abrir o vídeo em nova guia
          </label>
        </>
      )}

      {tipo === "disciplina" && (
        <div className="space-y-2">
          <Label htmlFor="sub-banca">Banca</Label>
          <Input
            id="sub-banca"
            value={dados.banca || ""}
            onChange={(e) => setCampo("banca", e.target.value)}
            maxLength={200}
          />
        </div>
      )}

      {tipo === "curso" && (
        <div className="space-y-2">
          <Label htmlFor="sub-info">Informações do curso</Label>
          <Textarea
            id="sub-info"
            value={dados.informacoes_curso || ""}
            onChange={(e) => setCampo("informacoes_curso", e.target.value)}
            maxLength={20000}
            rows={3}
          />
        </div>
      )}

      {tipoFilho && (
        <div className="space-y-2">
          <Label>{TIPO_LABEL[tipoFilho]}s que compõem este conteúdo *</Label>
          <ItemPicker
            tipo={tipoFilho}
            publicadosSelecionados={itensIds}
            onPublicadosChange={setItensIds}
            minhasSubmissoes={outrasSubmissoes}
            submissoesSelecionadas={itensSubmissaoIds}
            onSubmissoesChange={setItensSubmissaoIds}
          />
        </div>
      )}

      {tipoDestino && (
        <div className="space-y-2">
          <Label>Sugerir inclusão em um(a) {TIPO_LABEL[tipoDestino].toLowerCase()} existente (opcional)</Label>
          <ItemPicker tipo={tipoDestino} publicadosSelecionados={destino} onPublicadosChange={setDestino} unico />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={enviando}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={enviando} className="bg-[#5f2ebe] hover:bg-[#4f25a0] text-white">
          {enviando ? "Salvando..." : textoBotao}
        </Button>
      </div>
    </form>
  );
};
