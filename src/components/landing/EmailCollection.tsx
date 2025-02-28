
import React from "react";
import { Mail } from "lucide-react";

export const EmailCollection = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center">
        <Mail className="w-12 h-12 text-[#ea2be2] mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c] mb-4">
          Inscreva-se em nossa newsletter
        </h2>
        <p className="text-[#67748a] mb-8">
          Fique por dentro das novidades, atualizações de questões e dicas para concursos.
        </p>
        <form className="flex flex-col md:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Digite seu email"
            className="px-6 py-4 rounded-lg border border-gray-300 flex-1 max-w-md"
          />
          <button
            type="submit"
            className="bg-[#ea2be2] text-white px-8 py-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Inscrever-se
          </button>
        </form>
      </div>
    </div>
  );
};
