import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DisciplinaForm from "./DisciplinaForm";
import DisciplinasTable from "./DisciplinasTable";
import CriarEditalCard from "./CriarEditalCard";
import { Disciplina, Edital } from "./types";
import { useEditalActions } from "./hooks/useEditalActions";

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
  const { cadastrarDisciplina, listarDisciplinas, cadastrarEdital, excluirDisciplina, atualizarDisciplina } = useEditalActions();
  const { toast } = useToast();
  const [showCriarEditalCard, setShowCriarEditalCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDisciplinas, setFilteredDisciplinas] = useState<Disciplina[]>(disciplinas);
  const [disciplinaEmEdicao, setDisciplinaEmEdicao] = useState<Disciplina | null>(null);
  
  useEffect(() => {
    const carregarDisciplinas = async () => {
      const data = await listarDisciplinas();
      setDisciplinas(data);
    };
    
    carregarDisciplinas();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDisciplinas(disciplinas);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredDisciplinas(
        disciplinas.filter(
          (disciplina) => 
            disciplina.titulo.toLowerCase().includes(lowerCaseSearch) || 
            disciplina.topicos.some(topico => topico.toLowerCase().includes(lowerCaseSearch))
        )
      );
    }
  }, [searchTerm, disciplinas]);
  
  const todasDisciplinasSelecionadas = filteredDisciplinas.length > 0 && filteredDisciplinas.every(d => d.selecionada);
  
  const handleToggleSelecaoTodas = () => {
    setDisciplinas(disciplinas.map(d => {
      if (filteredDisciplinas.some(fd => fd.id === d.id)) {
        return {...d, selecionada: !todasDisciplinasSelecionadas};
      }
      return d;
    }));
  };
  
  const handleToggleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(d => 
      d.id === id ? {...d, selecionada: !d.selecionada} : d
    ));
  };
  
  const adicionarDisciplina = async (disciplina: Disciplina) => {
    if (disciplinaEmEdicao) {
      // Atualizar disciplina existente
      const disciplinaAtualizada = await atualizarDisciplina({
        ...disciplina,
        id: disciplinaEmEdicao.id
      });
      
      if (disciplinaAtualizada) {
        setDisciplinas(disciplinas.map(d => 
          d.id === disciplinaEmEdicao.id ? { ...disciplinaAtualizada, selecionada: false } : d
        ));
        setDisciplinaEmEdicao(null);
        toast({
          title: "Sucesso",
          description: "Disciplina atualizada com sucesso!",
        });
      }
    } else {
      // Adicionar nova disciplina
      const { id, selecionada, ...disciplinaData } = disciplina;
      const novaDisciplina = await cadastrarDisciplina(disciplinaData);
      if (novaDisciplina) {
        setDisciplinas([...disciplinas, { ...novaDisciplina, selecionada: false }]);
      }
    }
  };
  
  const excluirDisciplinaHandler = async (id: string) => {
    const success = await excluirDisciplina(id);
    if (success) {
      setDisciplinas(disciplinas.filter(d => d.id !== id));
      toast({
        title: "Sucesso",
        description: "Disciplina excluída com sucesso!",
      });
    }
  };
  
  const editarDisciplinaHandler = (disciplina: Disciplina) => {
    setDisciplinaEmEdicao(disciplina);
  };
  
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
  
  const salvarEdital = async (titulo: string, cursoId: string) => {
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    
    const novoEdital = await cadastrarEdital({
      titulo,
      curso_id: cursoId,
      disciplinas_ids: disciplinasSelecionadas.map(d => d.id),
      ativo: true
    });

    if (novoEdital) {
      setEditais([...editais, novoEdital]);
      setDisciplinas(disciplinas.map(d => ({...d, selecionada: false})));
      setShowCriarEditalCard(false);
    }
  };

  return (
    <div className="space-y-6">
      <DisciplinaForm 
        onAddDisciplina={adicionarDisciplina} 
        disciplinaEmEdicao={disciplinaEmEdicao}
      />
      
      <DisciplinasTable 
        disciplinas={disciplinas}
        filteredDisciplinas={filteredDisciplinas}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        todasSelecionadas={todasDisciplinasSelecionadas}
        onToggleSelecaoTodas={handleToggleSelecaoTodas}
        onToggleSelecao={handleToggleSelecaoDisciplina}
        onExcluir={excluirDisciplinaHandler}
        onEditar={editarDisciplinaHandler}
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
