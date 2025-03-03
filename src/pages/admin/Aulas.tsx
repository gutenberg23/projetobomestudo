
import React, { useState } from "react";
import { 
  AulasFilter, 
  AulasTable, 
  AdicionarDisciplina,
  EditAulaModal,
  DeleteAulaModal
} from "./components/aulas";
import { Aula } from "./components/aulas/AulasTypes";

const Aulas = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");

  // Estados para a adição de disciplina
  const [tituloNovaDisciplina, setTituloNovaDisciplina] = useState("");
  const [descricaoNovaDisciplina, setDescricaoNovaDisciplina] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);

  // Dados mockados de aulas para demonstração
  const [aulas, setAulas] = useState<Aula[]>([
    {
      id: "1",
      titulo: "Aula de Introdução ao Direito Constitucional",
      descricao: "Fundamentos e princípios da Constituição Federal",
      topicosIds: ["101", "102", "103"],
      questoesIds: ["201", "202"],
      selecionada: false
    },
    {
      id: "2",
      titulo: "Aula de Direito Penal",
      descricao: "Conceitos básicos e tipos de crimes",
      topicosIds: ["104", "105"],
      questoesIds: ["203", "204", "205", "206"],
      selecionada: false
    },
    {
      id: "3",
      titulo: "Aula de Matemática Financeira",
      descricao: "Juros simples e compostos",
      topicosIds: ["106", "107", "108", "109"],
      questoesIds: ["207", "208"],
      selecionada: false
    }
  ]);

  // Função para filtrar aulas
  const aulasFiltradas = aulas.filter((aula) => {
    const matchesTitulo = aula.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = aula.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Função para verificar se todas as aulas estão selecionadas
  const todasSelecionadas = aulasFiltradas.length > 0 && aulasFiltradas.every(aula => aula.selecionada);

  // Funções para manipulação de seleção
  const handleSelecaoTodas = () => {
    setAulas(aulas.map(aula => {
      if (aulasFiltradas.some(aulaFiltrada => aulaFiltrada.id === aula.id)) {
        return { ...aula, selecionada: !todasSelecionadas };
      }
      return aula;
    }));
  };

  const handleSelecaoAula = (id: string) => {
    setAulas(aulas.map(aula => 
      aula.id === id ? { ...aula, selecionada: !aula.selecionada } : aula
    ));
  };

  // Funções para abrir modais
  const openEditModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenDelete(true);
  };

  // Função para salvar aula editada
  const handleSaveAula = (updatedAula: Aula) => {
    setAulas(aulas.map(aula => 
      aula.id === updatedAula.id ? updatedAula : aula
    ));
    setIsOpenEdit(false);
  };

  // Função para excluir aula
  const handleDeleteAula = (id: string) => {
    setAulas(aulas.filter(aula => aula.id !== id));
    setIsOpenDelete(false);
  };

  // Função para adicionar disciplina
  const handleAdicionarDisciplina = () => {
    if (tituloNovaDisciplina.trim()) {
      // Lógica para adicionar disciplina com os tópicos selecionados
      const topicosIds = aulas
        .filter(aula => aula.selecionada)
        .flatMap(aula => aula.topicosIds);
      
      console.log("Adicionando disciplina:", {
        titulo: tituloNovaDisciplina,
        descricao: descricaoNovaDisciplina,
        topicosIds: topicosIds
      });
      
      // Resetar campos após adicionar
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      
      // Desmarcar todas as aulas após adicionar
      setAulas(aulas.map(aula => ({...aula, selecionada: false})));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Aulas</h1>
      <p className="text-[#67748a]">Gerenciamento de aulas</p>
      
      {/* Componente de filtro */}
      <AulasFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de aulas */}
      <AulasTable 
        aulas={aulasFiltradas}
        todasSelecionadas={todasSelecionadas}
        handleSelecaoTodas={handleSelecaoTodas}
        handleSelecaoAula={handleSelecaoAula}
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
        aulas={aulas}
      />
      
      {/* Modais de edição e exclusão */}
      <EditAulaModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        aula={currentAula}
        onSave={handleSaveAula}
      />
      
      <DeleteAulaModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        aula={currentAula}
        onDelete={handleDeleteAula}
      />
    </div>
  );
};

export default Aulas;
