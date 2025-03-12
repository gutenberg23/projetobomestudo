
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import EditaisTable from "./EditaisTable";
import { Edital } from "./types";
import { useEditalActions } from "./hooks/useEditalActions";

interface EditaisTabProps {
  editais: Edital[];
  setEditais: React.Dispatch<React.SetStateAction<Edital[]>>;
}

const EditaisTab: React.FC<EditaisTabProps> = ({ editais, setEditais }) => {
  const { toggleAtivoEdital, excluirEdital, listarEditais } = useEditalActions();
  
  useEffect(() => {
    const carregarEditais = async () => {
      const data = await listarEditais();
      setEditais(data);
    };
    
    carregarEditais();
  }, []);
  
  const handleToggleAtivo = async (id: string) => {
    const edital = editais.find(e => e.id === id);
    if (!edital) return;
    
    await toggleAtivoEdital(id, edital.ativo);
    setEditais(editais.map(e => 
      e.id === id ? {...e, ativo: !e.ativo} : e
    ));
  };
  
  const handleExcluir = async (id: string) => {
    await excluirEdital(id);
    setEditais(editais.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <EditaisTable 
        editais={editais}
        onToggleAtivo={handleToggleAtivo}
        onExcluir={handleExcluir}
      />
    </div>
  );
};

export default EditaisTab;
