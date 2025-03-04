
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import VisualizacaoConfig from "../admin/components/configuracoes/VisualizacaoConfig";
import GeralConfig from "../admin/components/configuracoes/GeralConfig";
import SeoConfig from "../admin/components/configuracoes/SeoConfig";

const ConfiguracoesSite = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Configurações do Site</h1>
        <p className="text-[#67748a]">Personalize as configurações gerais da plataforma</p>
      </div>

      <div className="bg-white rounded-md shadow">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1 mb-2">
            <TabsTrigger value="visual">Personalização Visual</TabsTrigger>
            <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
            <TabsTrigger value="seo">SEO Global</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="visual" className="mt-0">
              <VisualizacaoConfig />
            </TabsContent>
            
            <TabsContent value="geral" className="mt-0">
              <GeralConfig />
            </TabsContent>
            
            <TabsContent value="seo" className="mt-0">
              <SeoConfig />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ConfiguracoesSite;
