import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popup as PopupType } from "@/types/popup";
import { sanitizeHtml } from "@/utils/sanitize-html";
import { cn } from "@/lib/utils";

/** Texto simples vira parágrafos; HTML é usado como está (depois de limpo). */
const paraHtml = (conteudo: string) => {
  if (/<[a-z][\s\S]*>/i.test(conteudo)) return conteudo;
  const esc = conteudo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
};

const ehExterno = (url: string) => /^https?:\/\//i.test(url) && !url.includes(window.location.host);

interface CartaoPopupProps {
  popup: Pick<PopupType, "titulo" | "conteudo" | "imagem_url" | "link_destino">;
  /** Chamado ao clicar no botão/link (para registrar o fechamento) */
  onAbrirLink?: () => void;
  naoMostrar?: boolean;
  onNaoMostrar?: (v: boolean) => void;
  onFechar?: () => void;
  /** Prévia no admin: sem Dialog e sem links clicáveis */
  previa?: boolean;
}

/** Corpo visual do popup (usado no site e na prévia do admin). */
export const CartaoPopup = ({ popup, onAbrirLink, naoMostrar, onNaoMostrar, onFechar, previa }: CartaoPopupProps) => {
  const link = popup.link_destino || "";
  const externo = !!link && !previa && ehExterno(link);
  const Titulo = previa ? "h3" : DialogTitle;
  const Descricao = previa ? "div" : DialogDescription;
  const imagem = popup.imagem_url ? (
    <img src={popup.imagem_url} alt="" className="block max-h-[55vh] w-full bg-slate-100 object-cover" />
  ) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white">
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className={cn(
            "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5f2ebe]/50",
            imagem ? "bg-black/45 text-white hover:bg-black/60" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {imagem &&
        (link && !previa ? (
          <a href={link} target={externo ? "_blank" : undefined} rel={externo ? "noopener noreferrer" : undefined} onClick={onAbrirLink} tabIndex={-1}>
            {imagem}
          </a>
        ) : (
          imagem
        ))}

      <div className="space-y-3 px-5 pb-5 pt-4 sm:px-6">
        <Titulo className={cn("pr-8 text-lg font-bold leading-snug text-slate-900", imagem && "pr-0")}>{popup.titulo || "Título do popup"}</Titulo>
        {popup.conteudo ? (
          <Descricao
            className="prose prose-sm max-w-none text-slate-600 prose-a:text-[#5f2ebe] prose-p:my-1.5"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(paraHtml(popup.conteudo)) }}
          />
        ) : (
          !previa && <Descricao className="sr-only">{popup.titulo}</Descricao>
        )}

        {link && (
          <a
            href={previa ? undefined : link}
            target={externo ? "_blank" : undefined}
            rel={externo ? "noopener noreferrer" : undefined}
            onClick={onAbrirLink}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ea2be2] text-sm font-semibold text-white transition-colors hover:bg-[#d029d5]"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </a>
        )}

        {onNaoMostrar && (
          <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={!!naoMostrar}
              onChange={(e) => onNaoMostrar(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-[#5f2ebe]"
            />
            Não mostrar novamente
          </label>
        )}
      </div>
    </div>
  );
};

interface PopupProps {
  popup: PopupType;
  onFechar: (paraSempre: boolean) => void;
}

/** Popup do site, em janela modal. */
const Popup = ({ popup, onFechar }: PopupProps) => {
  const [naoMostrar, setNaoMostrar] = useState(false);
  const fechar = () => onFechar(naoMostrar);

  return (
    <Dialog open onOpenChange={(o) => !o && fechar()}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[90vh] max-w-md gap-0 overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl [&>button:last-child]:hidden">
        <CartaoPopup
          popup={popup}
          naoMostrar={naoMostrar}
          onNaoMostrar={setNaoMostrar}
          onFechar={fechar}
          onAbrirLink={() => onFechar(naoMostrar)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Popup;
