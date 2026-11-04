import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText, Plus, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { supabase } from "@/integrations/supabase/client";

export interface TeoriaOpcao {
  id: string;
  titulo: string;
  disciplina_id: string | null;
  assunto_id: string | null;
  status: "draft" | "published";
}

const normalizar = (texto: string) =>
  (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Cache simples para não buscar a lista de teorias a cada modal aberto
let cacheTeorias: TeoriaOpcao[] | null = null;

const carregarTeorias = async (forcar = false): Promise<TeoriaOpcao[]> => {
  if (cacheTeorias && !forcar) return cacheTeorias;
  const { data, error } = await supabase
    .from("teorias")
    .select("id, titulo, disciplina_id, assunto_id, status")
    .order("titulo");
  if (error) throw error;
  cacheTeorias = (data || []) as TeoriaOpcao[];
  return cacheTeorias;
};

interface AulaEmTextoFieldProps {
  id: string;
  teoriaId: string | null | undefined;
  onTeoriaChange: (teoriaId: string | null) => void;
  pdfUrl: string;
  onPdfChange: (url: string) => void;
  /** Disciplina do tópico, usada para sugerir teorias da mesma disciplina primeiro */
  disciplina?: string;
}

/**
 * Campo "Link da aula em texto": escolhe uma teoria do site.
 * Tópicos antigos com PDF continuam funcionando; o PDF aparece como opção legada.
 */
export const AulaEmTextoField: React.FC<AulaEmTextoFieldProps> = ({
  id,
  teoriaId,
  onTeoriaChange,
  pdfUrl,
  onPdfChange,
  disciplina,
}) => {
  const [teorias, setTeorias] = useState<TeoriaOpcao[]>(cacheTeorias || []);
  const [carregando, setCarregando] = useState(!cacheTeorias);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [mostrarPdf, setMostrarPdf] = useState(!!pdfUrl);

  const recarregar = useCallback(async (forcar = false) => {
    setCarregando(true);
    setErro(null);
    try {
      setTeorias(await carregarTeorias(forcar));
    } catch (e) {
      console.error("Erro ao carregar teorias:", e);
      setErro("Não foi possível carregar as teorias.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  useEffect(() => {
    if (pdfUrl) setMostrarPdf(true);
  }, [pdfUrl]);

  const selecionada = teorias.find((t) => t.id === teoriaId) || null;

  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const disc = normalizar(disciplina || "");
    const filtradas = teorias.filter((t) => {
      if (!termo) return true;
      return (
        normalizar(t.titulo).includes(termo) ||
        normalizar(t.disciplina_id || "").includes(termo) ||
        normalizar(t.assunto_id || "").includes(termo)
      );
    });
    // Teorias da mesma disciplina do tópico aparecem primeiro
    if (disc) {
      filtradas.sort((a, b) => {
        const da = normalizar(a.disciplina_id || "") === disc ? 0 : 1;
        const dbb = normalizar(b.disciplina_id || "") === disc ? 0 : 1;
        return da - dbb;
      });
    }
    return filtradas.slice(0, 50);
  }, [teorias, busca, disciplina]);

  const escolher = (t: TeoriaOpcao) => {
    onTeoriaChange(t.id);
    setBusca("");
    setBuscando(false);
  };

  return (
    <div className="space-y-2 rounded-md border border-gray-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>Link da aula em texto</Label>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => recarregar(true)} title="Recarregar lista de teorias">
            <RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild title="Criar nova teoria em outra aba">
            <a href="/admin/teorias/new" target="_blank" rel="noreferrer">
              <Plus className="h-4 w-4 mr-1" /> Nova teoria
            </a>
          </Button>
        </div>
      </div>

      {teoriaId && (
        <div className="flex items-center justify-between gap-2 rounded bg-[#f8f5ff] border border-[#5f2ebe]/20 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#272f3c] truncate">
              <FileText className="inline h-4 w-4 mr-1 text-[#5f2ebe]" />
              {selecionada ? selecionada.titulo : carregando ? "Carregando..." : "Teoria não encontrada"}
            </p>
            {selecionada && (
              <p className="text-xs text-[#67748a] truncate">
                {[selecionada.disciplina_id, selecionada.assunto_id].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {selecionada?.status === "draft" && (
              <Badge variant="outline" className="border-amber-300 text-amber-700" title="Alunos só veem teorias publicadas">
                Rascunho
              </Badge>
            )}
            <Button type="button" variant="ghost" size="sm" asChild title="Editar teoria em outra aba">
              <a href={`/admin/teorias/${teoriaId}/edit`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onTeoriaChange(null)} title="Remover teoria">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          id={id}
          value={busca}
          onFocus={() => setBuscando(true)}
          onChange={(e) => {
            setBusca(e.target.value);
            setBuscando(true);
          }}
          placeholder={teoriaId ? "Trocar teoria: busque pelo título, disciplina ou assunto" : "Busque a teoria pelo título, disciplina ou assunto"}
          className="pr-9"
          autoComplete="off"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      {buscando && (
        <div className="max-h-56 overflow-y-auto rounded border border-gray-200 bg-white">
          {carregando && teorias.length === 0 ? (
            <p className="p-3 text-sm text-[#67748a]">Carregando teorias...</p>
          ) : resultados.length === 0 ? (
            <p className="p-3 text-sm text-[#67748a]">Nenhuma teoria encontrada.</p>
          ) : (
            resultados.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => escolher(t)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 ${
                  t.id === teoriaId ? "bg-[#f8f5ff]" : ""
                }`}
              >
                <span className="block text-sm text-[#272f3c]">
                  {t.titulo}
                  {t.status === "draft" && <span className="ml-2 text-xs text-amber-700">(rascunho)</span>}
                </span>
                <span className="block text-xs text-[#67748a]">
                  {[t.disciplina_id, t.assunto_id].filter(Boolean).join(" · ")}
                </span>
              </button>
            ))
          )}
          <div className="flex justify-end p-1 border-t bg-gray-50">
            <Button type="button" variant="ghost" size="sm" onClick={() => setBuscando(false)}>
              Fechar lista
            </Button>
          </div>
        </div>
      )}

      {mostrarPdf ? (
        <div className="pt-2 border-t border-dashed">
          <FileUploadField
            id={`${id}-pdf`}
            label="PDF da aula (formato antigo)"
            value={pdfUrl}
            onChange={onPdfChange}
            placeholder="URL do PDF ou faça upload"
            allowedTypes={["pdf"]}
            rootFolder="pdf"
          />
          <p className="text-xs text-[#67748a] mt-1">
            Mantido para tópicos antigos. Se houver teoria e PDF, o aluno vê os dois botões.
          </p>
        </div>
      ) : (
        <button
          type="button"
          className="text-xs text-[#67748a] underline hover:text-[#5f2ebe]"
          onClick={() => setMostrarPdf(true)}
        >
          Usar um PDF (formato antigo)
        </button>
      )}
    </div>
  );
};
