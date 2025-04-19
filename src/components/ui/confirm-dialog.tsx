import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 