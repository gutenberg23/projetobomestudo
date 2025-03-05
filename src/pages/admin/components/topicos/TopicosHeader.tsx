
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TopicosHeaderProps {
  setIsOpenCreate: (open: boolean) => void;
}

export const TopicosHeader: React.FC<TopicosHeaderProps> = ({
  setIsOpenCreate
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Tópicos</h1>
        <p className="text-[#67748a]">Gerenciamento de tópicos das aulas</p>
      </div>
      <Button 
        onClick={() => setIsOpenCreate(true)}
        variant="hero"
      >
        <Plus className="mr-2 h-4 w-4" /> Novo Tópico
      </Button>
    </div>
  );
};
