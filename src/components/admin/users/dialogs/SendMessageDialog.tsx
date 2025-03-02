
import React, { useState } from "react";
import { UserData } from "../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UserData | null;
  onSendMessage: () => void;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  open,
  onOpenChange,
  usuario,
  onSendMessage
}) => {
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para o usuário {usuario.nome}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="destinatario">Destinatário</Label>
            <Input 
              id="destinatario" 
              value={usuario.email}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input 
              id="assunto" 
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea 
              id="mensagem" 
              rows={5}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSendMessage}>Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
