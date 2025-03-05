
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface DashboardHeaderProps {
  periodoSelecionado: string;
  handleChangePeriodo: (value: string) => void;
  exportarDados: (formato: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  periodoSelecionado,
  handleChangePeriodo,
  exportarDados
}) => {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Dashboard</h1>
        <p className="text-[#67748a]">Visão geral das assinaturas e receitas</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select defaultValue={periodoSelecionado} onValueChange={handleChangePeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Últimas 24 horas</SelectItem>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-[#67748a]">Atualizado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportarDados('csv')} className="w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarDados('pdf')} className="w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </>
  );
};
