import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { LeiSecaViewer } from "./LeiSecaViewer";

interface LeiSeca {
  id: string;
  titulo: string;
  conteudo: string;
  palavras_treino: Array<{
    palavra: string;
    posicao: number;
  }>;
  ordem: number;
}

interface LeiSecaTabProps {
  courseId?: string;
}

export const LeiSecaTab = ({ courseId }: LeiSecaTabProps) => {
  const [leis, setLeis] = useState<LeiSeca[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLei, setSelectedLei] = useState<LeiSeca | null>(null);

  useEffect(() => {
    const fetchLeis = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        const { data, error } = await supabase
          .from('leis_secas')
          .select('*')
          .eq('curso_id', realCourseId)
          .eq('ativo', true)
          .order('ordem', { ascending: true });
        
        if (error) throw error;
        
        setLeis(data || []);
      } catch (error) {
        console.error('Erro ao buscar leis secas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeis();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner />
      </div>
    );
  }

  if (selectedLei) {
    return (
      <LeiSecaViewer 
        lei={selectedLei} 
        onBack={() => setSelectedLei(null)} 
      />
    );
  }

  if (leis.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Nenhuma lei disponível
        </h3>
        <p className="text-muted-foreground">
          Não há leis secas cadastradas para este curso no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leis.map((lei) => (
        <div 
          key={lei.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors w-full p-6 rounded-lg bg-white"
          onClick={() => setSelectedLei(lei)}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              {lei.titulo}
            </h3>
          </div>
          <div className="p-6 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {lei.conteudo.substring(0, 150)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};