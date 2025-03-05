
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Disciplina } from "./types";

interface CriarEditalCardProps {
  disciplinasSelecionadas: Disciplina[];
  onSalvar: (titulo: string, cursoId: string) => void;
  onCancelar: () => void;
}

const CriarEditalCard: React.FC<CriarEditalCardProps> = ({ 
  disciplinasSelecionadas, 
  onSalvar, 
  onCancelar 
}) => {
  const [editalTitulo, setEditalTitulo] = useState("");
  const [cursoId, setCursoId] = useState("");

  const handleSalvar = () => {
    onSalvar(editalTitulo, cursoId);
    setEditalTitulo("");
    setCursoId("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Edital Verticalizado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="edital-titulo">Título do Edital</Label>
          <Input 
            id="edital-titulo" 
            value={editalTitulo} 
            onChange={(e) => setEditalTitulo(e.target.value)}
            placeholder="Digite o título do edital"
          />
        </div>
        <div>
          <Label htmlFor="curso-id">ID do Curso</Label>
          <Input 
            id="curso-id" 
            value={cursoId} 
            onChange={(e) => setCursoId(e.target.value)}
            placeholder="Digite o ID do curso"
          />
        </div>
        <div>
          <Label>Disciplinas Selecionadas</Label>
          <ul className="list-disc pl-5 mt-2">
            {disciplinasSelecionadas.map((d) => (
              <li key={d.id}>{d.titulo}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onCancelar}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSalvar}
          variant="hero"
        >
          Salvar Edital
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CriarEditalCard;
