
import React, { useState } from "react";
import { 
  CursosFilter, 
  CursosTable, 
  AdicionarCurso,
  EditCursoModal,
  DeleteCursoModal
} from "./components/cursos";
import { Curso } from "./components/cursos/CursosTypes";

const Cursos = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");

  // Estados para a adição de curso
  const [tituloNovoCurso, setTituloNovoCurso] = useState("");
  const [descricaoNovoCurso, setDescricaoNovoCurso] = useState("");

  // Estados para modais de edição/exclusão
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);

  // Dados mockados de cursos para demonstração
  const [cursos, setCursos] = useState<Curso[]>([
    {
      id: "1",
      titulo: "Concurso Receita Federal",
      descricao: "Preparatório completo para o concurso da Receita Federal",
      disciplinasIds: ["1", "2", "3"],
      aulasIds: ["1", "2", "3", "4"],
      topicosIds: ["101", "102", "103"],
      questoesIds: ["201", "202", "203", "204"],
      selecionada: false
    },
    {
      id: "2",
      titulo: "Concurso INSS",
      descricao: "Preparatório para Técnico do Seguro Social",
      disciplinasIds: ["2", "5"],
      aulasIds: ["2", "5", "7"],
      topicosIds: ["104", "105"],
      questoesIds: ["205", "206"],
      selecionada: false
    },
    {
      id: "3",
      titulo: "Concurso Banco do Brasil",
      descricao: "Preparatório para Escriturário",
      disciplinasIds: ["3", "5", "7", "9"],
      aulasIds: ["5", "8", "9", "10", "11"],
      topicosIds: ["106", "107", "108", "109", "110"],
      questoesIds: ["207", "208", "209", "210"],
      selecionada: false
    }
  ]);

  // Função para filtrar cursos
  const cursosFiltrados = cursos.filter((curso) => {
    const matchesTitulo = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = curso.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Função para verificar se todos os cursos estão selecionados
  const todasSelecionadas = cursosFiltrados.length > 0 && cursosFiltrados.every(curso => curso.selecionada);

  // Funções para manipulação de seleção
  const handleSelecaoTodas = () => {
    setCursos(cursos.map(curso => {
      if (cursosFiltrados.some(cursoFiltrado => cursoFiltrado.id === curso.id)) {
        return { ...curso, selecionada: !todasSelecionadas };
      }
      return curso;
    }));
  };

  const handleSelecaoCurso = (id: string) => {
    setCursos(cursos.map(curso => 
      curso.id === id ? { ...curso, selecionada: !curso.selecionada } : curso
    ));
  };

  // Funções para abrir modais
  const openEditModal = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsOpenDelete(true);
  };

  // Função para salvar curso editado
  const handleSaveCurso = (updatedCurso: Curso) => {
    setCursos(cursos.map(curso => 
      curso.id === updatedCurso.id ? updatedCurso : curso
    ));
    setIsOpenEdit(false);
  };

  // Função para excluir curso
  const handleDeleteCurso = (id: string) => {
    setCursos(cursos.filter(curso => curso.id !== id));
    setIsOpenDelete(false);
  };

  // Função para adicionar curso
  const handleAdicionarCurso = () => {
    if (tituloNovoCurso.trim()) {
      // Lógica para adicionar curso com as disciplinas selecionadas
      const disciplinasIds = cursos
        .filter(curso => curso.selecionada)
        .flatMap(curso => curso.disciplinasIds);
      
      console.log("Adicionando curso:", {
        titulo: tituloNovoCurso,
        descricao: descricaoNovoCurso,
        disciplinasIds: disciplinasIds
      });
      
      // Resetar campos após adicionar
      setTituloNovoCurso("");
      setDescricaoNovoCurso("");
      
      // Desmarcar todos os cursos após adicionar
      setCursos(cursos.map(curso => ({...curso, selecionada: false})));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Cursos</h1>
      <p className="text-[#67748a]">Gerenciamento de cursos</p>
      
      {/* Componente de filtro */}
      <CursosFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de cursos */}
      <CursosTable 
        cursos={cursosFiltrados}
        todasSelecionadas={todasSelecionadas}
        handleSelecaoTodas={handleSelecaoTodas}
        handleSelecaoCurso={handleSelecaoCurso}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      
      {/* Componente para adicionar curso */}
      <AdicionarCurso 
        tituloNovoCurso={tituloNovoCurso}
        setTituloNovoCurso={setTituloNovoCurso}
        descricaoNovoCurso={descricaoNovoCurso}
        setDescricaoNovoCurso={setDescricaoNovoCurso}
        handleAdicionarCurso={handleAdicionarCurso}
        todasSelecionadas={todasSelecionadas}
        cursos={cursos}
      />
      
      {/* Modais de edição e exclusão */}
      <EditCursoModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        curso={currentCurso}
        onSave={handleSaveCurso}
      />
      
      <DeleteCursoModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        curso={currentCurso}
        onDelete={handleDeleteCurso}
      />
    </div>
  );
};

export default Cursos;
