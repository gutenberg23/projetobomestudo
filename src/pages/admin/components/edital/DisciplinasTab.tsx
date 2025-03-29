import React, { useState, useEffect } from "react";
import DisciplinasTable from "./DisciplinasTable";
import DisciplinaForm from "./DisciplinaForm";
import { Disciplina } from "@/types/edital";
import { useEditalActions } from "./hooks/useEditalActions";

const DisciplinasTab: React.FC = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDisciplinas, setFilteredDisciplinas] = useState<Disciplina[]>([]);
  const [todasSelecionadas, setTodasSelecionadas] = useState(false);
  const [disciplinaParaEditar, setDisciplinaParaEditar] = useState<Disciplina | null>(null);

  const {
    isLoading,
    cadastrarDisciplina,
    listarDisciplinas,
    atualizarDisciplina,
    excluirDisciplina,
    cadastrarEdital
  } = useEditalActions();

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  useEffect(() => {
    const filtered = disciplinas.filter(disciplina =>
      disciplina.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciplina.topicos.some(topico => 
        topico.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredDisciplinas(filtered);
  }, [searchTerm, disciplinas]);

  const fetchDisciplinas = async () => {
    const data = await listarDisciplinas();
    setDisciplinas(data);
  };

  const toggleSelecaoTodas = () => {
    const novoEstado = !todasSelecionadas;
    setTodasSelecionadas(novoEstado);
    setDisciplinas(disciplinas.map(d => ({
      ...d,
      selecionada: novoEstado
    })));
  };

  const toggleSelecao = (id: string) => {
    setDisciplinas(disciplinas.map(d => 
      d.id === id ? {...d, selecionada: !d.selecionada} : d
    ));
  };

  const handleAddDisciplina = async (disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => {
    const novaDisciplina = await cadastrarDisciplina(disciplina);
    if (novaDisciplina) {
      setDisciplinas(prev => [...prev, { ...novaDisciplina, selecionada: false }]);
    }
  };

  const handleEditDisciplina = async (disciplina: Disciplina) => {
    const disciplinaAtualizada = await atualizarDisciplina(disciplina.id, disciplina);
    if (disciplinaAtualizada) {
      setDisciplinas(prev => 
        prev.map(d => d.id === disciplina.id ? { ...disciplinaAtualizada, selecionada: d.selecionada } : d)
      );
      setDisciplinaParaEditar(null);
    }
  };

  const handleExcluirDisciplina = async (id: string) => {
    const sucesso = await excluirDisciplina(id);
    if (sucesso) {
      setDisciplinas(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleCriarEdital = async () => {
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    if (disciplinasSelecionadas.length === 0) {
      return;
    }

    const edital = await cadastrarEdital({
      titulo: 'Novo Edital',
      curso_id: '',
      disciplinas_ids: disciplinasSelecionadas.map(d => d.id),
      ativo: true
    });

    if (edital) {
      // Limpar seleções após criar o edital
      setDisciplinas(prev => prev.map(d => ({ ...d, selecionada: false })));
      setTodasSelecionadas(false);
    }
  };

  return (
    <div className="space-y-6">
      <DisciplinasTable
        disciplinas={disciplinas}
        filteredDisciplinas={filteredDisciplinas}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        todasSelecionadas={todasSelecionadas}
        onToggleSelecaoTodas={toggleSelecaoTodas}
        onToggleSelecao={toggleSelecao}
        onExcluir={handleExcluirDisciplina}
        onCriarEdital={handleCriarEdital}
        onEditDisciplina={setDisciplinaParaEditar}
      />

      {!disciplinaParaEditar ? (
        <DisciplinaForm
          onAddDisciplina={handleAddDisciplina}
        />
      ) : (
        <DisciplinaForm
          onAddDisciplina={handleAddDisciplina}
          onEditDisciplina={handleEditDisciplina}
          disciplinaParaEditar={disciplinaParaEditar}
        />
      )}
    </div>
  );
};

export default DisciplinasTab;
