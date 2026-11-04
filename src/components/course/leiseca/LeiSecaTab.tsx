import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenText, Clock, PencilLine, Scale, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { LeiSecaViewer, LeiSeca, ModoLei } from "./LeiSecaViewer";
import { CabecalhoAba, Carregando, EstadoVazio, Painel, normalizar } from "../ui";

interface LeiSecaTabProps {
  courseId?: string;
}

const minutosLeitura = (texto: string) => Math.max(1, Math.round((texto.trim().split(/\s+/).length || 0) / 200));

export const LeiSecaTab = ({ courseId }: LeiSecaTabProps) => {
  const [leis, setLeis] = useState<LeiSeca[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [aberta, setAberta] = useState<{ lei: LeiSeca; modo: ModoLei } | null>(null);
  const [busca, setBusca] = useState("");
  const topo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLeis = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        setErro(false);
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        // Uma lei pode estar ligada a vários cursos (cursos_ids); curso_id fica por compatibilidade
        const { data, error } = await supabase
          .from("leis_secas")
          .select("id, titulo, conteudo, palavras_treino, curso_id, cursos_ids")
          .eq("ativo", true)
          .or(`curso_id.eq.${realCourseId},cursos_ids.cs.{${realCourseId}}`)
          .order("titulo", { ascending: true });
        if (error) throw error;
        setLeis((data || []) as unknown as LeiSeca[]);
      } catch (error) {
        console.error("Erro ao buscar leis secas:", error);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLeis();
  }, [courseId]);

  const abrir = (lei: LeiSeca, modo: ModoLei) => {
    setAberta({ lei, modo });
    requestAnimationFrame(() => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const termo = normalizar(busca);
  const filtradas = useMemo(
    () => (termo ? leis.filter((l) => normalizar(l.titulo).includes(termo) || normalizar(l.conteudo).includes(termo)) : leis),
    [leis, termo]
  );

  if (loading) return <Carregando texto="Carregando leis..." />;

  if (aberta) {
    return (
      <div ref={topo} className="scroll-mt-4">
        <LeiSecaViewer lei={aberta.lei} modoInicial={aberta.modo} onBack={() => setAberta(null)} />
      </div>
    );
  }

  if (erro) {
    return <EstadoVazio icone={Scale} titulo="Não foi possível carregar as leis" texto="Verifique sua conexão e recarregue a página." />;
  }

  if (leis.length === 0) {
    return (
      <EstadoVazio
        icone={Scale}
        titulo="Nenhuma lei disponível"
        texto="Ainda não há textos de lei seca para este curso. Quando houver, você poderá ler e treinar completando as lacunas."
      />
    );
  }

  return (
    <div ref={topo} className="space-y-5 pb-5">
      <CabecalhoAba
        titulo="Lei seca"
        descricao="Leia o texto da lei e treine a memorização completando as palavras que mais caem."
        acoes={
          leis.length > 3 ? (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar lei ou trecho..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#5f2ebe]/50 focus:ring-2 focus:ring-[#5f2ebe]/10"
              />
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        {filtradas.map((lei) => {
          const lacunas = Array.isArray(lei.palavras_treino) ? lei.palavras_treino.length : 0;
          return (
            <Painel key={lei.id} className="group flex flex-col p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)] md:p-5">
              <button type="button" onClick={() => abrir(lei, "ler")} className="flex flex-1 flex-col items-stretch justify-start text-left">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
                    <Scale className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe]">{lei.titulo}</h3>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />~{minutosLeitura(lei.conteudo)} min de leitura
                      </span>
                      {lacunas > 0 && (
                        <span className="flex items-center gap-1">
                          <PencilLine className="h-3.5 w-3.5" />
                          {lacunas} {lacunas === 1 ? "lacuna" : "lacunas"} para treinar
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">{lei.conteudo.slice(0, 320)}</p>
              </button>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => abrir(lei, "ler")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                >
                  <BookOpenText className="h-4 w-4" /> Ler
                </button>
                {lacunas > 0 && (
                  <button
                    type="button"
                    onClick={() => abrir(lei, "treinar")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
                  >
                    <PencilLine className="h-4 w-4" /> Treinar
                  </button>
                )}
              </div>
            </Painel>
          );
        })}
        {filtradas.length === 0 && (
          <Painel className="p-8 text-center text-sm text-slate-500 md:col-span-2">Nenhuma lei encontrada para “{busca}”.</Painel>
        )}
      </div>
    </div>
  );
};
