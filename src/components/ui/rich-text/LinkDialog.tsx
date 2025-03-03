
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinkDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (url: string, text: string) => void;
  initialUrl?: string;
  initialText?: string;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  setIsOpen,
  onConfirm,
  initialUrl = "",
  initialText = ""
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  const handleConfirm = () => {
    if (url.trim()) {
      onConfirm(url, text);
      setIsOpen(false);
      // Reset form
      setUrl("");
      setText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="text" className="text-sm font-medium text-[#272f3c]">
              Texto do Link
            </label>
            <Input
              id="text"
              placeholder="Texto para exibir"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-[#272f3c]">
              URL
            </label>
            <Input
              id="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white">
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;
