
import { toast } from "sonner";

export const useClipboardActions = () => {
  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error('Erro ao copiar: ', err);
        toast.error("Erro ao copiar texto");
      });
  };

  return {
    copyToClipboard,
  };
};
