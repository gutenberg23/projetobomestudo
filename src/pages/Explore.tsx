
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dados fictícios para demonstração
const MOCK_COURSES = [{
  id: "1",
  title: "Direito Constitucional Completo",
  description: "Curso completo de Direito Constitucional com foco em concursos públicos",
  isFavorite: false
}, {
  id: "2",
  title: "Português para Concursos",
  description: "Aprenda todas as regras de português aplicadas aos concursos públicos",
  isFavorite: true
}, {
  id: "3",
  title: "Matemática Financeira",
  description: "Curso completo de matemática financeira para provas bancárias",
  isFavorite: false
}];

const MOCK_SUBJECTS = [{
  id: "1",
  title: "Direito Administrativo",
  description: "Tópicos essenciais de Direito Administrativo para concursos",
  isFavorite: true
}, {
  id: "2",
  title: "Redação Oficial",
  description: "Regras e modelos para redação oficial em órgãos públicos",
  isFavorite: false
}, {
  id: "3",
  title: "Raciocínio Lógico",
  description: "Aprenda os principais tópicos de raciocínio lógico para concursos",
  isFavorite: false
}];

interface ItemProps {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const ResultItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-[#f6f8fa]">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-[#262f3c]">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onToggleFavorite(id)} 
        className="ml-4" 
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Star className={`h-5 w-5 ${isFavorite ? "fill-[#ea2be2] text-[#ea2be2]" : "text-gray-400"}`} />
      </Button>
    </div>
  );
};

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjects, setShowSubjects] = useState(false);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);

  const handleToggleFavorite = (id: string) => {
    if (showSubjects) {
      setSubjects(subjects.map(subject => 
        subject.id === id ? { ...subject, isFavorite: !subject.isFavorite } : subject
      ));
    } else {
      setCourses(courses.map(course => 
        course.id === id ? { ...course, isFavorite: !course.isFavorite } : course
      ));
    }
  };

  const filteredData = showSubjects 
    ? subjects.filter(subject => subject.title.toLowerCase().includes(searchTerm.toLowerCase())) 
    : courses.filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-[35px] font-bold mb-6 text-[#262f3c]">Explorar</h1>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center flex-1 relative">
            <Input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pr-10 w-full"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!showSubjects ? "font-medium" : ""}`}>
              Cursos
            </span>
            <Switch 
              checked={showSubjects} 
              onCheckedChange={setShowSubjects} 
              aria-label="Alternar entre cursos e disciplinas" 
            />
            <span className={`text-sm ${showSubjects ? "font-medium" : ""}`}>
              Disciplinas
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <ResultItem 
                  key={item.id} 
                  id={item.id} 
                  title={item.title} 
                  description={item.description} 
                  isFavorite={item.isFavorite} 
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Nenhum resultado encontrado para "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
