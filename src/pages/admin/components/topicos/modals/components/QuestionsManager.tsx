
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QuestionsManagerProps {
  questoesIds: string[];
  newQuestaoId: string;
  setNewQuestaoId: (id: string) => void;
  addQuestaoId: () => void;
  removeQuestaoId: (index: number) => void;
}

export const QuestionsManager: React.FC<QuestionsManagerProps> = ({
  questoesIds,
  newQuestaoId,
  setNewQuestaoId,
  addQuestaoId,
  removeQuestaoId
}) => {
  return (
    <div className="space-y-2">
      <Label>IDs das Questões</Label>
      <div className="flex gap-2">
        <Input
          value={newQuestaoId}
          onChange={(e) => setNewQuestaoId(e.target.value)}
          placeholder="Digite o ID da questão"
        />
        <Button 
          type="button" 
          onClick={addQuestaoId}
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
        >
          Adicionar
        </Button>
      </div>
      
      {questoesIds.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-medium">Questões Adicionadas:</p>
          <div className="flex flex-wrap gap-2">
            {questoesIds.map((id, index) => (
              <div 
                key={index}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              >
                <span className="text-sm">ID: {id}</span>
                <button
                  onClick={() => removeQuestaoId(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
