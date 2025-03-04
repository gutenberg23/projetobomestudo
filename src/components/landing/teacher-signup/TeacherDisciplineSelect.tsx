
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeacherDisciplineSelectProps {
  disciplina: string;
  handleDisciplinaChange: (value: string) => void;
  disciplinas: string[];
}

export const TeacherDisciplineSelect: React.FC<TeacherDisciplineSelectProps> = ({
  disciplina,
  handleDisciplinaChange,
  disciplinas
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="disciplina" className="text-[#022731]">Disciplina*</Label>
      <Select
        value={disciplina}
        onValueChange={handleDisciplinaChange}
      >
        <SelectTrigger className="border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
          <SelectValue placeholder="Selecione sua disciplina principal" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {disciplinas.map((disciplina) => (
            <SelectItem key={disciplina} value={disciplina}>
              {disciplina}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
