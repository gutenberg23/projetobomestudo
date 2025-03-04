
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TeacherTopicsListProps {
  topicosDisponiveis: string[];
  topicosSelecionados: string[];
  linksVideos: Record<string, string>;
  handleTopicoToggle: (topico: string) => void;
  handleLinkVideoChange: (topico: string, valor: string) => void;
}

export const TeacherTopicsList: React.FC<TeacherTopicsListProps> = ({
  topicosDisponiveis,
  topicosSelecionados,
  linksVideos,
  handleTopicoToggle,
  handleLinkVideoChange
}) => {
  if (topicosDisponiveis.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="topicos" className="text-[#022731]">Tópicos da Disciplina</Label>
      <div className="border rounded-md border-[#2a8e9e]/30 p-4 max-h-[250px] overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pb-2 text-[#022731] w-1/2">Tópico</th>
              <th className="text-left pb-2 text-[#022731] w-1/2">Link do Vídeo</th>
            </tr>
          </thead>
          <tbody>
            {topicosDisponiveis.map((topico) => (
              <tr key={topico} className="border-t border-[#2a8e9e]/10">
                <td className="py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`topico-${topico}`}
                      checked={topicosSelecionados.includes(topico)}
                      onCheckedChange={() => handleTopicoToggle(topico)}
                      className="data-[state=checked]:bg-[#2a8e9e] data-[state=checked]:border-[#2a8e9e]"
                    />
                    <Label 
                      htmlFor={`topico-${topico}`}
                      className="text-sm text-[#022731] cursor-pointer"
                    >
                      {topico}
                    </Label>
                  </div>
                </td>
                <td className="py-2">
                  <Input
                    type="url"
                    placeholder="https://youtu.be/exemplo"
                    disabled={!topicosSelecionados.includes(topico)}
                    value={linksVideos[topico] || ''}
                    onChange={(e) => handleLinkVideoChange(topico, e.target.value)}
                    className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#022731]/60">
        Selecione os tópicos que você leciona e adicione links para seus vídeos sobre cada um.
      </p>
    </div>
  );
};
