import React, { useState, useEffect } from "react";
import SelectField from "./SelectField";
import SelectFieldDB from "./SelectFieldDB";
import AddValueDialog from "./AddValueDialog";
import { useSelectFieldState } from "./useSelectFieldState";
import { useSelectFieldStateDB } from "./useSelectFieldStateDB";
import AssuntosField from "./AssuntosField";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";

// Importando os serviços
import { fetchBancas, addBanca, updateBanca, deleteBanca, Banca } from "@/services/bancasService";
import { fetchInstituicoes, addInstituicao, updateInstituicao, deleteInstituicao, Instituicao } from "@/services/instituicoesService";
import { fetchAnos, addAno, updateAno, deleteAno, Ano } from "@/services/anosService";
import { fetchCargos, addCargo, updateCargo, deleteCargo, Cargo } from "@/services/cargosService";
import { fetchDisciplinasQuestoes, addDisciplinaQuestao, updateDisciplinaQuestao, deleteDisciplinaQuestao, DisciplinaQuestao } from "@/services/disciplinasQuestoesService";
import { fetchNiveis, addNivel, updateNivel, deleteNivel, Nivel } from "@/services/niveisService";
import { fetchDificuldades, addDificuldade, updateDificuldade, deleteDificuldade, Dificuldade } from "@/services/dificuldadesService";
import { fetchTiposQuestao, addTipoQuestao, updateTipoQuestao, deleteTipoQuestao, TipoQuestao } from "@/services/tiposQuestaoService";

interface QuestionMetadataFieldsProps {
  // Institution
  institution: string;
  setInstitution: (value: string) => void;
  institutions: string[];
  setInstitutions: (value: string[]) => void;
  
  // Organization
  organization: string;
  setOrganization: (value: string) => void;
  organizations: string[];
  setOrganizations: (value: string[]) => void;
  
  // Year
  year: string;
  setYear: (value: string) => void;
  years: string[];
  setYears: (value: string[]) => void;
  
  // Role
  role: string;
  setRole: (value: string) => void;
  roles: string[];
  setRoles: (value: string[]) => void;
  
  // Discipline
  discipline: string;
  setDiscipline: (value: string) => void;
  disciplines: string[];
  setDisciplines: (value: string[]) => void;
  
  // Assuntos (antigo Tópicos)
  topicos: string[];
  setTopicos: (value: string[]) => void;
  
  // Level
  level: string;
  setLevel: (value: string) => void;
  levels: string[];
  setLevels: (value: string[]) => void;
  
  // Difficulty
  difficulty: string;
  setDifficulty: (value: string) => void;
  difficulties: string[];
  setDifficulties: (value: string[]) => void;
  
  // Question Type
  questionType: string;
  setQuestionType: (value: string) => void;
  questionTypes: string[];
  setQuestionTypes: (value: string[]) => void;
}

const QuestionMetadataFields: React.FC<QuestionMetadataFieldsProps> = ({
  institution, setInstitution, institutions, setInstitutions,
  organization, setOrganization, organizations, setOrganizations,
  year, setYear, years, setYears,
  role, setRole, roles, setRoles,
  discipline, setDiscipline, disciplines, setDisciplines,
  topicos, setTopicos,
  level, setLevel, levels, setLevels,
  difficulty, setDifficulty, difficulties, setDifficulties,
  questionType, setQuestionType, questionTypes, setQuestionTypes
}) => {
  // Estados para os campos de seleção usando o novo hook com banco de dados
  const bancaState = useSelectFieldStateDB<Banca>(
    institution, 
    setInstitution, 
    "Banca", 
    fetchBancas, 
    addBanca, 
    updateBanca, 
    deleteBanca
  );

  const instituicaoState = useSelectFieldStateDB<Instituicao>(
    organization, 
    setOrganization, 
    "Órgão", 
    fetchInstituicoes, 
    addInstituicao, 
    updateInstituicao, 
    deleteInstituicao
  );

  const anoState = useSelectFieldStateDB<Ano>(
    year, 
    setYear, 
    "Ano", 
    fetchAnos, 
    addAno, 
    updateAno, 
    deleteAno,
    'valor'
  );

  const cargoState = useSelectFieldStateDB<Cargo>(
    role, 
    setRole, 
    "Cargo", 
    fetchCargos, 
    addCargo, 
    updateCargo, 
    deleteCargo
  );

  const disciplinaState = useSelectFieldStateDB<DisciplinaQuestao>(
    discipline, 
    setDiscipline, 
    "Disciplina", 
    fetchDisciplinasQuestoes, 
    addDisciplinaQuestao, 
    updateDisciplinaQuestao, 
    deleteDisciplinaQuestao
  );

  const nivelState = useSelectFieldStateDB<Nivel>(
    level, 
    setLevel, 
    "Nível", 
    fetchNiveis, 
    addNivel, 
    updateNivel, 
    deleteNivel
  );

  const dificuldadeState = useSelectFieldStateDB<Dificuldade>(
    difficulty, 
    setDifficulty, 
    "Dificuldade", 
    fetchDificuldades, 
    addDificuldade, 
    updateDificuldade, 
    deleteDificuldade
  );

  const tipoQuestaoState = useSelectFieldStateDB<TipoQuestao>(
    questionType, 
    setQuestionType, 
    "Tipo de Questão", 
    fetchTiposQuestao, 
    addTipoQuestao, 
    updateTipoQuestao, 
    deleteTipoQuestao
  );

  return (
    <div className="space-y-6">
      {/* Primeira linha: Banca, Órgão, Ano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SelectFieldDB
            id="institution"
            label="Banca"
            value={bancaState.value}
            onChange={setInstitution}
            items={bancaState.items}
            loading={bancaState.loading}
            handleEditOption={bancaState.handleEdit}
            handleDeleteOption={bancaState.handleDelete}
            openAddDialog={() => bancaState.setIsDialogOpen(true)}
            isDialogOpen={bancaState.isDialogOpen}
            setIsDialogOpen={bancaState.setIsDialogOpen}
            newValue={bancaState.newValue}
            setNewValue={bancaState.setNewValue}
            handleAdd={bancaState.handleAdd}
            placeholder="Selecione a banca"
          />
        </div>

        <div>
          <SelectFieldDB
            id="organization"
            label="Órgão"
            value={instituicaoState.value}
            onChange={setOrganization}
            items={instituicaoState.items}
            loading={instituicaoState.loading}
            handleEditOption={instituicaoState.handleEdit}
            handleDeleteOption={instituicaoState.handleDelete}
            openAddDialog={() => instituicaoState.setIsDialogOpen(true)}
            isDialogOpen={instituicaoState.isDialogOpen}
            setIsDialogOpen={instituicaoState.setIsDialogOpen}
            newValue={instituicaoState.newValue}
            setNewValue={instituicaoState.setNewValue}
            handleAdd={instituicaoState.handleAdd}
            placeholder="Selecione o órgão"
          />
        </div>

        <div>
          <SelectFieldDB
            id="year"
            label="Ano"
            value={anoState.value}
            onChange={setYear}
            items={anoState.items}
            loading={anoState.loading}
            nameField="valor"
            handleEditOption={anoState.handleEdit}
            handleDeleteOption={anoState.handleDelete}
            openAddDialog={() => anoState.setIsDialogOpen(true)}
            isDialogOpen={anoState.isDialogOpen}
            setIsDialogOpen={anoState.setIsDialogOpen}
            newValue={anoState.newValue}
            setNewValue={anoState.setNewValue}
            handleAdd={anoState.handleAdd}
            placeholder="Selecione o ano"
          />
        </div>
      </div>

      {/* Segunda linha: Cargo, Disciplina, Nível */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SelectFieldDB
            id="role"
            label="Cargo"
            value={cargoState.value}
            onChange={setRole}
            items={cargoState.items}
            loading={cargoState.loading}
            handleEditOption={cargoState.handleEdit}
            handleDeleteOption={cargoState.handleDelete}
            openAddDialog={() => cargoState.setIsDialogOpen(true)}
            isDialogOpen={cargoState.isDialogOpen}
            setIsDialogOpen={cargoState.setIsDialogOpen}
            newValue={cargoState.newValue}
            setNewValue={cargoState.setNewValue}
            handleAdd={cargoState.handleAdd}
            placeholder="Selecione o cargo"
          />
        </div>

        <div>
          <SelectFieldDB
            id="discipline"
            label="Disciplina"
            value={disciplinaState.value}
            onChange={setDiscipline}
            items={disciplinaState.items}
            loading={disciplinaState.loading}
            handleEditOption={disciplinaState.handleEdit}
            handleDeleteOption={disciplinaState.handleDelete}
            openAddDialog={() => disciplinaState.setIsDialogOpen(true)}
            isDialogOpen={disciplinaState.isDialogOpen}
            setIsDialogOpen={disciplinaState.setIsDialogOpen}
            newValue={disciplinaState.newValue}
            setNewValue={disciplinaState.setNewValue}
            handleAdd={disciplinaState.handleAdd}
            placeholder="Selecione a disciplina"
          />
        </div>

        <div>
          <SelectFieldDB
            id="level"
            label="Nível"
            value={nivelState.value}
            onChange={setLevel}
            items={nivelState.items}
            loading={nivelState.loading}
            handleEditOption={nivelState.handleEdit}
            handleDeleteOption={nivelState.handleDelete}
            openAddDialog={() => nivelState.setIsDialogOpen(true)}
            isDialogOpen={nivelState.isDialogOpen}
            setIsDialogOpen={nivelState.setIsDialogOpen}
            newValue={nivelState.newValue}
            setNewValue={nivelState.setNewValue}
            handleAdd={nivelState.handleAdd}
            placeholder="Selecione o nível"
          />
        </div>
      </div>

      {/* Terceira linha: Dificuldade, Tipo de Questão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SelectFieldDB
            id="difficulty"
            label="Dificuldade"
            value={dificuldadeState.value}
            onChange={setDifficulty}
            items={dificuldadeState.items}
            loading={dificuldadeState.loading}
            handleEditOption={dificuldadeState.handleEdit}
            handleDeleteOption={dificuldadeState.handleDelete}
            openAddDialog={() => dificuldadeState.setIsDialogOpen(true)}
            isDialogOpen={dificuldadeState.isDialogOpen}
            setIsDialogOpen={dificuldadeState.setIsDialogOpen}
            newValue={dificuldadeState.newValue}
            setNewValue={dificuldadeState.setNewValue}
            handleAdd={dificuldadeState.handleAdd}
            placeholder="Selecione a dificuldade"
          />
        </div>

        <div>
          <SelectFieldDB
            id="questionType"
            label="Tipo de Questão"
            value={tipoQuestaoState.value}
            onChange={setQuestionType}
            items={tipoQuestaoState.items}
            loading={tipoQuestaoState.loading}
            handleEditOption={tipoQuestaoState.handleEdit}
            handleDeleteOption={tipoQuestaoState.handleDelete}
            openAddDialog={() => tipoQuestaoState.setIsDialogOpen(true)}
            isDialogOpen={tipoQuestaoState.isDialogOpen}
            setIsDialogOpen={tipoQuestaoState.setIsDialogOpen}
            newValue={tipoQuestaoState.newValue}
            setNewValue={tipoQuestaoState.setNewValue}
            handleAdd={tipoQuestaoState.handleAdd}
            placeholder="Selecione o tipo de questão"
          />
        </div>
      </div>

      {/* Assuntos Field - only shown when discipline is selected */}
      {discipline && (
        <div className="mt-4">
          <AssuntosField
            disciplina={discipline}
            assuntos={topicos}
            setAssuntos={setTopicos}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionMetadataFields;
