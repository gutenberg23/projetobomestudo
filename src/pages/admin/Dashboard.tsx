
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DashboardHeader, 
  StatCards, 
  ReceitaTab, 
  AssinantesTab,
  dashboardData
} from "./components/dashboard";

const Dashboard = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");

  const handleChangePeriodo = (value: string) => {
    setPeriodoSelecionado(value);
  };

  const exportarDados = (formato: string) => {
    console.log(`Exportando dados em formato ${formato}`);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        periodoSelecionado={periodoSelecionado}
        handleChangePeriodo={handleChangePeriodo}
        exportarDados={exportarDados}
      />

      <StatCards estatisticas={dashboardData.estatisticas} />

      <Tabs defaultValue="receita">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receita">Receita e Faturamento</TabsTrigger>
          <TabsTrigger value="assinantes">Assinantes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="receita">
          <ReceitaTab 
            dadosReceita={dashboardData.dadosReceita}
            dadosPlanos={dashboardData.dadosPlanos}
            cuponsAtivos={dashboardData.cuponsAtivos}
            estatisticas={dashboardData.estatisticas}
          />
        </TabsContent>

        <TabsContent value="assinantes">
          <AssinantesTab dadosAssinantes={dashboardData.dadosAssinantes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
