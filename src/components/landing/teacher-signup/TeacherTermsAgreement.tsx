
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface TeacherTermsAgreementProps {
  aceitouTermos: boolean;
  handleCheckboxChange: (checked: boolean) => void;
}

export const TeacherTermsAgreement: React.FC<TeacherTermsAgreementProps> = ({
  aceitouTermos,
  handleCheckboxChange
}) => {
  return (
    <div className="flex items-start space-x-2 pt-2">
      <Checkbox 
        id="termos" 
        checked={aceitouTermos}
        onCheckedChange={handleCheckboxChange}
        className="data-[state=checked]:bg-[#2a8e9e] data-[state=checked]:border-[#2a8e9e] mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="termos"
          className="text-sm font-medium leading-none text-[#022731] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Aceito os termos e condições
        </label>
        <p className="text-xs text-[#022731]/70">
          Ao clicar, você concorda com nossos <Link to="/termos-e-politicas" className="text-[#2a8e9e] hover:underline">Termos de Serviço e Política de Privacidade</Link>, e autoriza o uso de seus dados para o processo de cadastro.
        </p>
      </div>
    </div>
  );
};
