
"use client";
import * as React from "react";
import { ActionButton } from "./ActionButton";

interface ButtonContainerProps {
  setShowQuestions: (show: boolean) => void;
  showQuestions: boolean;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  setShowQuestions,
  showQuestions,
}) => {
  const actions = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/cae9c4d3717db96e49b6d5919e8d22c653723a2bdc1bb9f06cec9c80cadcdbca",
      label: "Aula em PDF",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/5b9589ed54e185ca7e13dc13f742fa63f18d357808ad50d541771541ea74d405",
      label: "Caderno de Questões",
      variant: "highlight" as const,
      onClick: () => setShowQuestions(!showQuestions),
      isActive: showQuestions,
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/0cbc11d07a84c70a35420fb798828f25137d07530099d2e7d11e2509cbde2562",
      label: "Mapa Mental",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/35b7e347587d64339dab9fae7a0c3592d114ca547896560cae6aab5eeeb27f51",
      label: "Resumo",
    },
  ];

  return (
    <section className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 items-center px-5 py-2.5 rounded-xl border border-gray-100 border-solid basis-0 bg-slate-50 min-w-60 size-full max-md:max-w-full">
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          label={action.label}
          variant={action.variant}
          isActive={action.isActive}
          onClick={action.onClick}
        />
      ))}
    </section>
  );
};
