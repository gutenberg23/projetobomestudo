
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DisciplineSectionProps {
  disciplina: string;
  handleDisciplinaChange: (value: string) => void;
  disciplinas: string[];
}

export const DisciplineSection: React.FC<DisciplineSectionProps> = ({
  disciplina,
  handleDisciplinaChange,
  disciplinas
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="disciplina" className="text-[#272f3c]">Disciplina*</Label>
      <Select
        value={disciplina}
        onValueChange={handleDisciplinaChange}
      >
        <SelectTrigger className="border-[#ea2be2]/30 focus:ring-[#ea2be2]">
          <SelectValue placeholder="Selecione a disciplina" />
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
