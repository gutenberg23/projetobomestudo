
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DisciplinaForm from "./DisciplinaForm";
import DisciplinasTable from "./DisciplinasTable";
import CriarEditalCard from "./CriarEditalCard";
import { Disciplina, Edital } from "./types";

interface DisciplinasTabProps {
  disciplinas: Disciplina[];
  setDisciplinas: React.Dispatch<React.SetStateAction<Disciplina[]>>;
  editais: Edital[];
  setEditais: React.Dispatch<React.SetStateAction<Edital[]>>;
}

const DisciplinasTab: React.FC<DisciplinasTabProps> = ({ 
  disciplinas, 
  setDisciplinas,
  editais,
  setEditais
}) => {
  const { toast } = useToast();
  const [showCriarEditalCard, setShowCriarEditalCard] = useState(false);
  
  // Funções para gerenciar disciplinas
  const todasDisciplinasSelecionadas = disciplinas.length > 0 && disciplinas.every(d => d.selecionada);
  
  const handleToggleSelecaoTodas = () => {
    setDisciplinas(disciplinas.map(d => ({...d, selecionada: !todasDisciplinasSelecionadas})));
  };
  
  const handleToggleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(d => 
      d.id === id ? {...d, selecionada: !d.selecionada} : d
    ));
  };
  
  const adicionarDisciplina = (disciplina: Disciplina) => {
    // Verificar se já existe uma disciplina com esse ID
    if (disciplinas.some(d => d.id === disciplina.id)) {
      toast({
        title: "Erro",
        description: "Já existe uma disciplina com esse ID.",
        variant: "destructive"
      });
      return;
    }
    
    setDisciplinas([...disciplinas, disciplina]);
  };
  
  const excluirDisciplina = (id: string) => {
    setDisciplinas(disciplinas.filter(d => d.id !== id));
    
    toast({
      title: "Sucesso",
      description: "Disciplina excluída com sucesso!",
    });
  };
  
  // Funções para criar edital
  const criarEdital = () => {
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    
    if (disciplinasSelecionadas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma disciplina para criar o edital.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCriarEditalCard(true);
  };
  
  const salvarEdital = (titulo: string, cursoId: string) => {
    if (!cursoId || !titulo) {
      toast({
        title: "Erro",
        description: "ID do Curso e Título do Edital são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    
    const novoEdital: Edital = {
      id: `edital-${editais.length + 1}`,
      titulo: titulo,
      disciplinasIds: disciplinasSelecionadas.map(d => d.id),
      cursoId: cursoId,
      ativo: true
    };
    
    setEditais([...editais, novoEdital]);
    
    // Limpar seleções e fechar o card
    setDisciplinas(disciplinas.map(d => ({...d, selecionada: false})));
    setShowCriarEditalCard(false);
    
    toast({
      title: "Sucesso",
      description: "Edital criado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <DisciplinaForm onAddDisciplina={adicionarDisciplina} />
      
      <DisciplinasTable 
        disciplinas={disciplinas}
        todasSelecionadas={todasDisciplinasSelecionadas}
        onToggleSelecaoTodas={handleToggleSelecaoTodas}
        onToggleSelecao={handleToggleSelecaoDisciplina}
        onExcluir={excluirDisciplina}
        onCriarEdital={criarEdital}
      />
      
      {showCriarEditalCard && (
        <CriarEditalCard 
          disciplinasSelecionadas={disciplinas.filter(d => d.selecionada)}
          onSalvar={salvarEdital}
          onCancelar={() => setShowCriarEditalCard(false)}
        />
      )}
    </div>
  );
};

export default DisciplinasTab;
