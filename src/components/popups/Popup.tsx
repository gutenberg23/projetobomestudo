import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popup as PopupType } from "@/types/popup";

interface PopupProps {
  popup: PopupType;
  onClose: () => void;
  onDismiss: (popupId: string) => void;
}

const Popup = ({ popup, onClose, onDismiss }: PopupProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = () => {
    if (dontShowAgain && popup.id) {
      onDismiss(popup.id);
    }
    onClose();
  };

  const handleLinkClick = () => {
    if (popup.link_destino) {
      window.open(popup.link_destino, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{popup.titulo}</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {popup.imagem_url && (
            <div className="mb-4">
              <img 
                src={popup.imagem_url} 
                alt={popup.titulo}
                className="w-full rounded-md"
              />
            </div>
          )}
          
          {popup.conteudo && (
            <div 
              className="prose prose-sm max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: popup.conteudo }}
            />
          )}
          
          {popup.link_destino && (
            <Button 
              onClick={handleLinkClick}
              className="w-full mb-4 flex items-center justify-center gap-2"
            >
              Saiba mais
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <Label htmlFor="dont-show-again" className="text-sm">
              Não mostrar novamente
            </Label>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button onClick={handleDismiss}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;