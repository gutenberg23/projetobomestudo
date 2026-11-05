/**
 * Teorias abertas recentemente pelo aluno. Ficam só no navegador
 * (localStorage), como os grifos, e servem para o "Continue de onde parou"
 * da lista /teorias.
 */
const CHAVE = "bomestudo:teorias-recentes";
const LIMITE = 12;

export interface LeituraRecente {
  id: string;
  em: number;
}

export const lerRecentes = (): LeituraRecente[] => {
  try {
    const bruto = localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((i) => i && typeof i.id === "string" && typeof i.em === "number") : [];
  } catch {
    return [];
  }
};

export const registrarLeitura = (id: string) => {
  try {
    const lista = [{ id, em: Date.now() }, ...lerRecentes().filter((i) => i.id !== id)].slice(0, LIMITE);
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* navegador sem localStorage: ignora */
  }
};

/** Quantos grifos o aluno tem em cada teoria (lidos das chaves dos grifos). */
export const contarGrifos = (ids: string[]): Record<string, number> => {
  const mapa: Record<string, number> = {};
  try {
    ids.forEach((id) => {
      const bruto = localStorage.getItem(`bomestudo:teoria-marcacoes:${id}`);
      if (!bruto) return;
      const lista = JSON.parse(bruto);
      if (Array.isArray(lista) && lista.length) mapa[id] = lista.length;
    });
  } catch {
    /* ignora */
  }
  return mapa;
};
