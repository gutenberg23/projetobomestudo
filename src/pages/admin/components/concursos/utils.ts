import { Cargo, Concurso, Estado, NivelEnsino } from "@/types/concurso";

export const UFS: Estado[] = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

export const REGIOES_UF: { nome: string; ufs: Estado[] }[] = [
  { nome: "Norte", ufs: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"] },
  { nome: "Nordeste", ufs: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"] },
  { nome: "Centro-Oeste", ufs: ["DF", "GO", "MS", "MT"] },
  { nome: "Sudeste", ufs: ["ES", "MG", "RJ", "SP"] },
  { nome: "Sul", ufs: ["PR", "RS", "SC"] },
];

export const NIVEIS: NivelEnsino[] = ["Ensino Fundamental", "Ensino Médio", "Ensino Superior"];
export const NIVEL_CURTO: Record<NivelEnsino, string> = {
  "Ensino Fundamental": "Fundamental",
  "Ensino Médio": "Médio",
  "Ensino Superior": "Superior",
};

export type StatusConcurso = "aberto" | "em-breve" | "encerrado";

/** Data "AAAA-MM-DD" (ou ISO) como data local, sem o fuso jogar para o dia anterior. */
export function paraData(valor?: string | null): Date | null {
  if (!valor) return null;
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function statusConcurso(c: Pick<Concurso, "dataInicioInscricao" | "dataFimInscricao">, hoje = new Date()): StatusConcurso {
  const dia = inicioDoDia(hoje);
  const inicio = paraData(c.dataInicioInscricao);
  const fim = paraData(c.dataFimInscricao);
  if (fim && fim < dia) return "encerrado";
  if (inicio && inicio > dia) return "em-breve";
  return "aberto";
}

/** Dias até a data (0 = hoje). */
export function diasAte(valor?: string | null, hoje = new Date()): number | null {
  const d = paraData(valor);
  if (!d) return null;
  return Math.round((d.getTime() - inicioDoDia(hoje).getTime()) / 86_400_000);
}

export function dataCurta(valor?: string | null): string {
  const d = paraData(valor);
  return d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "") : "—";
}

export function dataCompleta(valor?: string | null): string {
  const d = paraData(valor);
  return d ? d.toLocaleDateString("pt-BR") : "—";
}

export const nomeCargo = (c: Cargo) => (typeof c === "string" ? c : c.nome);

/** Data no formato do <input type="date">. */
export function paraInputData(valor?: string | null): string {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const d = paraData(valor);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
