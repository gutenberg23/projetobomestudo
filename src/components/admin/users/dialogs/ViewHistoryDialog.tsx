
import React from "react";
import { UserData } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface ViewHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UserData | null;
}

const ViewHistoryDialog: React.FC<ViewHistoryDialogProps> = ({
  open,
  onOpenChange,
  usuario
}) => {
  if (!usuario) return null;

  // Histórico fictício para exemplo
  const historico = [
    { data: "2023-04-15 14:30", acao: "Login no sistema" },
    { data: "2023-04-10 09:15", acao: "Alteração de dados cadastrais" },
    { data: "2023-03-27 16:45", acao: "Assinatura de plano" },
    { data: "2023-03-20 11:20", acao: "Cadastro no sistema" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico do Usuário</DialogTitle>
          <DialogDescription>
            Histórico de atividades de {usuario.nome}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {historico.map((item, index) => (
              <div key={index} className="border-b pb-2">
                <p className="text-sm font-medium">{item.acao}</p>
                <p className="text-xs text-[#67748a]">{item.data}</p>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewHistoryDialog;
