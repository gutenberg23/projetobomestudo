import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface AIPromptCardProps {
  aiPrompt: string;
  setAIPrompt: (value: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const AIPromptCard: React.FC<AIPromptCardProps> = ({
  aiPrompt,
  setAIPrompt,
  onGenerate,
  isGenerating = false
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[#272f3c]">Prompt para a IA</Label>
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {isGenerating ? "Gerando..." : "Gerar Resposta com IA"}
          </Button>
        </div>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAIPrompt(e.target.value)}
          placeholder="Digite o prompt que a IA utilizará para gerar a resposta..."
          className="min-h-[100px]"
        />
      </div>
    </Card>
  );
}; 