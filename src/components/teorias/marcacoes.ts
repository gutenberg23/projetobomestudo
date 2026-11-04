/**
 * Marcações (grifos) do aluno no texto da teoria.
 *
 * Ficam só no navegador do aluno (localStorage), por teoria. Cada grifo guarda o
 * texto marcado; ao abrir a aula de novo, o trecho é procurado no texto e
 * grifado outra vez. Se a teoria mudar e o trecho sumir, o grifo continua na
 * lista, marcado como "não encontrado".
 */

export interface Marcacao {
  id: string;
  texto: string;
  cor: string;
  nota?: string;
  criadaEm: string;
}

export const CORES_MARCACAO = [
  { nome: "Amarelo", valor: "#FFF3A3" },
  { nome: "Verde", valor: "#C8F0CF" },
  { nome: "Azul", valor: "#CFE6FF" },
  { nome: "Rosa", valor: "#FFD3E6" },
  { nome: "Lilás", valor: "#E3D7FF" },
];

const chave = (teoriaId: string) => `bomestudo:teoria-marcacoes:${teoriaId}`;

export const lerMarcacoes = (teoriaId: string): Marcacao[] => {
  try {
    const bruto = localStorage.getItem(chave(teoriaId));
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((m) => m && typeof m.texto === "string") : [];
  } catch {
    return [];
  }
};

export const gravarMarcacoes = (teoriaId: string, lista: Marcacao[]) => {
  try {
    if (lista.length) localStorage.setItem(chave(teoriaId), JSON.stringify(lista));
    else localStorage.removeItem(chave(teoriaId));
  } catch {
    /* navegador sem armazenamento: os grifos valem só nesta visita */
  }
};

export const normalizarEspacos = (s: string) => s.replace(/[\s\u00a0]+/g, " ").trim();

/** Nós de texto visíveis dentro do container (ignora questões embutidas e o que já é interface). */
const nosDeTexto = (container: HTMLElement): Text[] => {
  const nos: Text[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const pai = (n as Text).parentElement;
      if (!pai || pai.closest("[data-sem-marcacao], script, style, button, input, textarea")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) nos.push(walker.currentNode as Text);
  return nos;
};

/** Envolve cada pedaço de texto do intervalo num <mark>, sem quebrar a estrutura do HTML. */
export const grifarIntervalo = (container: HTMLElement, range: Range, marcacao: Marcacao): boolean => {
  const pedacos: { no: Text; inicio: number; fim: number }[] = [];
  for (const no of nosDeTexto(container)) {
    if (!range.intersectsNode(no)) continue;
    const inicio = no === range.startContainer ? range.startOffset : 0;
    const fim = no === range.endContainer ? range.endOffset : no.length;
    if (fim <= inicio || !no.data.slice(inicio, fim).trim()) continue;
    pedacos.push({ no, inicio, fim });
  }
  if (!pedacos.length) return false;

  for (const { no, inicio, fim } of pedacos) {
    let alvo = no;
    if (inicio > 0) alvo = alvo.splitText(inicio);
    if (fim - inicio < alvo.length) alvo.splitText(fim - inicio);
    const mark = document.createElement("mark");
    mark.className = "teoria-grifo";
    mark.dataset.marcacao = marcacao.id;
    mark.style.backgroundColor = marcacao.cor;
    if (marcacao.nota) mark.title = marcacao.nota;
    alvo.parentNode?.insertBefore(mark, alvo);
    mark.appendChild(alvo);
  }
  return true;
};

const blocoDe = (no: Node, container: HTMLElement): Element => {
  let el = no.parentElement;
  while (el && el !== container) {
    const d = getComputedStyle(el).display;
    if (d !== "inline" && d !== "contents") return el;
    el = el.parentElement;
  }
  return container;
};

/** Procura o texto (ignorando diferenças de espaços) e devolve o intervalo correspondente. */
export const localizarTexto = (container: HTMLElement, texto: string): Range | null => {
  const alvo = normalizarEspacos(texto);
  if (!alvo) return null;
  const nos = nosDeTexto(container);

  // Texto corrido normalizado, com o mapa de cada caractere para (nó, posição)
  let corrido = "";
  const mapa: { no: Text; pos: number }[] = [];
  let espacoAnterior = true;
  let blocoAnterior: Element | null = null;
  for (const no of nos) {
    const dados = no.data;
    // Blocos diferentes (parágrafos, células, itens) contam como separados por espaço
    const bloco = blocoDe(no, container);
    if (blocoAnterior && bloco !== blocoAnterior && !espacoAnterior) {
      corrido += " ";
      mapa.push({ no, pos: 0 });
      espacoAnterior = true;
    }
    blocoAnterior = bloco;
    for (let i = 0; i < dados.length; i++) {
      const c = dados[i];
      if (/[\s\u00a0]/.test(c)) {
        if (espacoAnterior) continue;
        corrido += " ";
        espacoAnterior = true;
      } else {
        corrido += c;
        espacoAnterior = false;
      }
      mapa.push({ no, pos: i });
    }
  }

  const i = corrido.indexOf(alvo);
  if (i < 0) return null;
  const ini = mapa[i];
  const fim = mapa[i + alvo.length - 1];
  if (!ini || !fim) return null;
  const range = document.createRange();
  range.setStart(ini.no, ini.pos);
  range.setEnd(fim.no, Math.min(fim.pos + 1, fim.no.length));
  return range;
};

export const removerGrifo = (container: HTMLElement, id: string) => {
  container.querySelectorAll<HTMLElement>(`mark[data-marcacao="${CSS.escape(id)}"]`).forEach((mark) => {
    const pai = mark.parentNode;
    if (!pai) return;
    while (mark.firstChild) pai.insertBefore(mark.firstChild, mark);
    pai.removeChild(mark);
    pai.normalize();
  });
};

export const atualizarGrifo = (container: HTMLElement, m: Marcacao) => {
  container.querySelectorAll<HTMLElement>(`mark[data-marcacao="${CSS.escape(m.id)}"]`).forEach((mark) => {
    mark.style.backgroundColor = m.cor;
    if (m.nota) mark.title = m.nota;
    else mark.removeAttribute("title");
  });
};

export const grifoExiste = (container: HTMLElement, id: string) =>
  !!container.querySelector(`mark[data-marcacao="${CSS.escape(id)}"]`);
