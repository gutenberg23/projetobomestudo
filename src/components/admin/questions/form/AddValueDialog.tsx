import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} />
          <Button onClick={onAdd}>Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default AddValueDialog;