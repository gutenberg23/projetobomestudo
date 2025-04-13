import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SimuladoRanking } from "@/components/simulado/SimuladoRanking";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SimuladoData {
  id: string;
  titulo: string;
  questoes_ids: string[];
}

const SimuladoRankingPage = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [simulado, setSimulado] = useState<SimuladoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimulado = async () => {
      if (!simuladoId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("simulados")
          .select("id, titulo, questoes_ids")
          .eq("id", simuladoId)
          .single();
        
        if (error) throw error;
        
        setSimulado(data);
      } catch (error) {
        console.error("Erro ao buscar dados do simulado:", error);
        toast.error("Não foi possível carregar os dados do simulado");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSimulado();
  }, [simuladoId]);
  
  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto pb-8 px-4">
        <div className="mb-6">
          <Link to={`/simulado/${simuladoId}`}>
            <Button variant="ghost" className="p-0 h-auto">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Voltar ao simulado</span>
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : simulado ? (
          <div className="max-w-4xl mx-auto">
            <SimuladoRanking 
              simuladoId={simulado.id} 
              simuladoTitle={simulado.titulo}
              totalQuestoes={(simulado.questoes_ids || []).length}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Simulado não encontrado</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SimuladoRankingPage; 