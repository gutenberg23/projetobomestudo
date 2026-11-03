import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  ItemPublicado,
  Submissao,
  TipoSubmissao,
  TIPO_LABEL,
  buscarItensPublicados,
  buscarItensPublicadosPorIds,
} from "@/services/contribuicoes";

interface ItemPickerProps {
  tipo: TipoSubmissao;
  /** IDs de itens já publicados selecionados */
  publicadosSelecionados: string[];
  onPublicadosChange: (ids: string[]) => void;
  /** Envios do próprio autor que podem ser usados (opcional) */
  minhasSubmissoes?: Submissao[];
  submissoesSelecionadas?: string[];
  onSubmissoesChange?: (ids: string[]) => void;
  /** Seleção única (usado para escolher o destino) */
  unico?: boolean;
  disabled?: boolean;
}

export const ItemPicker = ({
  tipo,
  publicadosSelecionados,
  onPublicadosChange,
  minhasSubmissoes = [],
  submissoesSelecionadas = [],
  onSubmissoesChange,
  unico = false,
  disabled = false,
}: ItemPickerProps) => {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ItemPublicado[]>([]);
  const [selecionadosInfo, setSelecionadosInfo] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(false);

  // Busca com debounce
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    const timer = setTimeout(async () => {
      try {
        const itens = await buscarItensPublicados(tipo, termo);
        if (ativo) setResultados(itens);
      } catch (e) {
        console.error("Erro ao buscar itens:", e);
        if (ativo) setResultados([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [tipo, termo]);

  // Carrega títulos dos itens selecionados que não aparecem na busca
  useEffect(() => {
    const faltando = publicadosSelecionados.filter((id) => !selecionadosInfo[id]);
    if (faltando.length === 0) return;
    buscarItensPublicadosPorIds(tipo, faltando)
      .then((itens) =>
        setSelecionadosInfo((prev) => {
          const novo = { ...prev };
          itens.forEach((i) => (novo[i.id] = i.titulo));
          return novo;
        })
      )
      .catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, publicadosSelecionados.join(",")]);

  const togglePublicado = (item: ItemPublicado) => {
    setSelecionadosInfo((prev) => ({ ...prev, [item.id]: item.titulo }));
    if (publicadosSelecionados.includes(item.id)) {
      onPublicadosChange(publicadosSelecionados.filter((id) => id !== item.id));
    } else {
      onPublicadosChange(unico ? [item.id] : [...publicadosSelecionados, item.id]);
    }
  };

  const toggleSubmissao = (id: string) => {
    if (!onSubmissoesChange) return;
    onSubmissoesChange(
      submissoesSelecionadas.includes(id)
        ? submissoesSelecionadas.filter((s) => s !== id)
        : [...submissoesSelecionadas, id]
    );
  };

  const minhasUsaveis = minhasSubmissoes.filter((s) => s.tipo === tipo && s.status !== "rejeitado");
  const totalSelecionado = publicadosSelecionados.length + submissoesSelecionadas.length;

  return (
    <div className="space-y-2">
      {totalSelecionado > 0 && (
        <div className="flex flex-wrap gap-2">
          {publicadosSelecionados.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1">
              {selecionadosInfo[id] || "Carregando..."}
              {!disabled && (
                <button
                  type="button"
                  aria-label="Remover"
                  onClick={() => onPublicadosChange(publicadosSelecionados.filter((x) => x !== id))}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {submissoesSelecionadas.map((id) => {
            const s = minhasSubmissoes.find((m) => m.id === id);
            return (
              <Badge key={id} variant="outline" className="gap-1 border-[#5f2ebe] text-[#5f2ebe]">
                {s ? s.titulo : "Envio"} (seu envio)
                {!disabled && (
                  <button type="button" aria-label="Remover" onClick={() => toggleSubmissao(id)}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}

      {!disabled && (
        <>
          <Input
            placeholder={`Buscar ${TIPO_LABEL[tipo].toLowerCase()} publicado pelo nome`}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            maxLength={100}
          />
          <div className="max-h-48 overflow-y-auto rounded border divide-y">
            {carregando ? (
              <p className="p-2 text-sm text-gray-500">Buscando...</p>
            ) : resultados.length === 0 ? (
              <p className="p-2 text-sm text-gray-500">Nenhum item encontrado.</p>
            ) : (
              resultados.map((item) => (
                <label key={item.id} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-slate-50">
                  <Checkbox
                    checked={publicadosSelecionados.includes(item.id)}
                    onCheckedChange={() => togglePublicado(item)}
                  />
                  <span className="truncate">{item.titulo}</span>
                </label>
              ))
            )}
          </div>

          {onSubmissoesChange && minhasUsaveis.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">Ou use itens que você mesmo enviou:</p>
              <div className="max-h-40 overflow-y-auto rounded border divide-y">
                {minhasUsaveis.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={submissoesSelecionadas.includes(s.id)}
                      onCheckedChange={() => toggleSubmissao(s.id)}
                    />
                    <span className="truncate">{s.titulo}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {s.status === "aprovado" ? "aprovado" : "aguardando análise"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
