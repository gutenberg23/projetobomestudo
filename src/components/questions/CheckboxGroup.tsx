import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
interface CheckboxGroupProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
}
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="space-y-2">
      <Button variant="outline" className="w-full flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      {isOpen && <div className="bg-white border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-overlay">
          {options.map(option => <div key={option} className="flex items-center space-x-2">
              <Checkbox id={`${title}-${option}`} checked={selectedValues.includes(option)} onCheckedChange={() => onChange(option)} />
              <Label htmlFor={`${title}-${option}`} className="text-sm font-normal cursor-pointer">
                {option}
              </Label>
            </div>)}
        </div>}
    </div>;
};