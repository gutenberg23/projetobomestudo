import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dados fictícios para demonstração
const MOCK_FAVORITE_COURSES = [{
  id: "1",
  title: "Português para Concursos",
  description: "Aprenda todas as regras de português aplicadas aos concursos públicos",
  isFavorite: true
}, {
  id: "2",
  title: "Direito Tributário",
  description: "Curso completo de direito tributário para concursos federais",
  isFavorite: true
}];
const MOCK_FAVORITE_SUBJECTS = [{
  id: "1",
  title: "Direito Administrativo",
  description: "Tópicos essenciais de Direito Administrativo para concursos",
  isFavorite: true
}, {
  id: "2",
  title: "Arquivologia",
  description: "Principais temas de arquivologia para concursos de nível médio e superior",
  isFavorite: true
}];
interface ItemProps {
  id: string;
  title: string;
  description: string;
  onRemove: (id: string) => void;
}
const FavoriteItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  onRemove
}) => {
  return <div className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-80">
      <div className="flex-1">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(id)} className="ml-4" aria-label="Remover dos favoritos">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      </Button>
    </div>;
};
const MyCourses = () => {
  const [favoriteCourses, setFavoriteCourses] = useState(MOCK_FAVORITE_COURSES);
  const [favoriteSubjects, setFavoriteSubjects] = useState(MOCK_FAVORITE_SUBJECTS);
  const handleRemoveCourse = (id: string) => {
    setFavoriteCourses(favoriteCourses.filter(course => course.id !== id));
  };
  const handleRemoveSubject = (id: string) => {
    setFavoriteSubjects(favoriteSubjects.filter(subject => subject.id !== id));
  };
  return <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Meus Cursos</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Cursos</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-100">
                {favoriteCourses.length > 0 ? favoriteCourses.map(course => <FavoriteItem key={course.id} id={course.id} title={course.title} description={course.description} onRemove={handleRemoveCourse} />) : <div className="p-8 text-center text-gray-500">
                    Você ainda não adicionou nenhum curso aos favoritos.
                  </div>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Disciplinas</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-100">
                {favoriteSubjects.length > 0 ? favoriteSubjects.map(subject => <FavoriteItem key={subject.id} id={subject.id} title={subject.title} description={subject.description} onRemove={handleRemoveSubject} />) : <div className="p-8 text-center text-gray-500">
                    Você ainda não adicionou nenhuma disciplina aos favoritos.
                  </div>}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>;
};
export default MyCourses;