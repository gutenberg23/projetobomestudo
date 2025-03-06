import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, Link } from "react-router-dom";

// Dados fictícios para demonstração
const MOCK_COURSES = [{
  id: "portugues",
  title: "Português para Concursos",
  description: "Aprenda todas as regras de português aplicadas aos concursos públicos",
  isFavorite: false,
  topics: 15,
  lessons: 30
}, {
  id: "matematica",
  title: "Matemática Financeira",
  description: "Curso completo de matemática financeira para provas bancárias",
  isFavorite: true,
  topics: 12,
  lessons: 24
}, {
  id: "direito",
  title: "Direito Constitucional",
  description: "Curso completo de direito constitucional para concursos públicos",
  isFavorite: false,
  topics: 8,
  lessons: 16
}];
const MOCK_SUBJECTS = [{
  id: "direito-administrativo",
  title: "Direito Administrativo",
  description: "Tópicos essenciais de Direito Administrativo para concursos",
  isFavorite: true,
  topics: 10,
  lessons: 20
}, {
  id: "redacao-oficial",
  title: "Redação Oficial",
  description: "Regras e modelos para redação oficial em órgãos públicos",
  isFavorite: false,
  topics: 6,
  lessons: 12
}, {
  id: "raciocinio-logico",
  title: "Raciocínio Lógico",
  description: "Aprenda os principais tópicos de raciocínio lógico para concursos",
  isFavorite: false,
  topics: 9,
  lessons: 18
}];
interface ItemProps {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  topics: number;
  lessons: number;
  onToggleFavorite: (id: string) => void;
}
const ResultItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  isFavorite,
  topics,
  lessons,
  onToggleFavorite
}) => {
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1">
        <Link to={`/course/${id}`} className="hover:text-[#5f2ebe] transition-colors">
          <h3 className="text-[#272f3c] mb-0 leading-none text-xl font-extralight">{title}</h3>
        </Link>
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-[#262f3c]">Tópicos: <span className="text-gray-600 font-normal">{topics}</span></p>
          <p className="text-sm font-bold text-[#262f3c]">Aulas: <span className="text-gray-600 font-normal">{lessons}</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(id)} aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
          <Star className={`h-5 w-5 ${isFavorite ? "fill-[#ea2be2] text-[#ea2be2]" : "text-gray-400"}`} />
        </Button>
      </div>
    </div>;
};
const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjects, setShowSubjects] = useState(false);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair parâmetro de pesquisa da URL quando a página carrega
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);
  const handleToggleFavorite = (id: string) => {
    if (showSubjects) {
      setSubjects(subjects.map(subject => subject.id === id ? {
        ...subject,
        isFavorite: !subject.isFavorite
      } : subject));
    } else {
      setCourses(courses.map(course => course.id === id ? {
        ...course,
        isFavorite: !course.isFavorite
      } : course));
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
    }
  };
  const filteredData = showSubjects ? subjects.filter(subject => subject.title.toLowerCase().includes(searchTerm.toLowerCase())) : courses.filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <h1 className="text-3xl mb-2 md:text-3xl font-extrabold text-[#272f3c]">Explorar</h1>
        <p className="text-[#67748a] mb-6">Pesquise por concursos ou disciplinas do seu interesse</p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center flex-1 relative">
            <form onSubmit={handleSearch} className="w-full flex">
              <Input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pr-10 w-full" />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!showSubjects ? "font-medium" : ""}`}>Concursos</span>
            <Switch checked={showSubjects} onCheckedChange={setShowSubjects} aria-label="Alternar entre cursos e disciplinas" />
            <span className={`text-sm ${showSubjects ? "font-medium" : ""}`}>
              Disciplinas
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredData.length > 0 ? filteredData.map(item => <ResultItem key={item.id} id={item.id} title={item.title} description={item.description} isFavorite={item.isFavorite} topics={item.topics} lessons={item.lessons} onToggleFavorite={handleToggleFavorite} />) : <div className="p-8 text-center text-gray-500">
                Nenhum resultado encontrado para "{searchTerm}"
              </div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Explore;