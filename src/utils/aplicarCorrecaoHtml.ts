/**
 * Aplica uma correção de texto dentro do HTML de uma teoria.
 *
 * O usuário seleciona o trecho na página já renderizada, então o que temos é
 * texto puro (sem tags). Aqui percorremos os nós de texto do HTML, achamos o
 * trecho ignorando diferenças de espaços/quebras de linha e trocamos pelo texto
 * corrigido. O texto corrigido entra como nó de texto, nunca como HTML, então
 * não há risco de injetar marcação.
 *
 * Se o trecho atravessar formatações (ex.: parte em negrito), a formatação do
 * pedaço substituído é perdida, mas o restante do documento fica intacto.
 */

export type ResultadoCorrecao =
  | { ok: true; html: string }
  | { ok: false; motivo: "nao_encontrado" | "ambiguo"; ocorrencias: number };

const ESPACO = /[\s\u00a0\u200b]/;

export const normalizarTrecho = (texto: string) =>
  texto.normalize("NFC").replace(/[\s\u00a0\u200b]+/g, " ").trim();

const BLOCOS = new Set([
  "P", "DIV", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "TD", "TH", "TR",
  "BLOCKQUOTE", "PRE", "UL", "OL", "TABLE", "SECTION", "ARTICLE", "FIGCAPTION",
]);

const blocoDe = (no: Node): Element | null => {
  let atual = no.parentElement;
  while (atual && !BLOCOS.has(atual.tagName)) atual = atual.parentElement;
  return atual;
};

interface Posicao {
  no: number;
  offset: number;
}

export const aplicarCorrecaoHtml = (
  html: string,
  trechoOriginal: string,
  trechoCorrigido: string
): ResultadoCorrecao => {
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, "text/html");
  const corpo = doc.body;

  const nos: Text[] = [];
  const walker = doc.createTreeWalker(corpo, NodeFilter.SHOW_TEXT);
  let atual = walker.nextNode();
  while (atual) {
    nos.push(atual as Text);
    atual = walker.nextNode();
  }

  // Texto normalizado + mapa de cada caractere normalizado para o nó/offset original
  let texto = "";
  const mapa: Posicao[] = [];
  let ultimoEspaco = true; // ignora espaços no início
  let blocoAnterior: Element | null | undefined;
  nos.forEach((no, indice) => {
    const dados = no.data;
    // Na seleção do navegador, parágrafos/itens diferentes vêm separados por
    // quebra de linha; no HTML pode não haver espaço nenhum entre eles.
    const bloco = blocoDe(no);
    if (blocoAnterior !== undefined && bloco !== blocoAnterior && !ultimoEspaco) {
      texto += " ";
      mapa.push({ no: indice, offset: 0 });
      ultimoEspaco = true;
    }
    blocoAnterior = bloco;
    for (let i = 0; i < dados.length; i++) {
      const c = dados[i];
      if (ESPACO.test(c)) {
        if (!ultimoEspaco) {
          texto += " ";
          mapa.push({ no: indice, offset: i });
          ultimoEspaco = true;
        }
      } else {
        texto += c;
        mapa.push({ no: indice, offset: i });
        ultimoEspaco = false;
      }
    }
  });

  const alvo = normalizarTrecho(trechoOriginal);
  if (!alvo) return { ok: false, motivo: "nao_encontrado", ocorrencias: 0 };

  const ocorrencias: number[] = [];
  let pos = texto.indexOf(alvo);
  while (pos !== -1) {
    ocorrencias.push(pos);
    pos = texto.indexOf(alvo, pos + 1);
  }
  if (ocorrencias.length === 0) return { ok: false, motivo: "nao_encontrado", ocorrencias: 0 };
  if (ocorrencias.length > 1) return { ok: false, motivo: "ambiguo", ocorrencias: ocorrencias.length };

  const inicio = mapa[ocorrencias[0]];
  const ultimo = mapa[ocorrencias[0] + alvo.length - 1];
  const fim: Posicao = { no: ultimo.no, offset: ultimo.offset + 1 };
  const novoTexto = trechoCorrigido.trim();

  if (inicio.no === fim.no) {
    const no = nos[inicio.no];
    no.data = no.data.slice(0, inicio.offset) + novoTexto + no.data.slice(fim.offset);
  } else {
    const primeiro = nos[inicio.no];
    primeiro.data = primeiro.data.slice(0, inicio.offset) + novoTexto;
    for (let i = inicio.no + 1; i < fim.no; i++) nos[i].data = "";
    const ultimoNo = nos[fim.no];
    ultimoNo.data = ultimoNo.data.slice(fim.offset);
  }

  return { ok: true, html: corpo.innerHTML };
};
