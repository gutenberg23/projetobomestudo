import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DashboardHeader, 
  StatCards, 
  UsuariosTab,
  AcessosTab,
  QuestoesTab
} from "./components/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "./components/dashboard/hooks/useDashboardData";

const Dashboard = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5f2ebe]" />
        <span className="ml-2 text-lg font-medium">Carregando dados do dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <StatCards estatisticas={data.estatisticas} />

      <Tabs defaultValue="usuarios">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="acessos">Acessos</TabsTrigger>
          <TabsTrigger value="questoes">Questões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios">
          <UsuariosTab dadosCadastros={data.dadosCadastros} />
        </TabsContent>

        <TabsContent value="acessos">
          <AcessosTab dadosAcessos={data.dadosAcessos} />
        </TabsContent>

        <TabsContent value="questoes">
          <QuestoesTab disciplinasQuestoes={data.disciplinasQuestoes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
