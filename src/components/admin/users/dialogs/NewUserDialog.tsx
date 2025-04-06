import React from "react";
import { UserType } from "../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novoUsuario: {
    nome?: string;
    email?: string;
    tipo?: UserType;
    status?: "ativo" | "inativo";
    assinante?: boolean;
    inicioAssinatura?: string;
    terminoAssinatura?: string;
  };
  onChangeNovoUsuario: (usuario: any) => void;
  onSalvarNovoUsuario: () => void;
}

const NewUserDialog: React.FC<NewUserDialogProps> = ({
  open,
  onOpenChange,
  novoUsuario,
  onChangeNovoUsuario,
  onSalvarNovoUsuario
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input 
              id="nome" 
              value={novoUsuario.nome || ''} 
              onChange={(e) => onChangeNovoUsuario({...novoUsuario, nome: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={novoUsuario.email || ''} 
              onChange={(e) => onChangeNovoUsuario({...novoUsuario, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Usuário</Label>
            <Select 
              value={novoUsuario.tipo || 'aluno'} 
              onValueChange={(value: UserType) => 
                onChangeNovoUsuario({...novoUsuario, tipo: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aluno">Aluno</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
                <SelectItem value="jornalista">Jornalista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="novoStatus">Status</Label>
            <Switch 
              id="novoStatus" 
              checked={novoUsuario.status === 'ativo'} 
              onCheckedChange={(checked) => 
                onChangeNovoUsuario({...novoUsuario, status: checked ? 'ativo' : 'inativo'})
              }
            />
            <span className="text-sm text-[#67748a]">
              {novoUsuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="novoAssinante">Assinante</Label>
            <Switch 
              id="novoAssinante" 
              checked={novoUsuario.assinante} 
              onCheckedChange={(checked) => 
                onChangeNovoUsuario({...novoUsuario, assinante: checked})
              }
            />
            <span className="text-sm text-[#67748a]">
              {novoUsuario.assinante ? 'Sim' : 'Não'}
            </span>
          </div>
          {novoUsuario.assinante && (
            <>
              <div className="space-y-2">
                <Label htmlFor="novoInicioAssinatura">Início da Assinatura</Label>
                <Input 
                  id="novoInicioAssinatura" 
                  type="date"
                  value={novoUsuario.inicioAssinatura || ''} 
                  onChange={(e) => onChangeNovoUsuario({...novoUsuario, inicioAssinatura: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="novoTerminoAssinatura">Término da Assinatura</Label>
                <Input 
                  id="novoTerminoAssinatura" 
                  type="date"
                  value={novoUsuario.terminoAssinatura || ''} 
                  onChange={(e) => onChangeNovoUsuario({...novoUsuario, terminoAssinatura: e.target.value})}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSalvarNovoUsuario}>Criar Usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserDialog;
