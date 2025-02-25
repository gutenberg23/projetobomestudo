
import React from "react";
import { cn } from "@/lib/utils";

type Subject = {
  id: number;
  name: string;
  topics: {
    id: number;
    name: string;
    isDone: boolean;
    importance: 1 | 2 | 3 | 4 | 5;
    difficulty: "Muito Difícil" | "Difícil" | "Médio" | "Fácil" | "Muito Fácil";
    exercisesDone: number;
    hits: number;
    errors: number;
    performance: number;
  }[];
};

const subjects: Subject[] = [
  {
    id: 1,
    name: "Língua Portuguesa",
    topics: [
      {
        id: 0,
        name: "Ortografia.",
        isDone: true,
        importance: 5,
        difficulty: "Muito Difícil",
        exercisesDone: 0,
        hits: 0,
        errors: 0,
        performance: 0,
      },
      {
        id: 1,
        name: "Morfologia. Classes de palavras: substantivos, adjetivos, artigos, numerais, advérbios e interjeições.",
        isDone: false,
        importance: 3,
        difficulty: "Fácil",
        exercisesDone: 0,
        hits: 0,
        errors: 0,
        performance: 0,
      }
    ]
  },
  {
    id: 2,
    name: "Direito Constitucional",
    topics: [
      {
        id: 0,
        name: "Aplicabilidade das Normas Constitucionais.",
        isDone: true,
        importance: 4,
        difficulty: "Médio",
        exercisesDone: 0,
        hits: 0,
        errors: 0,
        performance: 0,
      }
    ]
  }
];

const ImportanceStars = ({ level }: { level: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            "text-[#F11CE3]",
            star <= level ? "opacity-100" : "opacity-20"
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const EditorializedView = () => {
  return (
    <div className="bg-white rounded-[10px] p-5">
      {subjects.map((subject) => (
        <div key={subject.id} className="mb-8 last:mb-0">
          <div className="flex items-center gap-2 bg-[#9747FF] text-white p-3 rounded-t-lg">
            <div className="w-5 h-5 bg-white/20 rounded" />
            <h2 className="text-lg font-semibold">{subject.name}</h2>
          </div>
          <div className="border border-gray-200 rounded-b-lg overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-600">
                  <th className="py-3 px-4 text-left font-medium w-8">#</th>
                  <th className="py-3 px-4 text-left font-medium">Conclusão</th>
                  <th className="py-3 px-4 text-left font-medium">Importância do Assunto</th>
                  <th className="py-3 px-4 text-left font-medium">Dificuldade</th>
                  <th className="py-3 px-4 text-center font-medium">Total Exercícios feitos</th>
                  <th className="py-3 px-4 text-center font-medium">Acertos</th>
                  <th className="py-3 px-4 text-center font-medium">Erros</th>
                  <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
                </tr>
              </thead>
              <tbody>
                {subject.topics.map((topic) => (
                  <tr key={topic.id} className="border-t border-gray-200">
                    <td className="py-3 px-4">{topic.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={topic.isDone}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-[#F11CE3] focus:ring-[#F11CE3]"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <ImportanceStars level={topic.importance} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-sm",
                        topic.difficulty === "Muito Difícil" && "bg-red-100 text-red-700",
                        topic.difficulty === "Difícil" && "bg-orange-100 text-orange-700",
                        topic.difficulty === "Médio" && "bg-yellow-100 text-yellow-700",
                        topic.difficulty === "Fácil" && "bg-green-100 text-green-700",
                        topic.difficulty === "Muito Fácil" && "bg-blue-100 text-blue-700"
                      )}>
                        {topic.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{topic.exercisesDone}</td>
                    <td className="py-3 px-4 text-center">{topic.hits}</td>
                    <td className="py-3 px-4 text-center">{topic.errors}</td>
                    <td className="py-3 px-4 text-center">{topic.performance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
