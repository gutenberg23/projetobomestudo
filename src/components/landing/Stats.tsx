
import React from "react";

export const Stats = () => {
  const stats = [
    { number: "1.3M+", label: "questões disponíveis" },
    { number: "165K+", label: "vagas em concursos públicos em 2025" },
    { number: "5.000+", label: "aulas gratuitas" },
    { number: "97%", label: "dos aprovados usaram nossa plataforma" }
  ];

  return (
    <section className="w-full py-12 bg-[#5f2ebe]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-white">
              <span className="text-3xl md:text-4xl font-bold">{stat.number}</span>
              <span className="text-sm md:text-base text-white/80 text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
