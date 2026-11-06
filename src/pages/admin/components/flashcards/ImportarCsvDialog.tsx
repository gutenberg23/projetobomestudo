import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileUp, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { botaoPrimario, normalizar } from "@/components/admin/ui/listagem";
import { lerCsvFlashcards, textoSimples, type ResultadoCsv } from "@/lib/flashcards";
import { cn } from "@/lib/utils";
import { EscolherCursos, EscolherTeoria, deEscolha, type EscolhaCursos } from "./Escolhas";
import type { FlashcardsAdmin } from "./useFlashcardsAdmin";

const NOME_SEPARADOR: Record<string, string> = { "\t": "Tab", ",": "vírgula", ";": "ponto e vírgula", "|": "barra vertical", " ": "espaço", ":": "dois-pontos" };

const MODELO =
  "frente;verso;tags\n" +
  "Quais são os princípios do art. 37 da CF?;Legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE);constitucional art37\n" +
  "O que é ato administrativo vinculado?;Aquele em que a lei não deixa margem de escolha ao administrador;administrativo\n";

const baixar = (nome: string, conteudo: string) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
};

/** Importação de flashcards por arquivo .csv/.txt (formato do Anki). */
export const ImportarCsvDialog: React.FC<{
  aberto: boolean;
  onFechar: () => void;
  admin: FlashcardsAdmin;
  teoriaInicial?: string | null;
}> = ({ aberto, onFechar, admin, teoriaInicial }) => {
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [colar, setColar] = useState(false);
  const [teoriaId, setTeoriaId] = useState<string | null>(null);
  const [cursos, setCursos] = useState<EscolhaCursos>({ todos: true, ids: [] });
  const [pularRepetidos, setPularRepetidos] = useState(true);
  const [importando, setImportando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) return;
    setTexto("");
    setNomeArquivo("");
    setColar(false);
    setTeoriaId(teoriaInicial ?? null);
    setCursos({ todos: true, ids: [] });
    setPularRepetidos(true);
  }, [aberto, teoriaInicial]);

  const lerArquivo = (arquivo: File | undefined) => {
    if (!arquivo) return;
    if (arquivo.size > 5 * 1024 * 1024) return toast.error("Arquivo grande demais (máximo 5 MB).");
    const leitor = new FileReader();
    leitor.onload = () => {
      setTexto(String(leitor.result || ""));
      setNomeArquivo(arquivo.name);
    };
    leitor.onerror = () => toast.error("Não foi possível ler o arquivo.");
    leitor.readAsText(arquivo, "utf-8");
  };

  const resultado: ResultadoCsv | null = useMemo(() => (texto.trim() ? lerCsvFlashcards(texto) : null), [texto]);

  // Coluna "teoria": aceita ID ou o título exato da teoria
  const topicoPorNome = useMemo(() => {
    const m = new Map<string, string>();
    admin.teorias.forEach((t) => m.set(normalizar(t.nome.trim()), t.id));
    return m;
  }, [admin.teorias]);

  const usaColunaTopico = !!resultado?.linhas.some((l) => l.topico);

  const linhas = useMemo(() => {
    if (!resultado) return [];
    const existentes = new Set(admin.cartoes.map((c) => `${c.teoriaId}|${normalizar(textoSimples(c.frente))}`));
    const nesteArquivo = new Set<string>();
    return resultado.linhas.map((l) => {
      let destino: string | null = teoriaId;
      let erro = l.erro;
      if (l.topico) {
        destino = admin.teoriaPorId.has(l.topico) ? l.topico : topicoPorNome.get(normalizar(l.topico)) || null;
        if (!destino) erro = erro || `Teoria “${l.topico}” não encontrada`;
      }
      if (!destino && !erro) erro = "Sem teoria";
      const chave = `${destino}|${normalizar(textoSimples(l.frente))}`;
      const repetido = !erro && (existentes.has(chave) || nesteArquivo.has(chave));
      if (!erro) nesteArquivo.add(chave);
      return { ...l, destino, erro, repetido };
    });
  }, [resultado, teoriaId, admin.cartoes, admin.teoriaPorId, topicoPorNome]);

  const validas = linhas.filter((l) => !l.erro && !(pularRepetidos && l.repetido));
  const comErro = linhas.filter((l) => l.erro).length;
  const repetidos = linhas.filter((l) => !l.erro && l.repetido).length;
  const destaque = useMemo(
    () => Array.from(new Set(validas.flatMap((l) => (l.destino ? admin.cursosDaTeoria[l.destino] || [] : [])))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validas.length, teoriaId, admin.cursosDaTeoria]
  );

  const importar = async () => {
    if (validas.length === 0) return toast.error("Nenhum cartão válido para importar.");
    if (!cursos.todos && cursos.ids.length === 0) return toast.error("Escolha ao menos um curso.");
    setImportando(true);
    try {
      const criados = await admin.criar(
        validas.map((l) => ({ teoriaId: l.destino as string, frente: l.frente, verso: l.verso, tags: l.tags, cursosIds: deEscolha(cursos) }))
      );
      if (criados > 0) {
        toast.success(`${criados} ${criados === 1 ? "flashcard importado" : "flashcards importados"}`);
        onFechar();
      }
    } finally {
      setImportando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !importando && onFechar()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar flashcards</DialogTitle>
          <DialogDescription>Arquivo .csv ou .txt, como o exportado pelo Anki em “Notas em texto simples”.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* 1. Arquivo */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>1. Arquivo</Label>
              <button type="button" onClick={() => baixar("modelo-flashcards.csv", "\uFEFF" + MODELO)} className="inline-flex items-center gap-1 text-xs font-medium text-[#5f2ebe] hover:underline">
                <Download className="h-3.5 w-3.5" />
                Baixar modelo
              </button>
            </div>
            {colar ? (
              <Textarea
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setNomeArquivo("");
                }}
                rows={6}
                placeholder={MODELO}
                className="font-mono text-xs"
                autoFocus
              />
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setArrastando(false);
                  lerArquivo(e.dataTransfer.files?.[0]);
                }}
                onClick={() => entrada.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && entrada.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors",
                  arrastando ? "border-[#5f2ebe] bg-[#f8f5ff]" : "border-slate-200 hover:border-[#5f2ebe]/40 hover:bg-slate-50"
                )}
              >
                <FileUp className="h-7 w-7 text-[#5f2ebe]" />
                {nomeArquivo ? (
                  <p className="text-sm font-medium text-slate-800">{nomeArquivo}</p>
                ) : (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-[#5f2ebe]">Escolha um arquivo</span> ou arraste para cá
                  </p>
                )}
                <p className="text-xs text-slate-400">.csv, .tsv ou .txt · separador detectado automaticamente</p>
                <input ref={entrada} type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" className="hidden" onChange={(e) => lerArquivo(e.target.files?.[0])} />
              </div>
            )}
            <button type="button" onClick={() => setColar((v) => !v)} className="text-xs font-medium text-slate-500 hover:text-[#5f2ebe]">
              {colar ? "Enviar um arquivo" : "Prefiro colar o conteúdo"}
            </button>

            <details className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">
                <Info className="mr-1 inline h-3.5 w-3.5" />
                Formato aceito
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Uma linha por cartão: <b>frente</b>, <b>verso</b> e, se quiser, <b>tags</b> (separadas por espaço).</li>
                <li>Separador: Tab, ponto e vírgula ou vírgula. Textos com separador ou quebra de linha vão entre aspas.</li>
                <li>Linha de títulos opcional: frente, verso, tags, teoria. A coluna <b>teoria</b> aceita o ID ou o título exato da teoria.</li>
                <li>Arquivos do Anki: exporte em “Notas em texto simples (.txt)”. Os cabeçalhos #separator e #html são lidos e a formatação em HTML é mantida.</li>
              </ul>
            </details>
          </section>

          {resultado && (
            <>
              {/* 2. Teoria */}
              <section className="space-y-2">
                <Label>{usaColunaTopico ? "2. Teoria para as linhas sem a coluna teoria" : "2. Teoria dos cartões *"}</Label>
                <EscolherTeoria
                  teorias={admin.teorias}
                  valor={teoriaId}
                  onChange={setTeoriaId}
                  cursosDaTeoria={admin.cursosDaTeoria}
                  rotuloNenhum={usaColunaTopico ? "Usar só a coluna topico do arquivo" : undefined}
                />
              </section>

              {/* 3. Cursos */}
              <section className="space-y-2">
                <Label>3. Em quais cursos aparecem</Label>
                <EscolherCursos nome="import-cursos" cursos={admin.cursos} valor={cursos} onChange={setCursos} destaque={destaque} />
              </section>

              {/* 4. Conferência */}
              <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>4. Confira</Label>
                  <span className="text-xs text-slate-500">
                    Separador: {NOME_SEPARADOR[resultado.separador] || resultado.separador}
                    {resultado.temCabecalho ? " · com linha de títulos" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {validas.length} para importar
                  </span>
                  {comErro > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {comErro} com problema
                    </span>
                  )}
                  {repetidos > 0 && (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                      <input type="checkbox" checked={pularRepetidos} onChange={(e) => setPularRepetidos(e.target.checked)} className="accent-amber-600" />
                      Pular {repetidos} repetido(s)
                    </label>
                  )}
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-2 py-1.5 font-medium">Linha</th>
                        <th className="px-2 py-1.5 font-medium">Frente</th>
                        <th className="px-2 py-1.5 font-medium">Verso</th>
                        <th className="px-2 py-1.5 font-medium">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linhas.slice(0, 100).map((l) => (
                        <tr key={l.linha} className={cn(l.erro && "bg-red-50/50")}>
                          <td className="px-2 py-1.5 tabular-nums text-slate-400">{l.linha}</td>
                          <td className="max-w-[220px] px-2 py-1.5 text-slate-800">
                            <span className="line-clamp-2">{textoSimples(l.frente) || "—"}</span>
                          </td>
                          <td className="max-w-[220px] px-2 py-1.5 text-slate-600">
                            <span className="line-clamp-2">{textoSimples(l.verso) || "—"}</span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5">
                            {l.erro ? (
                              <span className="text-red-600">{l.erro}</span>
                            ) : l.repetido ? (
                              <span className="text-amber-700">{pularRepetidos ? "Repetido (pula)" : "Repetido"}</span>
                            ) : (
                              <span className="text-emerald-700">OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {linhas.length > 100 && <p className="text-xs text-slate-500">Mostrando as 100 primeiras de {linhas.length} linhas.</p>}
              </section>
            </>
          )}
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={importando}>
            Cancelar
          </Button>
          <Button onClick={importar} disabled={importando || validas.length === 0} className={botaoPrimario}>
            {importando ? "Importando..." : `Importar ${validas.length || ""} ${validas.length === 1 ? "cartão" : "cartões"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
