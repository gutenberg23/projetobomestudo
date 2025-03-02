
import React from "react";
import { UserData } from "../types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UserData | null;
  onDelete: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  usuario,
  onDelete
}) => {
  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center mb-4">
            Você está prestes a excluir o usuário:
          </p>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Avatar>
              <AvatarFallback className="bg-[#ea2be2] text-white">
                {usuario.nome.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{usuario.nome}</div>
              <div className="text-sm text-[#67748a]">{usuario.email}</div>
            </div>
          </div>
          <p className="text-sm text-center text-red-500">
            Todos os dados associados a este usuário serão permanentemente removidos.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={onDelete}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
