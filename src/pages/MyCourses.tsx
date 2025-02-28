
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DonutChart } from "@/components/course/utils/donutChart";
import { Link } from "react-router-dom";

const MyCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Português para Concursos",
      progress: 75,
      topics: 18,
      lessons: 36,
      lastAccessed: "2 dias atrás",
      image: "https://picsum.photos/seed/1/600/300"
    },
    {
      id: 2,
      title: "Matemática Básica",
      progress: 45,
      topics: 14,
      lessons: 28,
      lastAccessed: "5 dias atrás",
      image: "https://picsum.photos/seed/2/600/300"
    },
    {
      id: 3,
      title: "Direito Constitucional",
      progress: 30,
      topics: 20,
      lessons: 42,
      lastAccessed: "1 semana atrás",
      image: "https://picsum.photos/seed/3/600/300"
    },
    {
      id: 4,
      title: "Raciocínio Lógico",
      progress: 60,
      topics: 12,
      lessons: 24,
      lastAccessed: "3 dias atrás",
      image: "https://picsum.photos/seed/4/600/300"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[88px] px-4">
        <div className="w-full max-w-full mx-auto py-8">
          <h1 className="text-3xl font-bold text-[#272f3c] mb-6">Meus Cursos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="text-yellow-400 hover:text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-[#272f3c]">{course.title}</h3>
                    <div className="ml-2">
                      <DonutChart percentage={course.progress} size={50} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[#67748a] text-sm mb-4">
                    <span>Tópicos: {course.topics}</span>
                    <span>Aulas: {course.lessons}</span>
                  </div>
                  <p className="text-[#67748a] text-sm mb-4">
                    Último acesso: {course.lastAccessed}
                  </p>
                  <Link to="/course">
                    <button className="w-full py-2 bg-[#ea2be2] text-white rounded-md hover:bg-opacity-90 transition-colors">
                      Continuar Estudando
                    </button>
                  </Link>
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

export default MyCourses;
