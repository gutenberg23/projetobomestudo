import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Palette, PanelBottom, PanelsTopLeft, Search, Settings2, LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { SecaoAparencia, SecaoCurso, SecaoGeral, SecaoPaginas, SecaoRodape, SecaoSeo } from "./components/configuracoes/Secoes";
import { SecaoProps } from "./components/configuracoes/comum";

type IdSecao = "geral" | "rodape" | "paginas" | "curso" | "aparencia" | "seo";

const SECOES: { id: IdSecao; titulo: string; resumo: string; icone: LucideIcon; Componente: React.FC<SecaoProps> }[] = [
  { id: "geral", titulo: "Geral e contato", resumo: "Nome, contato e manutenção", icone: Settings2, Componente: SecaoGeral },
  { id: "paginas", titulo: "Páginas do site", resumo: "Ligar e desligar páginas", icone: LayoutGrid, Componente: SecaoPaginas },
  { id: "curso", titulo: "Abas do curso", resumo: "O que aparece em cada curso", icone: PanelsTopLeft, Componente: SecaoCurso },
  { id: "rodape", titulo: "Rodapé", resumo: "Links das colunas", icone: PanelBottom, Componente: SecaoRodape },
  { id: "seo", titulo: "SEO e compartilhamento", resumo: "Google, redes e Analytics", icone: Search, Componente: SecaoSeo },
  { id: "aparencia", titulo: "Aparência", resumo: "Favicon, logotipo e cores", icone: Palette, Componente: SecaoAparencia },
];

const ConfiguracoesSite = () => {
  const [params, setParams] = useSearchParams();
  const atual = SECOES.find((s) => s.id === params.get("secao")) || SECOES[0];
  const [sujo, setSujo] = useState(false);
  const [destino, setDestino] = useState<IdSecao | null>(null);

  const lista = useRef<HTMLUListElement>(null);

  // No celular a lista rola de lado: mostra a seção ativa sem mexer na rolagem vertical
  useEffect(() => {
    const ul = lista.current;
    const el = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (ul && el && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = el.offsetLeft - 16;
  }, [atual.id]);

  const onSujo = useCallback((s: boolean) => setSujo(s), []);

  const ir = (id: IdSecao) => {
    if (id === atual.id) return;
    if (sujo) {
      setDestino(id);
      return;
    }
    setParams({ secao: id }, { replace: true });
  };

  const { Componente } = atual;

  return (
    <div>
      <AdminPageHeader titulo="Configurações do site" descricao="Ajustes que valem para o site inteiro. Cada seção é salva separadamente." />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Seções das configurações" className="-mx-4 min-w-0 md:mx-0">
          <ul ref={lista} className="flex gap-1 overflow-x-auto px-4 pb-1 md:sticky md:top-4 md:flex-col md:overflow-visible md:px-0 md:pb-0">
            {SECOES.map((s) => {
              const ativa = s.id === atual.id;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => ir(s.id)}
                    aria-current={ativa ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                      ativa ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <s.icone className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-sm font-medium">{s.titulo}</span>
                      <span className={cn("hidden text-[11px] md:block", ativa ? "text-[#5f2ebe]/70" : "text-slate-400")}>{s.resumo}</span>
                    </span>
                    {ativa && sujo && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Alterações não salvas" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section aria-labelledby="secao-titulo" className="min-w-0">
          <h2 id="secao-titulo" className="mb-3 text-base font-semibold text-slate-900">
            {atual.titulo}
          </h2>
          <Componente key={atual.id} onSujo={onSujo} />
        </section>
      </div>

      <ConfirmarAcao
        aberto={!!destino}
        onFechar={() => setDestino(null)}
        titulo="Sair sem salvar?"
        descricao={`As alterações em “${atual.titulo}” ainda não foram salvas e serão descartadas.`}
        textoConfirmar="Descartar e sair"
        perigo
        onConfirmar={async () => {
          if (destino) {
            setSujo(false);
            setParams({ secao: destino }, { replace: true });
          }
        }}
      />
    </div>
  );
};

export default ConfiguracoesSite;
