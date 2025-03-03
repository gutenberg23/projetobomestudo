
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (rows: number, cols: number) => void;
}

const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  setIsOpen,
  onConfirm
}) => {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  const handleConfirm = () => {
    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);
    
    if (!isNaN(numRows) && !isNaN(numCols) && numRows > 0 && numCols > 0) {
      onConfirm(numRows, numCols);
      setIsOpen(false);
      // Reset form
      setRows("3");
      setCols("3");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Tabela</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="rows" className="text-sm font-medium text-[#272f3c]">
              Número de Linhas
            </label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="10"
              placeholder="Linhas"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cols" className="text-sm font-medium text-[#272f3c]">
              Número de Colunas
            </label>
            <Input
              id="cols"
              type="number"
              min="1"
              max="10"
              placeholder="Colunas"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white">
            Inserir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableDialog;
