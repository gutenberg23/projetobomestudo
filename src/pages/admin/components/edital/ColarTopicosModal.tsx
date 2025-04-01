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

  const handleDistribuirTopicos = () => {
    if (!texto.trim()) {
      toast({
        title: "Atenção",
        description: "Digite ou cole o texto dos tópicos.",
        variant: "destructive"
      });
      return;
    }

    // Dividir o texto em tópicos baseado em pontos finais seguidos de espaço
    const topicos = texto
      .split(/\.\s+/)
      .map(topico => topico.trim())
      .filter(topico => topico.length > 0);

    if (topicos.length === 0) {
      toast({
        title: "Atenção",
        description: "Nenhum tópico encontrado no texto. Verifique se os tópicos estão separados por pontos.",
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
            Os tópicos serão separados automaticamente quando houver um ponto seguido de espaço.
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