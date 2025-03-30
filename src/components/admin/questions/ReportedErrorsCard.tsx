import React, { useState, useEffect } from 'react';
import Card from "@/components/admin/questions/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from '@/integrations/supabase/types';
import { Loader2 } from "lucide-react";

type ReportedError = Database['public']['Tables']['questoes_erros_reportados']['Row'] & {
  questao?: {
    id: string;
    year: string;
    institution: string;
    discipline: string;
  };
};

interface ReportedErrorsCardProps {
  onEditQuestion: (questionId: string) => void;
}

export function ReportedErrorsCard({ onEditQuestion }: ReportedErrorsCardProps) {
  const [reportedErrors, setReportedErrors] = useState<ReportedError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportedErrors();
  }, []);

  const fetchReportedErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('questoes_erros_reportados')
        .select(`
          *,
          questao:questao_id (
            id,
            year,
            institution,
            discipline
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportedErrors(data || []);
    } catch (error) {
      console.error('Erro ao buscar erros reportados:', error);
      toast.error('Erro ao carregar erros reportados');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (errorId: string, newStatus: 'resolvido' | 'ignorado') => {
    try {
      const { error } = await supabase
        .from('questoes_erros_reportados')
        .update({ status: newStatus })
        .eq('id', errorId);

      if (error) throw error;

      setReportedErrors(prev =>
        prev.map(error =>
          error.id === errorId ? { ...error, status: newStatus } : error
        )
      );

      toast.success(`Status atualizado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleResolveError = (questionId: string, errorId: string) => {
    onEditQuestion(questionId);
    handleStatusChange(errorId, 'resolvido');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      resolvido: 'bg-green-100 text-green-800',
      ignorado: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card
      title="Erros Reportados"
      description="Lista de erros reportados pelos usuários"
      defaultOpen={false}
    >
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : reportedErrors.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          Nenhum erro reportado
        </div>
      ) : (
        <div className="space-y-4">
          {reportedErrors.map((error) => (
            <div
              key={error.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  Questão #{error.questao_id}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveError(error.questao_id, error.id)}
                  >
                    Resolver erro
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{error.descricao}</p>
              <div className="text-xs text-gray-400">
                Reportado em: {new Date(error.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default ReportedErrorsCard; 