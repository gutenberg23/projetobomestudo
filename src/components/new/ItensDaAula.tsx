"use client";

import * as React from "react";
import { ButtonContainer } from "./ButtonContainer";
interface ItensDaAulaProps {
  setShowQuestions: () => void;
  showQuestions: boolean;
}
const ItensDaAula: React.FC<ItensDaAulaProps> = ({
  setShowQuestions,
  showQuestions
}) => {
  return <main className="flex justify-between mt-5 w-full text-base font-medium text-center min-h-[74px] text-slate-800 max-md:max-w-full px-0 mx-0">
      <ButtonContainer setShowQuestions={setShowQuestions} showQuestions={showQuestions} />
    </main>;
};
export default ItensDaAula;