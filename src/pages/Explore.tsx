
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Explore = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[88px] px-4">
        <div className="w-full max-w-full mx-auto py-8">
          <h1 className="text-3xl font-bold text-[#272f3c] mb-6">Explorar Cursos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img 
                    src={`https://picsum.photos/seed/${item}/600/300`}
                    alt={`Curso ${item}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="text-yellow-400 hover:text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#272f3c] mb-2">Curso de Exemplo {item}</h3>
                  <div className="flex justify-between text-[#67748a] text-sm mb-4">
                    <span>Tópicos: 24</span>
                    <span>Aulas: 42</span>
                  </div>
                  <p className="text-[#67748a] mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                  <button className="w-full py-2 bg-[#ea2be2] text-white rounded-md hover:bg-opacity-90 transition-colors">
                    Começar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
