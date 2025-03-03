import React from "react";
import { UserData, UserType } from "../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UserData | null;
  onUpdateUsuario: (usuario: UserData) => void;
  onChangeUsuario: (usuario: UserData) => void;
}
const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  usuario,
  onUpdateUsuario,
  onChangeUsuario
}) => {
  if (!usuario) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={usuario.nome} onChange={e => onChangeUsuario({
            ...usuario,
            nome: e.target.value
          })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={usuario.email} onChange={e => onChangeUsuario({
            ...usuario,
            email: e.target.value
          })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Usuário</Label>
            <Select value={usuario.tipo} onValueChange={(value: UserType) => onChangeUsuario({
            ...usuario,
            tipo: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aluno">Aluno</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="status">Status</Label>
            <Switch id="status" checked={usuario.status === 'ativo'} onCheckedChange={checked => onChangeUsuario({
            ...usuario,
            status: checked ? 'ativo' : 'inativo'
          })} />
            <span className="text-sm text-[#67748a]">
              {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="assinante">Assinante</Label>
            <Switch id="assinante" checked={usuario.assinante} onCheckedChange={checked => onChangeUsuario({
            ...usuario,
            assinante: checked
          })} />
            <span className="text-sm text-[#67748a]">
              {usuario.assinante ? 'Sim' : 'Não'}
            </span>
          </div>
          {usuario.assinante && <>
              <div className="space-y-2">
                <Label htmlFor="inicioAssinatura">Início da Assinatura</Label>
                <Input id="inicioAssinatura" type="date" value={usuario.inicioAssinatura} onChange={e => onChangeUsuario({
              ...usuario,
              inicioAssinatura: e.target.value
            })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminoAssinatura">Término da Assinatura</Label>
                <Input id="terminoAssinatura" type="date" value={usuario.terminoAssinatura} onChange={e => onChangeUsuario({
              ...usuario,
              terminoAssinatura: e.target.value
            })} />
              </div>
            </>}
          
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onUpdateUsuario(usuario)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default EditUserDialog;