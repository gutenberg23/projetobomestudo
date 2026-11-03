import DOMPurify from "dompurify";

/**
 * Sanitização de HTML antes de renderizar com dangerouslySetInnerHTML.
 *
 * Remove <script>, handlers de eventos (onerror, onclick...), URLs
 * "javascript:" e demais vetores de XSS, preservando a formatação usada
 * pelo editor (negrito, listas, tabelas, imagens, links, estilos inline).
 *
 * Iframes só são mantidos quando apontam para provedores de vídeo
 * conhecidos (YouTube/Vimeo).
 */

const ALLOWED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

let hooksRegistered = false;

const registerHooks = () => {
  if (hooksRegistered || typeof window === "undefined") return;
  hooksRegistered = true;

  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const el = node as Element;
    const src = el.getAttribute("src") || "";
    try {
      const url = new URL(src, window.location.origin);
      if (url.protocol === "https:" && ALLOWED_IFRAME_HOSTS.includes(url.hostname)) {
        return;
      }
    } catch {
      // URL inválida: remover
    }
    el.parentNode?.removeChild(el);
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    // Links que abrem em nova aba não podem dar acesso a window.opener
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
};

export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    // Sem DOM (SSR/scripts): não há como sanitizar com segurança, então escapa tudo.
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  registerHooks();
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder"],
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
  });
};
