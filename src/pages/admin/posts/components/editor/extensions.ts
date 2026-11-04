import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

/** Tamanho de fonte como estilo inline (<span style="font-size: 18px">). */
export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// Estilos que costumam vir ao colar de Word, Google Docs ou de outros sites e
// deixam o post com fontes e espaçamentos diferentes do resto do blog.
const ESTILOS_DESCARTADOS = /^(font-family|font-size|line-height|margin.*|padding.*|text-indent|white-space|letter-spacing|word-spacing|mso-.*|font-variant.*|vertical-align|width|height|min-width|max-width)$/i;
const COR_PADRAO = /^(rgb\(0,\s*0,\s*0\)|#000(000)?|black|windowtext|inherit|initial)$/i;

/**
 * Limpa o HTML colado: remove fontes, tamanhos e espaçamentos fixos, classes
 * e ids, mantendo negrito, links, listas, títulos e tabelas.
 */
export function limparHtmlColado(html: string): string {
  if (typeof window === "undefined" || !html) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, meta, link, script, o\\:p, xml").forEach((n) => n.remove());
  // Google Docs embrulha tudo em <b id="docs-internal-guid-..." style="font-weight:normal">
  doc.body.querySelectorAll('b[id^="docs-internal-guid"]').forEach((b) => {
    b.replaceWith(...Array.from(b.childNodes));
  });
  doc.body.querySelectorAll("*").forEach((el) => {
    el.removeAttribute("class");
    el.removeAttribute("id");
    el.removeAttribute("lang");
    el.removeAttribute("dir");
    if (el instanceof HTMLTableElement || el instanceof HTMLTableCellElement) {
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.removeAttribute("bgcolor");
      el.removeAttribute("border");
      el.removeAttribute("cellpadding");
      el.removeAttribute("cellspacing");
    }
    const style = el.getAttribute("style");
    if (!style) return;
    const mantidos = style
      .split(";")
      .map((r) => r.trim())
      .filter(Boolean)
      .filter((regra) => {
        const [prop, ...resto] = regra.split(":");
        const valor = resto.join(":").trim();
        const nome = prop.trim();
        if (ESTILOS_DESCARTADOS.test(nome)) return false;
        if ((nome === "color" || nome === "background-color" || nome === "background") && (COR_PADRAO.test(valor) || /transparent|rgb\(255,\s*255,\s*255\)|#fff(fff)?/i.test(valor))) return false;
        return true;
      });
    if (mantidos.length) el.setAttribute("style", mantidos.join("; "));
    else el.removeAttribute("style");
  });
  return doc.body.innerHTML;
}
