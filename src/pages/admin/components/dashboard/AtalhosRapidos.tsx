import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, FolderPlus, Newspaper, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Pendencias {
  envios: number;
  correcoes: number;
}

const usePendencias = () => {
  const [p, setP] = useState<Pendencias | null>(null);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const contar = async (tabela: string) => {
      const { count, error } = await db.from(tabela).select("id", { count: "exact", head: true }).eq("status", "pendente");
      return error ? 0 : count || 0;
    };
    Promise.all([contar("conteudo_submissoes"), contar("teoria_correcoes")])
      .then(([envios, correcoes]) => setP({ envios, correcoes }))
      .catch(() => setP({ envios: 0, correcoes: 0 }));
  }, []);
  return p;
};

const Atalho: React.FC<{ to: string; icone: React.ReactNode; titulo: string; texto: string; destaque?: boolean }> = ({
  to,
  icone,
  titulo,
  texto,
  destaque,
}) => (
  <Link
    to={to}
    className={`group flex items-start gap-3 rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
      destaque ? "border-[#ea2be2]/40 bg-[#ea2be2]/5" : "border-slate-200 bg-white"
    }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
        destaque ? "bg-[#ea2be2] text-white" : "bg-[#5f2ebe]/10 text-[#5f2ebe]"
      }`}
    >
      {icone}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-[#272f3c] group-hover:text-[#5f2ebe]">{titulo}</span>
      <span className="block text-xs text-slate-500">{texto}</span>
    </span>
  </Link>
);

/** Atalhos para as tarefas mais comuns e o que está esperando moderação. */
export const AtalhosRapidos: React.FC = () => {
  const p = usePendencias();
  const totalPendente = p ? p.envios + p.correcoes : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Atalho
        to="/admin/moderacao"
        icone={<ClipboardCheck className="h-5 w-5" />}
        titulo={totalPendente > 0 ? `${totalPendente} aguardando moderação` : "Moderação em dia"}
        texto={
          p
            ? `${p.envios} ${p.envios === 1 ? "envio" : "envios"} · ${p.correcoes} ${p.correcoes === 1 ? "correção" : "correções"} de teoria`
            : "Carregando..."
        }
        destaque={totalPendente > 0}
      />
      <Atalho
        to="/admin/teorias/new"
        icone={<PenLine className="h-5 w-5" />}
        titulo="Nova teoria"
        texto="Escrever uma aula em texto"
      />
      <Atalho
        to="/admin/topicos"
        icone={<FolderPlus className="h-5 w-5" />}
        titulo="Tópicos e aulas"
        texto="Criar tópicos e montar aulas"
      />
      <Atalho
        to="/admin/posts"
        icone={<Newspaper className="h-5 w-5" />}
        titulo="Posts do blog"
        texto="Notícias e artigos"
      />
    </div>
  );
};

