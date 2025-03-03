
import React from "react";
import { useToast } from "@/hooks/use-toast";
import EditaisTable from "./EditaisTable";
import { Edital } from "./types";

interface EditaisTabProps {
  editais: Edital[];
  setEditais: React.Dispatch<React.SetStateAction<Edital[]>>;
}

const EditaisTab: React.FC<EditaisTabProps> = ({ editais, setEditais }) => {
  const { toast } = useToast();
  
  // Funções para gerenciar editais
  const toggleAtivoEdital = (id: string) => {
    setEditais(editais.map(e => 
      e.id === id ? {...e, ativo: !e.ativo} : e
    ));
    
    toast({
      title: "Sucesso",
      description: "Status do edital alterado com sucesso!",
    });
  };
  
  const excluirEdital = (id: string) => {
    setEditais(editais.filter(e => e.id !== id));
    
    toast({
      title: "Sucesso",
      description: "Edital excluído com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <EditaisTable 
        editais={editais}
        onToggleAtivo={toggleAtivoEdital}
        onExcluir={excluirEdital}
      />
    </div>
  );
};

export default EditaisTab;
