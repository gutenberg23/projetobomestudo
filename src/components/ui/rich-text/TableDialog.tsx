
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (rows: number, cols: number) => void;
}

const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  setIsOpen,
  onConfirm,
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(rows, cols);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserir Tabela</DialogTitle>
          <DialogDescription>
            Defina o número de linhas e colunas para a tabela.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rows" className="col-span-1">
                Linhas
              </Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={20}
                className="col-span-3"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value, 10) || 2)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cols" className="col-span-1">
                Colunas
              </Label>
              <Input
                id="cols"
                type="number"
                min={1}
                max={10}
                className="col-span-3"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value, 10) || 2)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Inserir Tabela</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableDialog;
