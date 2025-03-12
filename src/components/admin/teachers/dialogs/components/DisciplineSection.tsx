
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DisciplineSectionProps {
  disciplina: string;
  handleDisciplinaChange: (value: string) => void;
}

export const DisciplineSection: React.FC<DisciplineSectionProps> = ({
  disciplina,
  handleDisciplinaChange
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDisciplinaChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="disciplina" className="text-[#272f3c]">Disciplina*</Label>
      <Input
        id="disciplina"
        name="disciplina"
        value={disciplina}
        onChange={handleInputChange}
        placeholder="Digite a disciplina"
        className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
        required
      />
    </div>
  );
};
