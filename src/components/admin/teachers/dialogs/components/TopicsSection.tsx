
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopicsSectionProps {
  availableTopics: string[];
  selectedTopics: string[];
  topicVideos: Record<string, string>;
  handleTopicToggle: (topic: string) => void;
  handleVideoLinkChange: (topic: string, value: string) => void;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({
  availableTopics,
  selectedTopics,
  topicVideos,
  handleTopicToggle,
  handleVideoLinkChange
}) => {
  if (availableTopics.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <Label className="text-[#272f3c]">Tópicos</Label>
      <div className="border rounded-md p-3 border-[#ea2be2]/30 max-h-[250px] overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[#272f3c] pb-2 w-1/2">Tópico</th>
              <th className="text-left text-[#272f3c] pb-2 w-1/2">Link do Vídeo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ea2be2]/10">
            {availableTopics.map((topic) => (
              <tr key={topic}>
                <td className="py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`topic-${topic}`}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicToggle(topic)}
                      className="data-[state=checked]:bg-[#ea2be2] data-[state=checked]:border-[#ea2be2]"
                    />
                    <label
                      htmlFor={`topic-${topic}`}
                      className="text-sm font-medium leading-none text-[#272f3c] cursor-pointer"
                    >
                      {topic}
                    </label>
                  </div>
                </td>
                <td className="py-2">
                  <Input
                    type="text"
                    placeholder="Link do vídeo"
                    disabled={!selectedTopics.includes(topic)}
                    value={topicVideos[topic] || ''}
                    onChange={(e) => handleVideoLinkChange(topic, e.target.value)}
                    className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2] text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#67748a]">
        Selecione os tópicos e adicione links dos vídeos correspondentes
      </p>
    </div>
  );
};
