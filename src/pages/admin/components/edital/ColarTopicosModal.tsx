import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ColarTopicosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDistribuirTopicos: (topicos: string[]) => void;
}

export const ColarTopicosModal: React.FC<ColarTopicosModalProps> = ({
  isOpen,
  onClose,
  onDistribuirTopicos
}) => {
  const [texto, setTexto] = useState("");
  const { toast } = useToast();

  const processarTexto = (textoOriginal: string): string => {
    // Remove quebras de linha desnecessárias que quebram palavras
    let textoProcessado = textoOriginal
      // Remove quebras de linha que estão no meio de palavras
      .replace(/(\w)\s*\n\s*(\w)/g, '$1 $2')
      // Remove múltiplas quebras de linha e espaços em excesso
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textoProcessado;
  };

  const detectarESepararTopicos = (texto: string): string[] => {
    let topicos: string[] = [];
    
    // Padrão 1: Números seguidos de ponto e espaço (1. Tópico, 2. Tópico)
    if (texto.match(/\d+\.\s+/)) {
      topicos = texto
        .split(/\d+\.\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }
    // Padrão 2: Números seguidos de espaço (1 Tópico 2 Tópico)
    else if (texto.match(/\d+\s+[A-Za-zÀ-ÿ]/)) {
      topicos = texto
        .split(/(?=\d+\s+[A-Za-zÀ-ÿ])/)
        .map(t => t.replace(/^\d+\s+/, '').trim())
        .filter(t => t.length > 0);
    }
    // Padrão 3: Separação por ponto e vírgula
    else if (texto.includes(';')) {
      topicos = texto
        .split(/;/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        // Remove numeração no início se existir
        .map(t => t.replace(/^\d+\.?\s*/, ''));
    }
    // Padrão 4: Separação por pontos finais seguidos de espaço
    else if (texto.match(/\.\s+[A-Za-zÀ-ÿ]/)) {
      topicos = texto
        .split(/\.\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        // Remove numeração no início se existir
        .map(t => t.replace(/^\d+\.?\s*/, ''));
    }
    // Padrão 5: Fallback - tenta detectar por pontos finais
    else {
      topicos = texto
        .split(/\.\s*/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        // Remove numeração no início se existir
        .map(t => t.replace(/^\d+\.?\s*/, ''));
    }
    
    // Limpa pontos finais desnecessários no final de cada tópico
    topicos = topicos.map(t => t.replace(/\.+$/, '').trim());
    
    return topicos.filter(t => t.length > 0);
  };

  const handleDistribuirTopicos = () => {
    if (!texto.trim()) {
      toast({
        title: "Atenção",
        description: "Digite ou cole o texto dos tópicos.",
        variant: "destructive"
      });
      return;
    }

    // Processa o texto removendo quebras de linha desnecessárias
    const textoProcessado = processarTexto(texto);
    
    // Detecta e separa os tópicos usando diferentes padrões
    const topicos = detectarESepararTopicos(textoProcessado);

    if (topicos.length === 0) {
      toast({
        title: "Atenção",
        description: "Nenhum tópico encontrado no texto. Verifique o formato dos tópicos.",
        variant: "destructive"
      });
      return;
    }

    onDistribuirTopicos(topicos);
    setTexto("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Colar Tópicos</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Cole aqui o texto dos tópicos..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-[200px]"
          />
          <p className="text-sm text-gray-500 mt-2">
            Os tópicos serão detectados automaticamente. Formatos suportados:<br/>
            • Numerados com ponto: "1. Tópico 2. Tópico"<br/>
            • Numerados sem ponto: "1 Tópico 2 Tópico"<br/>
            • Separados por ponto e vírgula: "Tópico; Tópico;"<br/>
            • Separados por pontos: "Tópico. Tópico."
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleDistribuirTopicos}>
            Distribuir Tópicos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};