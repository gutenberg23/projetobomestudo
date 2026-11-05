import React from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/utils/sanitize-html";
import { temHtml } from "@/lib/flashcards";

/**
 * Mostra a frente ou o verso de um flashcard. Texto simples mantém as quebras
 * de linha; cartões com HTML (exportados do Anki) passam pela sanitização.
 */
export const ConteudoCartao: React.FC<{ texto: string; className?: string }> = ({ texto, className }) =>
  temHtml(texto) ? (
    <div
      className={cn("conteudo-cartao break-words [&_img]:mx-auto [&_img]:max-h-64 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(texto) }}
    />
  ) : (
    <div className={cn("whitespace-pre-wrap break-words", className)}>{texto}</div>
  );
