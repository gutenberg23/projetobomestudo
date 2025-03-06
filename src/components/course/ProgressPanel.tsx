
import React from "react";

interface ProgressPanelProps {
  courseId?: string;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ courseId }) => {
  // Aqui poderíamos fazer uma chamada para API para buscar o progresso do curso
  console.log("Carregando progresso para o curso:", courseId);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-fit sticky top-24">
      <h2 className="text-[#272f3c] font-bold text-xl mb-4">Seu Progresso</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-[#67748a]">Progresso Geral</span>
          <span className="text-sm font-medium text-[#5f2ebe]">45%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[#5f2ebe] h-2 rounded-full" style={{ width: "45%" }}></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-[#67748a]">Aulas Assistidas</span>
            <span className="text-sm font-medium text-[#5f2ebe]">25/56</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#5f2ebe] h-2 rounded-full" style={{ width: "45%" }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-[#67748a]">Questões Respondidas</span>
            <span className="text-sm font-medium text-[#5f2ebe]">120/350</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#5f2ebe] h-2 rounded-full" style={{ width: "34%" }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-[#67748a]">Simulados Realizados</span>
            <span className="text-sm font-medium text-[#5f2ebe]">3/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#5f2ebe] h-2 rounded-full" style={{ width: "30%" }}></div>
          </div>
        </div>
      </div>
      
      <hr className="my-6" />
      
      <div>
        <h3 className="text-[#272f3c] font-bold text-md mb-3">Próximas Aulas</h3>
        <ul className="space-y-3">
          <li className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#272f3c] truncate">Português: Concordância Verbal</p>
              <p className="text-xs text-[#67748a]">Duração: 45min</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ede7f9] text-[#5f2ebe]">
                Continuar
              </span>
            </div>
          </li>
          
          <li className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#272f3c] truncate">Matemática: Frações</p>
              <p className="text-xs text-[#67748a]">Duração: 60min</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Iniciar
              </span>
            </div>
          </li>
          
          <li className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#272f3c] truncate">Direito Constitucional: Princípios</p>
              <p className="text-xs text-[#67748a]">Duração: 50min</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Iniciar
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
