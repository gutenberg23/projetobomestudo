import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** ISO (UTC) → valor de <input type="datetime-local"> no fuso do navegador. */
export const paraInputLocal = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
};

/** Valor de <input type="datetime-local"> (hora local) → ISO (UTC). */
export const deInputLocal = (valor: string) => {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

export type SituacaoVeiculacao = "no_ar" | "agendado" | "pausado" | "encerrado";

export const situacaoVeiculacao = (
  item: { ativo?: boolean | null; data_inicio: string; data_fim: string },
  agora = Date.now()
): SituacaoVeiculacao => {
  const fim = new Date(item.data_fim).getTime();
  if (fim < agora) return "encerrado";
  if (item.ativo !== true) return "pausado";
  if (new Date(item.data_inicio).getTime() > agora) return "agendado";
  return "no_ar";
};

export const ROTULO_SITUACAO: Record<SituacaoVeiculacao, string> = {
  no_ar: "No ar",
  agendado: "Agendado",
  pausado: "Pausado",
  encerrado: "Encerrado",
};

export const TOM_SITUACAO = {
  no_ar: "verde",
  agendado: "azul",
  pausado: "cinza",
  encerrado: "ambar",
} as const;

const curta = (d: Date) => format(d, d.getFullYear() === new Date().getFullYear() ? "dd MMM, HH:mm" : "dd MMM yyyy", { locale: ptBR });

/** "05 nov, 10:00 → 12 nov, 23:59" */
export const textoPeriodo = (inicio: string, fim: string) => `${curta(new Date(inicio))} → ${curta(new Date(fim))}`;

/** Frase curta sobre quando começa/termina. */
export const textoPrazo = (item: { ativo?: boolean | null; data_inicio: string; data_fim: string }) => {
  const s = situacaoVeiculacao(item);
  const hoje = new Date();
  if (s === "encerrado") {
    const d = differenceInCalendarDays(hoje, new Date(item.data_fim));
    return d === 0 ? "terminou hoje" : `terminou há ${d} dia${d === 1 ? "" : "s"}`;
  }
  if (s === "agendado") {
    const d = differenceInCalendarDays(new Date(item.data_inicio), hoje);
    return d === 0 ? "começa hoje" : `começa em ${d} dia${d === 1 ? "" : "s"}`;
  }
  const d = differenceInCalendarDays(new Date(item.data_fim), hoje);
  if (d > 3650) return "sem data para terminar";
  return d === 0 ? "termina hoje" : `termina em ${d} dia${d === 1 ? "" : "s"}`;
};

/** Atalhos de duração a partir do início. */
export const DURACOES = [
  { rotulo: "7 dias", dias: 7 },
  { rotulo: "15 dias", dias: 15 },
  { rotulo: "30 dias", dias: 30 },
  { rotulo: "90 dias", dias: 90 },
  { rotulo: "Sem fim", dias: 3650 * 3 },
];

export const somarDias = (iso: string, dias: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
};
