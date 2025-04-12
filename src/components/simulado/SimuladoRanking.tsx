import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Medal, Award } from "lucide-react";

interface RankingItem {
  ranking_position: number;
  user_id: string;
  nome: string;
  acertos: number;
  erros: number;
  aproveitamento: number;
  created_at: string;
}

interface SimuladoRankingProps {
  simuladoId: string;
  simuladoTitle: string;
  totalQuestoes: number;
}

export const SimuladoRanking: React.FC<SimuladoRankingProps> = ({
  simuladoId,
  simuladoTitle,
  totalQuestoes,
}) => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isPublicRanking, setIsPublicRanking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  
  // Encontrar a posição do usuário atual no ranking
  const userRankingPosition = ranking.findIndex(item => item.user_id === user?.id);
  
  useEffect(() => {
    const fetchRankingAndVisibility = async () => {
      setIsLoading(true);
      try {
        // Verificar se o ranking é público
        const { data: simuladoData, error: simuladoError } = await supabase
          .from("simulados")
          .select("ranking_is_public")
          .eq("id", simuladoId)
          .single();
        
        if (simuladoError) {
          console.error("Erro ao verificar visibilidade do ranking:", simuladoError);
          throw simuladoError;
        }
        
        setIsPublicRanking(simuladoData?.ranking_is_public || false);
        
        // Buscar o ranking do simulado
        const { data: rankingData, error: rankingError } = await supabase
          .rpc("get_simulado_ranking", { p_simulado_id: simuladoId });
        
        if (rankingError) {
          console.error("Erro ao buscar ranking:", rankingError);
          throw rankingError;
        }
        
        setRanking(rankingData || []);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        toast.error("Não foi possível carregar o ranking. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRankingAndVisibility();
  }, [simuladoId]);
  
  const handleToggleVisibility = async () => {
    if (!isAdmin()) return;
    
    setSavingVisibility(true);
    try {
      const { error } = await supabase
        .from("simulados")
        .update({ 
          ranking_is_public: !isPublicRanking,
          ranking_updated_at: new Date().toISOString()
        })
        .eq("id", simuladoId);
      
      if (error) throw error;
      
      setIsPublicRanking(!isPublicRanking);
      toast.success(`Ranking ${!isPublicRanking ? 'publicado' : 'definido como privado'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar visibilidade do ranking:", error);
      toast.error("Não foi possível atualizar a visibilidade do ranking. Tente novamente.");
    } finally {
      setSavingVisibility(false);
    }
  };
  
  // Renderizar medalha para os três primeiros colocados
  const renderPosition = (position: number) => {
    if (position === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (position === 3) {
      return <Award className="h-5 w-5 text-amber-700" />;
    }
    return position;
  };
  
  const canViewRanking = isPublicRanking || isAdmin();
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Ranking - {simuladoTitle}</CardTitle>
          <CardDescription>
            Classificação dos alunos por desempenho neste simulado
          </CardDescription>
        </div>
        {isAdmin() && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="ranking-visibility" 
              checked={isPublicRanking}
              onCheckedChange={handleToggleVisibility}
              disabled={savingVisibility}
            />
            <Label htmlFor="ranking-visibility">
              {isPublicRanking ? "Público" : "Privado"}
            </Label>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : !canViewRanking ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              Este ranking ainda não está disponível para visualização.
            </p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              Nenhum aluno completou este simulado ainda.
            </p>
          </div>
        ) : (
          <>
            {/* Mostrar a posição do usuário */}
            {userRankingPosition !== -1 && (
              <div className="bg-primary/10 p-4 rounded-md mb-4">
                <p className="text-sm font-medium">
                  Sua posição no ranking: <span className="font-bold text-primary">{userRankingPosition + 1}º</span> lugar
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="mr-4">Acertos: {ranking[userRankingPosition].acertos}/{totalQuestoes}</span>
                  <span>Aproveitamento: {ranking[userRankingPosition].aproveitamento}%</span>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posição</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-center">Erros</TableHead>
                    <TableHead className="text-center">Aproveitamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((item) => (
                    <TableRow 
                      key={item.user_id} 
                      className={
                        item.user_id === user?.id 
                          ? "bg-primary/10 font-medium" 
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {renderPosition(item.ranking_position)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.nome}
                        {item.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2">
                            Você
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {item.acertos}/{totalQuestoes}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {item.erros}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.aproveitamento}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 