import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddValueDialogProps {
  title: string;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  onAdd: () => void;
}

const AddValueDialog: React.FC<AddValueDialogProps> = ({
  title,
  placeholder,
  isOpen,
  setIsOpen,
  value,
  setValue,
  onAdd
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input 
            placeholder={placeholder} 
            value={value} 
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex justify-end">
            <Button onClick={onAdd} type="button">Adicionar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddValueDialog;