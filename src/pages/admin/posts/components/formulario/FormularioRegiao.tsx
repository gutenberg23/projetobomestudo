import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIOES, ESTADOS } from "../../types";
import { Region } from "@/components/blog/types";

interface FormularioRegiaoProps {
  regiao: Region | "none";
  onChangeRegiao: (value: Region | "none") => void;
  estado: string;
  onChangeEstado: (value: string) => void;
}

export const FormularioRegiao: React.FC<FormularioRegiaoProps> = ({
  regiao,
  onChangeRegiao,
  estado,
  onChangeEstado
}) => {
  // Filtrar estados por região selecionada
  const estadosFiltrados = regiao && regiao !== "none"
    ? ESTADOS.filter(estado => estado.region === regiao) 
    : ESTADOS;

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Regionalização</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="regiao">Região</Label>
          <Select 
            value={regiao} 
            onValueChange={(value) => {
              onChangeRegiao(value as Region | "none");
              onChangeEstado("none");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {REGIOES.map(reg => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select 
            value={estado} 
            onValueChange={onChangeEstado}
            disabled={!regiao || regiao === "none" || regiao === "federal" || regiao === "nacional"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {estadosFiltrados.map(estado => (
                <SelectItem key={estado.id} value={estado.value}>{estado.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
