import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DisciplinasTab, EditaisTab } from "./components/edital";
import { Edital } from "./components/edital/types";

const EditalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("disciplinas");
  const [editais, setEditais] = useState<Edital[]>([]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#272f3c]">Edital Verticalizado</h1>
      <p className="text-[#67748a]">Gerenciamento de editais verticalizados</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="disciplinas">Disciplinas Cadastradas</TabsTrigger>
          <TabsTrigger value="editais">Editais Verticalizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="disciplinas">
          <DisciplinasTab />
        </TabsContent>
        
        <TabsContent value="editais">
          <EditaisTab 
            editais={editais}
            setEditais={setEditais}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditalPage;
