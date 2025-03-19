
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormularioBasicoProps {
  titulo: string;
  onChangeTitulo: (value: string) => void;
  resumo: string;
  onChangeResumo: (value: string) => void;
  categoria: string;
  onChangeCategoria: (value: string) => void;
  tempoLeitura: string;
  onChangeTempoLeitura: (value: string) => void;
}

export const FormularioBasico: React.FC<FormularioBasicoProps> = ({
  titulo,
  onChangeTitulo,
  resumo,
  onChangeResumo,
  categoria,
  onChangeCategoria,
  tempoLeitura,
  onChangeTempoLeitura
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Informações Básicas</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input 
            id="titulo" 
            value={titulo} 
            onChange={(e) => onChangeTitulo(e.target.value)} 
            placeholder="Título do post"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resumo">Resumo</Label>
          <Input 
            id="resumo" 
            value={resumo} 
            onChange={(e) => onChangeResumo(e.target.value)} 
            placeholder="Breve resumo do post"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Input 
            id="categoria" 
            value={categoria} 
            onChange={(e) => onChangeCategoria(e.target.value)} 
            placeholder="Categoria do post"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempoLeitura">Tempo de leitura (minutos)</Label>
          <Input 
            id="tempoLeitura" 
            type="number" 
            value={tempoLeitura} 
            onChange={(e) => onChangeTempoLeitura(e.target.value)} 
            placeholder="Estimativa do tempo de leitura em minutos"
          />
          <p className="text-xs text-[#67748a]">Deixe vazio para calcular automaticamente.</p>
        </div>
      </div>
    </div>
  );
};
