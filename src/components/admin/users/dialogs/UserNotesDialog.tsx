
import React, { useState, useEffect } from "react";
import { UserData, UserNote } from "../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface UserNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UserData | null;
}

const UserNotesDialog: React.FC<UserNotesDialogProps> = ({
  open,
  onOpenChange,
  usuario
}) => {
  const [notas, setNotas] = useState<UserNote[]>([]);
  const [novaNota, setNovaNota] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && usuario) {
      carregarNotas();
    }
  }, [open, usuario]);

  const carregarNotas = async () => {
    if (!usuario) return;

    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from("notas_usuarios")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("data_criacao", { ascending: false });

      if (error) throw error;
      
      // Utilizando a nova interface UserNote que corresponde aos dados do Supabase
      setNotas(data || []);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notas do usuário.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const adicionarNota = async () => {
    if (!usuario || !novaNota.trim()) return;

    try {
      const novaNota_ = {
        usuario_id: usuario.id,
        conteudo: novaNota,
        criado_por: user?.id
      };

      const { error } = await supabase
        .from("notas_usuarios")
        .insert([novaNota_]);

      if (error) throw error;

      toast({
        title: "Nota adicionada",
        description: "A nota foi adicionada com sucesso."
      });

      setNovaNota("");
      carregarNotas();
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota.",
        variant: "destructive"
      });
    }
  };

  const excluirNota = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta nota?")) return;

    try {
      const { error } = await supabase
        .from("notas_usuarios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Nota excluída",
        description: "A nota foi excluída com sucesso."
      });

      carregarNotas();
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a nota.",
        variant: "destructive"
      });
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Notas do Usuário</DialogTitle>
          <DialogDescription>
            Gerenciar notas para {usuario.nome} ({usuario.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="nova-nota" className="font-medium">Nova Nota</label>
            <Textarea
              id="nova-nota"
              value={novaNota}
              onChange={(e) => setNovaNota(e.target.value)}
              placeholder="Digite uma nova nota sobre este usuário..."
              className="min-h-[100px]"
            />
            <Button 
              onClick={adicionarNota} 
              disabled={!novaNota.trim()} 
              className="mt-2"
            >
              Adicionar Nota
            </Button>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Histórico de Notas</h3>
            {carregando ? (
              <p className="text-center py-4 text-gray-500">Carregando notas...</p>
            ) : notas.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Nenhuma nota encontrada para este usuário.</p>
            ) : (
              <div className="space-y-4">
                {notas.map((nota) => (
                  <div key={nota.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-500">
                        {formatarData(nota.data_criacao)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => excluirNota(nota.id)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap">{nota.conteudo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserNotesDialog;
