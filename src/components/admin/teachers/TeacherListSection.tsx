
import React from "react";
import { TeacherList } from "./";
import TeacherPagination from "./TeacherPagination";
import { TeacherData } from "./types";

interface TeacherListSectionProps {
  paginatedTeachers: TeacherData[];
  filteredTeachers: TeacherData[];
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  onEdit: (teacher: TeacherData) => void;
  onDelete: (teacher: TeacherData) => void;
  onViewDetails: (teacher: TeacherData) => void;
  onToggleActive: (teacher: TeacherData) => void;
  onPageChange: (page: number) => void;
}

export const TeacherListSection: React.FC<TeacherListSectionProps> = ({
  paginatedTeachers,
  filteredTeachers,
  paginaAtual,
  totalPaginas,
  indiceInicial,
  indiceFinal,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleActive,
  onPageChange
}) => {
  return (
    <div className="space-y-4">
      {/* Tabela de professores */}
      <TeacherList 
        teachers={paginatedTeachers}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onToggleActive={onToggleActive}
      />
      
      {/* Paginação */}
      {filteredTeachers.length > 0 && (
        <TeacherPagination
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          indiceInicial={indiceInicial}
          indiceFinal={indiceFinal}
          totalItens={filteredTeachers.length}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default TeacherListSection;
