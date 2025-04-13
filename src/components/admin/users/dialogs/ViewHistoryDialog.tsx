import React, { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";

interface ActivityLogItem {
  id: string;
  event_type: string;
  description: string;
  page?: string;
  resource_id?: string;
  resource_type?: string;
  created_at: string;
}

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
  const [historico, setHistorico] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && usuario) {
      loadHistorico();
    }
  }, [open, usuario]);

  const loadHistorico = async () => {
    if (!usuario) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar primeiro na nova tabela de logs de atividade
      const { data: activityLogs, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', usuario.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedLogs = activityLogs.map((log: any) => ({
        id: log.id,
        event_type: log.event_type,
        description: log.description,
        page: log.page,
        resource_id: log.resource_id,
        resource_type: log.resource_type,
        created_at: new Date(log.created_at).toLocaleString('pt-BR')
      }));
      
      // Verificar também na tabela auth_logs para eventos antigos
      const { data: authLogs, error: authError } = await supabase
        .from('auth_logs')
        .select('*')
        .eq('user_id', usuario.id)
        .order('created_at', { ascending: false });
      
      if (authError) throw authError;
      
      const formattedAuthLogs = authLogs.map((log: any) => ({
        id: log.id,
        event_type: log.event_type,
        description: log.event_type === 'login' ? 'Login no sistema' : 'Cadastro no sistema',
        created_at: new Date(log.created_at).toLocaleString('pt-BR')
      }));
      
      // Combinar e ordenar os logs
      const allLogs = [...formattedLogs, ...formattedAuthLogs].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setHistorico(allLogs);
    } catch (err: any) {
      console.error("Erro ao carregar histórico:", err);
      setError("Não foi possível carregar o histórico do usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!usuario) return null;

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
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              {error}
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              Nenhuma atividade registrada para este usuário.
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {historico.map((item) => (
                <div key={item.id} className="border-b pb-2">
                  <p className="text-sm font-medium">{item.description}</p>
                  {item.page && (
                    <p className="text-xs text-[#67748a]">Página: {item.page}</p>
                  )}
                  {item.resource_type && (
                    <p className="text-xs text-[#67748a]">Tipo: {item.resource_type}</p>
                  )}
                  <p className="text-xs text-[#67748a]">{item.created_at}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewHistoryDialog;
