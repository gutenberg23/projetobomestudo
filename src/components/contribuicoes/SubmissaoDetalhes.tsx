import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Submissao,
  StatusSubmissao,
  STATUS_LABEL,
  TIPO_DESTINO,
  TIPO_FILHO,
  TIPO_LABEL,
  buscarItensPublicadosPorIds,
  buscarSubmissoesPorIds,
  linkValido,
} from "@/services/contribuicoes";

const ROTULOS: Record<string, string> = {
  disciplina: "Disciplina",
  video_url: "Vídeo",
  pdf_url: "PDF",
  mapa_url: "Mapa mental",
  resumo_url: "Resumo",
  caderno_questoes_url: "Caderno de questões",
  musica_url: "Músicas",
  resumo_audio_url: "Resumos em áudio",
  questoes_ids: "Questões",
  abrir_em_nova_guia: "Abrir vídeo em nova guia",
  banca: "Banca",
  informacoes_curso: "Informações do curso",
};

const DOMINIOS_VIDEO = ["youtube.com", "youtu.be", "vimeo.com", "www.youtube.com", "player.vimeo.com"];

export const StatusBadge = ({ status }: { status: StatusSubmissao }) => {
  const classes: Record<StatusSubmissao, string> = {
    pendente: "bg-amber-100 text-amber-800 border-amber-200",
    aprovado: "bg-green-100 text-green-800 border-green-200",
    rejeitado: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <Badge variant="outline" className={classes[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
};

/** Renderiza um link enviado por usuário de forma segura (só http/https, sem opener). */
const LinkSeguro = ({ url }: { url: string }) => {
  if (!linkValido(url)) return <span className="text-red-600 break-all">{url} (link inválido)</span>;
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    host = "";
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-[#5f2ebe] underline break-all">
      {url}
      {host && <span className="ml-1 text-xs text-gray-500">({host})</span>}
    </a>
  );
};

const ValorCampo = ({ chave, valor }: { chave: string; valor: unknown }) => {
  if (chave.endsWith("_url") && typeof valor === "string") {
    const partes = valor.split(",").map((p) => p.trim()).filter(Boolean);
    const alertaVideo =
      chave === "video_url" &&
      partes.some((p) => {
        try {
          return !DOMINIOS_VIDEO.includes(new URL(p).hostname);
        } catch {
          return true;
        }
      });
    return (
      <div className="space-y-1">
        {partes.map((p) => (
          <div key={p}>
            <LinkSeguro url={p} />
          </div>
        ))}
        {alertaVideo && (
          <p className="text-xs text-amber-700">Atenção: o vídeo não é do YouTube/Vimeo. Confira o link antes de aprovar.</p>
        )}
      </div>
    );
  }
  if (Array.isArray(valor)) return <span className="break-all">{valor.join(", ")}</span>;
  if (typeof valor === "boolean") return <span>{valor ? "Sim" : "Não"}</span>;
  return <span className="whitespace-pre-wrap break-words">{String(valor)}</span>;
};

interface SubmissaoDetalhesProps {
  submissao: Submissao;
  nomeAutor?: string;
}

export const SubmissaoDetalhes = ({ submissao, nomeAutor }: SubmissaoDetalhesProps) => {
  const [filhosPublicados, setFilhosPublicados] = useState<{ id: string; titulo: string }[]>([]);
  const [filhosEnviados, setFilhosEnviados] = useState<Submissao[]>([]);
  const [destinoTitulo, setDestinoTitulo] = useState<string | null>(null);

  const tipoFilho = TIPO_FILHO[submissao.tipo];
  const tipoDestino = TIPO_DESTINO[submissao.tipo];

  useEffect(() => {
    if (tipoFilho) {
      buscarItensPublicadosPorIds(tipoFilho, submissao.itens_ids || []).then(setFilhosPublicados).catch(console.error);
      buscarSubmissoesPorIds(submissao.itens_submissao_ids || []).then(setFilhosEnviados).catch(console.error);
    }
    if (tipoDestino && submissao.destino_id) {
      buscarItensPublicadosPorIds(tipoDestino, [submissao.destino_id])
        .then((r) => setDestinoTitulo(r[0]?.titulo || "(item removido)"))
        .catch(console.error);
    } else {
      setDestinoTitulo(null);
    }
  }, [submissao.id, submissao.updated_at, tipoFilho, tipoDestino]);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Badge variant="secondary">{TIPO_LABEL[submissao.tipo]}</Badge>
        <StatusBadge status={submissao.status} />
        {nomeAutor && <span>por {nomeAutor}</span>}
        <span>enviado em {new Date(submissao.created_at).toLocaleString("pt-BR")}</span>
      </div>

      {submissao.descricao && <p className="whitespace-pre-wrap break-words text-gray-700">{submissao.descricao}</p>}

      {Object.keys(submissao.dados || {}).length > 0 && (
        <dl className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4 gap-y-2">
          {Object.entries(submissao.dados).map(([chave, valor]) => (
            <div key={chave} className="contents">
              <dt className="font-medium text-gray-600">{ROTULOS[chave] || chave}</dt>
              <dd>
                <ValorCampo chave={chave} valor={valor} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {tipoFilho && (
        <div>
          <p className="font-medium text-gray-600 mb-1">{TIPO_LABEL[tipoFilho]}s incluídos</p>
          <ul className="list-disc pl-5 space-y-1">
            {filhosPublicados.map((f) => (
              <li key={f.id}>{f.titulo} <span className="text-xs text-gray-500">(já publicado)</span></li>
            ))}
            {filhosEnviados.map((f) => (
              <li key={f.id}>
                {f.titulo} <span className="text-xs text-gray-500">(envio do autor:</span>{" "}
                <span className="text-xs">{STATUS_LABEL[f.status].toLowerCase()})</span>
              </li>
            ))}
            {(submissao.itens_submissao_ids || []).length > filhosEnviados.length && (
              <li className="text-xs text-gray-500">Alguns envios vinculados foram excluídos pelo autor e serão ignorados.</li>
            )}
          </ul>
        </div>
      )}

      {tipoDestino && destinoTitulo && (
        <p>
          <span className="font-medium text-gray-600">Incluir em {TIPO_LABEL[tipoDestino].toLowerCase()}:</span> {destinoTitulo}
        </p>
      )}

      {submissao.status === "rejeitado" && submissao.motivo_rejeicao && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
          <p className="font-medium">Motivo da rejeição</p>
          <p className="whitespace-pre-wrap break-words">{submissao.motivo_rejeicao}</p>
        </div>
      )}
    </div>
  );
};
