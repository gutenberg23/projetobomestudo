
import React, { useState } from "react";
import { 
  DisciplinasFilter, 
  DisciplinasTable, 
  AdicionarDisciplina,
  EditDisciplinaModal,
  DeleteDisciplinaModal
} from "./components/disciplinas";
import { Disciplina } from "./components/disciplinas/DisciplinasTypes";

const Disciplinas = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");

  // Estados para a adição de disciplina
  const [tituloNovaDisciplina, setTituloNovaDisciplina] = useState("");
  const [descricaoNovaDisciplina, setDescricaoNovaDisciplina] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentDisciplina, setCurrentDisciplina] = useState<Disciplina | null>(null);

  // Dados mockados de disciplinas para demonstração
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([
    {
      id: "1",
      titulo: "Direito Constitucional",
      descricao: "Fundamentos e princípios da Constituição Federal",
      aulasIds: ["1", "2", "3"],
      topicosIds: ["101", "102", "103", "104"],
      questoesIds: ["201", "202", "203", "204", "205"],
      selecionada: false
    },
    {
      id: "2",
      titulo: "Direito Penal",
      descricao: "Conceitos básicos e tipos de crimes",
      aulasIds: ["4", "5"],
      topicosIds: ["105", "106"],
      questoesIds: ["206", "207", "208"],
      selecionada: false
    },
    {
      id: "3",
      titulo: "Matemática Financeira",
      descricao: "Juros simples e compostos",
      aulasIds: ["6", "7", "8", "9"],
      topicosIds: ["107", "108", "109", "110", "111", "112"],
      questoesIds: ["209", "210", "211", "212", "213", "214", "215"],
      selecionada: false
    }
  ]);

  // Função para filtrar disciplinas
  const disciplinasFiltradas = disciplinas.filter((disciplina) => {
    const matchesTitulo = disciplina.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = disciplina.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Função para verificar se todas as disciplinas estão selecionadas
  const todasSelecionadas = disciplinasFiltradas.length > 0 && disciplinasFiltradas.every(disciplina => disciplina.selecionada);

  // Funções para manipulação de seleção
  const handleSelecaoTodas = () => {
    setDisciplinas(disciplinas.map(disciplina => {
      if (disciplinasFiltradas.some(disciplinaFiltrada => disciplinaFiltrada.id === disciplina.id)) {
        return { ...disciplina, selecionada: !todasSelecionadas };
      }
      return disciplina;
    }));
  };

  const handleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(disciplina => 
      disciplina.id === id ? { ...disciplina, selecionada: !disciplina.selecionada } : disciplina
    ));
  };

  // Funções para abrir modais
  const openEditModal = (disciplina: Disciplina) => {
    setCurrentDisciplina(disciplina);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (disciplina: Disciplina) => {
    setCurrentDisciplina(disciplina);
    setIsOpenDelete(true);
  };

  // Função para salvar disciplina editada
  const handleSaveDisciplina = (updatedDisciplina: Disciplina) => {
    setDisciplinas(disciplinas.map(disciplina => 
      disciplina.id === updatedDisciplina.id ? updatedDisciplina : disciplina
    ));
    setIsOpenEdit(false);
  };

  // Função para excluir disciplina
  const handleDeleteDisciplina = (id: string) => {
    setDisciplinas(disciplinas.filter(disciplina => disciplina.id !== id));
    setIsOpenDelete(false);
  };

  // Função para adicionar disciplina
  const handleAdicionarDisciplina = () => {
    if (tituloNovaDisciplina.trim()) {
      // Lógica para adicionar disciplina com as aulas selecionadas
      const aulasIds = disciplinas
        .filter(disciplina => disciplina.selecionada)
        .flatMap(disciplina => disciplina.aulasIds);
      
      console.log("Adicionando disciplina:", {
        titulo: tituloNovaDisciplina,
        descricao: descricaoNovaDisciplina,
        aulasIds: aulasIds
      });
      
      // Resetar campos após adicionar
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      
      // Desmarcar todas as disciplinas após adicionar
      setDisciplinas(disciplinas.map(disciplina => ({...disciplina, selecionada: false})));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Disciplinas</h1>
      <p className="text-[#67748a]">Gerenciamento de disciplinas</p>
      
      {/* Componente de filtro */}
      <DisciplinasFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de disciplinas */}
      <DisciplinasTable 
        disciplinas={disciplinasFiltradas}
        todasSelecionadas={todasSelecionadas}
        handleSelecaoTodas={handleSelecaoTodas}
        handleSelecaoDisciplina={handleSelecaoDisciplina}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      
      {/* Componente para adicionar disciplina */}
      <AdicionarDisciplina 
        tituloNovaDisciplina={tituloNovaDisciplina}
        setTituloNovaDisciplina={setTituloNovaDisciplina}
        descricaoNovaDisciplina={descricaoNovaDisciplina}
        setDescricaoNovaDisciplina={setDescricaoNovaDisciplina}
        handleAdicionarDisciplina={handleAdicionarDisciplina}
        todasSelecionadas={todasSelecionadas}
        disciplinas={disciplinas}
      />
      
      {/* Modais de edição e exclusão */}
      <EditDisciplinaModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        disciplina={currentDisciplina}
        onSave={handleSaveDisciplina}
      />
      
      <DeleteDisciplinaModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        disciplina={currentDisciplina}
        onDelete={handleDeleteDisciplina}
      />
    </div>
  );
};

export default Disciplinas;
