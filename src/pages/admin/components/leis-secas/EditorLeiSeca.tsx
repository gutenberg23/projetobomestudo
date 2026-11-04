import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Highlighter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SecaoFormulario } from "@/components/admin/ui/dialogos";
import { normalizar } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";

export interface FormLeiSeca {
  titulo: string;
  /** Texto com as marcações [treino:palavra] */
  conteudo: string;
  cursos_ids: string[];
  ativo: boolean;
}

const MARCA = /\[treino:(.*?)\]/g;

/** Divide o texto em trechos normais e lacunas de treino. */
const trechos = (texto: string) => {
  const out: { tipo: "texto" | "lacuna"; valor: string }[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(MARCA)) {
    if (m.index! > ultimo) out.push({ tipo: "texto", valor: texto.slice(ultimo, m.index) });
    out.push({ tipo: "lacuna", valor: m[1] });
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < texto.length) out.push({ tipo: "texto", valor: texto.slice(ultimo) });
  return out;
};

interface EditorLeiSecaProps {
  editando: boolean;
  inicial: FormLeiSeca;
  cursos: { id: string; titulo: string }[];
  salvando: boolean;
  onSalvar: (form: FormLeiSeca) => void;
  onCancelar: () => void;
}

export const EditorLeiSeca: React.FC<EditorLeiSecaProps> = ({ editando, inicial, cursos, salvando, onSalvar, onCancelar }) => {
  const [form, setForm] = useState<FormLeiSeca>(inicial);
  const [selecao, setSelecao] = useState<[number, number]>([0, 0]);
  const [buscaCurso, setBuscaCurso] = useState("");
  const [preview, setPreview] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof FormLeiSeca>(k: K, v: FormLeiSeca[K]) => setForm((f) => ({ ...f, [k]: v }));

  const marcas = useMemo(() => Array.from(form.conteudo.matchAll(MARCA)).map((m) => m[1]), [form.conteudo]);
  const temSelecao = selecao[1] > selecao[0] && !/\[|\]/.test(form.conteudo.slice(selecao[0], selecao[1]));

  const marcar = () => {
    if (!temSelecao) return;
    const [a, b] = selecao;
    const sel = form.conteudo.slice(a, b);
    // Não inclui espaços das pontas na lacuna
    const ini = a + (sel.length - sel.trimStart().length);
    const fim = b - (sel.length - sel.trimEnd().length);
    const novo = `${form.conteudo.slice(0, ini)}[treino:${form.conteudo.slice(ini, fim)}]${form.conteudo.slice(fim)}`;
    set("conteudo", novo);
    setSelecao([0, 0]);
    requestAnimationFrame(() => area.current?.focus());
  };

  /** Tira a n-ésima marcação, mantendo a palavra no texto. */
  const desmarcar = (n: number) => {
    let i = -1;
    set(
      "conteudo",
      form.conteudo.replace(MARCA, (m, palavra) => {
        i++;
        return i === n ? palavra : m;
      })
    );
  };

  const cursosFiltrados = useMemo(() => {
    const t = normalizar(buscaCurso.trim());
    return cursos.filter((c) => !t || normalizar(c.titulo).includes(t));
  }, [cursos, buscaCurso]);

  const alternarCurso = (id: string) =>
    set("cursos_ids", form.cursos_ids.includes(id) ? form.cursos_ids.filter((x) => x !== id) : [...form.cursos_ids, id]);

  const valido = !!form.titulo.trim() && !!form.conteudo.trim() && form.cursos_ids.length > 0;

  return (
    <div className="-mx-4 -mt-6 md:-mx-8">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Leis secas</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {editando ? form.titulo || "Editar lei seca" : "Nova lei seca"}
            </h2>
            <p className="truncate text-xs text-slate-400">
              {valido
                ? `${marcas.length} ${marcas.length === 1 ? "palavra" : "palavras"} de treino · ${form.cursos_ids.length} ${form.cursos_ids.length === 1 ? "curso" : "cursos"}`
                : "Preencha título, conteúdo e pelo menos um curso"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancelar} disabled={salvando} className="hidden sm:inline-flex">
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSalvar(form)} disabled={!valido || salvando} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar lei seca"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-6 md:px-8">
      <p className="text-sm text-slate-500">
        Selecione palavras no texto e clique em "Marcar para treino". No site, elas viram lacunas para o aluno completar.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SecaoFormulario titulo="Texto da lei">
            <div className="space-y-1.5">
              <Label htmlFor="lei-titulo">Título *</Label>
              <Input
                id="lei-titulo"
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                placeholder="Ex.: Lei 8.112/90 - Regime Jurídico dos Servidores"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="lei-conteudo">Conteúdo *</Label>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreview(false)}
                    className={cn("rounded-md px-2.5 py-1 text-xs font-medium", !preview ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(true)}
                    className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium", preview ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                  >
                    <Eye className="h-3 w-3" /> Prévia
                  </button>
                </div>
              </div>

              {preview ? (
                <div className="min-h-[360px] whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                  {trechos(form.conteudo).map((t, i) =>
                    t.tipo === "texto" ? (
                      <React.Fragment key={i}>{t.valor}</React.Fragment>
                    ) : (
                      <span
                        key={i}
                        className="mx-0.5 inline-block min-w-[3rem] rounded border-b-2 border-[#5f2ebe] bg-[#5f2ebe]/10 px-1.5 text-center text-transparent"
                        title={t.valor}
                      >
                        {t.valor}
                      </span>
                    )
                  )}
                  {!form.conteudo && <span className="text-slate-400">Nada para mostrar ainda.</span>}
                </div>
              ) : (
                <>
                  <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={temSelecao ? "default" : "outline"}
                      disabled={!temSelecao}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={marcar}
                      className={cn("h-7 text-xs", temSelecao && "bg-[#5f2ebe] text-white hover:bg-[#4f25a0]")}
                    >
                      <Highlighter className="mr-1.5 h-3.5 w-3.5" />
                      Marcar para treino
                    </Button>
                    <span className="text-xs text-slate-500">
                      {temSelecao ? `"${form.conteudo.slice(selecao[0], selecao[1]).trim().slice(0, 40)}"` : "Selecione uma palavra ou expressão no texto"}
                    </span>
                  </div>
                  <Textarea
                    ref={area}
                    id="lei-conteudo"
                    value={form.conteudo}
                    onChange={(e) => set("conteudo", e.target.value)}
                    onSelect={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      setSelecao([t.selectionStart, t.selectionEnd]);
                    }}
                    rows={18}
                    className="rounded-t-none font-mono text-[13px] leading-6"
                    placeholder="Cole aqui o texto da lei. Ex.: O servidor [treino:estável] só perderá o cargo..."
                  />
                  <p className="text-xs text-slate-400">
                    Também dá para digitar a marcação direto: <code className="rounded bg-slate-100 px-1">[treino:palavra]</code>
                  </p>
                </>
              )}
            </div>
          </SecaoFormulario>
        </div>

        <div className="space-y-4">
          <SecaoFormulario titulo="Publicação">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label htmlFor="lei-ativo" className="text-sm font-medium text-slate-800">
                  Visível para os alunos
                </label>
                <p className="text-xs text-slate-500">Leis inativas ficam guardadas, mas não aparecem nos cursos.</p>
              </div>
              <Switch id="lei-ativo" checked={form.ativo} onCheckedChange={(v) => set("ativo", v)} />
            </div>
          </SecaoFormulario>

          <SecaoFormulario titulo={`Palavras de treino (${marcas.length})`} descricao="Clique no × para desmarcar.">
            {marcas.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma palavra marcada.</p>
            ) : (
              <ol className="flex flex-wrap gap-1.5">
                {marcas.map((m, i) => (
                  <li
                    key={`${m}-${i}`}
                    className="flex items-center gap-1 rounded-full bg-[#5f2ebe]/[0.07] py-0.5 pl-2.5 pr-1 text-xs text-slate-700 ring-1 ring-[#5f2ebe]/15"
                  >
                    <span className="max-w-[180px] truncate">{m}</span>
                    <button
                      type="button"
                      onClick={() => desmarcar(i)}
                      className="rounded-full p-0.5 text-slate-400 hover:bg-white hover:text-red-500"
                      aria-label={`Desmarcar ${m}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </SecaoFormulario>

          <SecaoFormulario titulo="Cursos *" descricao={`${form.cursos_ids.length} selecionados. A lei aparece na aba Lei seca desses cursos.`}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={buscaCurso} onChange={(e) => setBuscaCurso(e.target.value)} placeholder="Buscar curso" className="h-9 pl-8" />
            </div>
            <ul className="-mx-1 max-h-64 overflow-y-auto">
              {cursosFiltrados.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.cursos_ids.includes(c.id)}
                      onChange={() => alternarCurso(c.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#5f2ebe]"
                    />
                    <span className="truncate">{c.titulo}</span>
                  </label>
                </li>
              ))}
              {cursosFiltrados.length === 0 && <li className="px-1 py-2 text-sm text-slate-400">Nenhum curso encontrado.</li>}
            </ul>
          </SecaoFormulario>
        </div>
      </div>

      </div>
    </div>
  );
};
