import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Gráfico de rosca em dois anéis (sunburst), feito em SVG puro.
 * Anel de dentro: assuntos. Anel de fora: tópicos de cada assunto.
 * O tamanho de cada fatia é proporcional ao número de questões.
 */

export interface FatiaSunburst {
  id: string;
  nome: string;
  valor: number;
  cor: string;
  /** Fatias sem clique (ex.: "Sem assunto") */
  inerte?: boolean;
  filhos?: FatiaSunburst[];
}

interface Props {
  fatias: FatiaSunburst[];
  /** Fatia em destaque (hover ou seleção); as outras ficam apagadas */
  destaque: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  /** Conteúdo do miolo */
  centro: React.ReactNode;
  /** Clique no miolo (ex.: voltar do zoom) */
  onClickCentro?: () => void;
  rotulo: string;
  className?: string;
}

const TAM = 400;
const C = TAM / 2;
const R_MIOLO = 104;
const R_MEIO = 150;
const R_FORA = 194;
const FOLGA = 3; // espaço entre os anéis
const TAU = Math.PI * 2;

const ponto = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)];

/** Caminho de um pedaço de anel entre os ângulos a0 e a1 (0 = topo, sentido horário). */
function arco(r0: number, r1: number, a0: number, a1: number) {
  if (a1 - a0 >= TAU - 1e-6) {
    // Anel completo: duas metades para o SVG desenhar
    return `${arco(r0, r1, 0, Math.PI)} ${arco(r0, r1, Math.PI, TAU)}`;
  }
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = ponto(r1, a0);
  const [x1, y1] = ponto(r1, a1);
  const [x2, y2] = ponto(r0, a1);
  const [x3, y3] = ponto(r0, a0);
  return [
    `M${x0.toFixed(2)},${y0.toFixed(2)}`,
    `A${r1},${r1} 0 ${grande} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`,
    `L${x2.toFixed(2)},${y2.toFixed(2)}`,
    `A${r0},${r0} 0 ${grande} 0 ${x3.toFixed(2)},${y3.toFixed(2)}`,
    "Z",
  ].join(" ");
}

interface Arco {
  id: string;
  paiId: string | null;
  nome: string;
  cor: string;
  inerte: boolean;
  d: string;
}

export const Sunburst: React.FC<Props> = ({ fatias, destaque, onHover, onClick, centro, onClickCentro, rotulo, className }) => {
  const temFilhos = fatias.some((f) => f.filhos && f.filhos.length > 0);

  const arcos = useMemo(() => {
    const lista: Arco[] = [];
    const soma = fatias.reduce((s, f) => s + Math.max(0, f.valor), 0);
    if (soma <= 0) return lista;
    // Sem anel de fora, o anel de dentro ocupa a rosca toda
    const rInterno0 = R_MIOLO;
    const rInterno1 = temFilhos ? R_MEIO : R_FORA;
    let a = 0;
    fatias.forEach((f) => {
      const span = (Math.max(0, f.valor) / soma) * TAU;
      if (span <= 0) return;
      lista.push({ id: f.id, paiId: null, nome: f.nome, cor: f.cor, inerte: !!f.inerte, d: arco(rInterno0, rInterno1, a, a + span) });
      const filhos = (f.filhos || []).filter((x) => x.valor > 0);
      const somaFilhos = filhos.reduce((s, x) => s + x.valor, 0);
      // Se os tópicos somam mais que o assunto (questão com vários tópicos), encolhe para caber
      const escala = somaFilhos > f.valor && somaFilhos > 0 ? f.valor / somaFilhos : 1;
      let b = a;
      filhos.forEach((x) => {
        const s = (x.valor * escala / soma) * TAU;
        lista.push({ id: x.id, paiId: f.id, nome: x.nome, cor: x.cor, inerte: !!x.inerte, d: arco(R_MEIO + FOLGA, R_FORA, b, b + s) });
        b += s;
      });
      a += span;
    });
    return lista;
  }, [fatias, temFilhos]);

  const aceso = (arc: Arco) => {
    if (!destaque) return true;
    if (arc.id === destaque) return true;
    // O assunto acende junto com o tópico em destaque, e os tópicos junto com o assunto
    const alvo = arcos.find((x) => x.id === destaque);
    return arc.paiId === destaque || (alvo?.paiId != null && alvo.paiId === arc.id);
  };

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[480px]", className)}>
      <svg viewBox={`0 0 ${TAM} ${TAM}`} className="h-full w-full" role="img" aria-label={rotulo} onMouseLeave={() => onHover(null)}>
        <title>{rotulo}</title>
        {arcos.map((arc) => (
          <path
            key={arc.id}
            d={arc.d}
            fill={arc.cor}
            stroke="#fff"
            strokeWidth={2}
            strokeLinejoin="round"
            className={cn("transition-opacity duration-150", !arc.inerte && "cursor-pointer")}
            style={{ opacity: aceso(arc) ? 1 : 0.28 }}
            onMouseEnter={() => onHover(arc.id)}
            onClick={() => !arc.inerte && onClick(arc.id)}
          >
            <title>{arc.nome}</title>
          </path>
        ))}
      </svg>
      {/* Miolo: texto do destaque. Fica por cima do SVG, no buraco da rosca. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={onClickCentro}
          disabled={!onClickCentro}
          className={cn(
            "flex aspect-square w-[46%] flex-col items-center justify-center rounded-full px-3 text-center",
            onClickCentro ? "pointer-events-auto cursor-pointer hover:bg-slate-50" : "pointer-events-none"
          )}
        >
          {centro}
        </button>
      </div>
    </div>
  );
};
