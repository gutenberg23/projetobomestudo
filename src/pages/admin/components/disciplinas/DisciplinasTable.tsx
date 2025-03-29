import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash, Heart, List } from "lucide-react";
import { DisciplinasTableProps } from "./DisciplinasTypes";
import { AulasExpandidas } from "./AulasExpandidas";

export const DisciplinasTable: React.FC<DisciplinasTableProps> = ({
  disciplinas,
  todasSelecionadas,
  handleSelecaoTodas,
  handleSelecaoDisciplina,
  openEditModal,
  openDeleteModal
}) => {
  const [disciplinaExpandida, setDisciplinaExpandida] = useState<string | null>(null);

  return <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <div className="flex items-center">
                <Checkbox checked={todasSelecionadas} onCheckedChange={handleSelecaoTodas} />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[200px]">Nota de rating</TableHead>
            <TableHead className="w-[200px]">Banca</TableHead>
            <TableHead className="w-[120px]">Nº de Aulas</TableHead>
            <TableHead className="w-[120px]">Nº de Tópicos</TableHead>
            <TableHead className="w-[120px]">Nº de Questões</TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-[#ea2be2]" />
                Favoritos
              </div>
            </TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disciplinas.length > 0 ? disciplinas.map(disciplina => <React.Fragment key={disciplina.id}>
                <TableRow>
                  <TableCell>
                    <Checkbox checked={disciplina.selecionada} onCheckedChange={() => handleSelecaoDisciplina(disciplina.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{disciplina.id}</TableCell>
                  <TableCell>{disciplina.titulo}</TableCell>
                  <TableCell>{disciplina.descricao}</TableCell>
                  <TableCell>{disciplina.banca || "Não informada"}</TableCell>
                  <TableCell>{disciplina.aulasIds.length} aulas</TableCell>
                  <TableCell>{disciplina.topicosIds?.length || 0} tópicos</TableCell>
                  <TableCell>{disciplina.questoesIds?.length || 0} questões</TableCell>
                  <TableCell>{disciplina.favoritos || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => openEditModal(disciplina)} variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => openDeleteModal(disciplina)} variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => setDisciplinaExpandida(disciplina.id)} 
                        variant="outline" 
                        size="sm"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {disciplinaExpandida === disciplina.id && (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0">
                      <AulasExpandidas
                        disciplinaId={disciplina.id}
                        aulasIds={disciplina.aulasIds}
                        onClose={() => setDisciplinaExpandida(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>) : <TableRow>
              <TableCell colSpan={10} className="text-center py-4 text-[#67748a]">
                Nenhuma disciplina encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>}
        </TableBody>
      </Table>
    </div>;
};
