import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  alternarValor,
  filtrosVazios,
  gravarEstado,
  lerEstado,
  type ChaveFiltro,
  type EstadoBusca,
  type Ordem,
  type Situacao,
} from "./filtros";

/** Estado da busca vive na URL: dá para compartilhar o link e o botão Voltar desfaz a troca de página. */
export function useEstadoBusca() {
  const [params, setParams] = useSearchParams();
  const estado = useMemo(() => lerEstado(params), [params]);

  const mudar = useCallback(
    (alterar: (e: EstadoBusca) => EstadoBusca, historico = false) => {
      setParams((atual) => gravarEstado(alterar(lerEstado(atual))), { replace: !historico });
    },
    [setParams]
  );

  return {
    estado,
    definirBusca: (q: string) => mudar((e) => ({ ...e, q: q.trim(), pagina: 1 })),
    alternar: (chave: ChaveFiltro, valor: string) => mudar((e) => ({ ...e, filtros: alternarValor(e.filtros, chave, valor), pagina: 1 })),
    limparChave: (chave: ChaveFiltro) =>
      mudar((e) => {
        const filtros = { ...e.filtros, [chave]: [] };
        if (chave === "disciplines") {
          filtros.topics = [];
          filtros.subtopics = [];
        }
        return { ...e, filtros, pagina: 1 };
      }),
    limparTudo: () => mudar((e) => ({ ...e, q: "", filtros: filtrosVazios(), situacao: "todas", pagina: 1 })),
    irPagina: (pagina: number) => mudar((e) => ({ ...e, pagina }), true),
    definirPorPagina: (porPagina: number) => mudar((e) => ({ ...e, porPagina, pagina: 1 })),
    definirOrdem: (ordem: Ordem) => mudar((e) => ({ ...e, ordem, pagina: 1 })),
    definirSituacao: (situacao: Situacao) => mudar((e) => ({ ...e, situacao, pagina: 1 })),
  };
}
