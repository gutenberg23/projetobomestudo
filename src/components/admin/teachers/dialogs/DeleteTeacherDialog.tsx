
import React from "react";
import { TeacherData } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherData | null;
  onDelete: (id: string) => void;
}

const DeleteTeacherDialog: React.FC<DeleteTeacherDialogProps> = ({
  open,
  onOpenChange,
  teacher,
  onDelete
}) => {
  if (!teacher) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#022731]">Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o professor <span className="font-medium">{teacher.nomeCompleto}</span>? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#2a8e9e] text-[#2a8e9e]">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onDelete(teacher.id)}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTeacherDialog;
