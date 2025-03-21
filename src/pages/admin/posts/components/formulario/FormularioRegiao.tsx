
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIOES, ESTADOS } from "../../types";
import { Region } from "@/components/blog/types";

interface FormularioRegiaoProps {
  regiao: Region | "";
  onChangeRegiao: (value: Region | "") => void;
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
  const estadosFiltrados = regiao 
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
              onChangeRegiao(value as Region | "");
              onChangeEstado("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma</SelectItem>
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
            disabled={!regiao || regiao === "federal" || regiao === "nacional"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
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
