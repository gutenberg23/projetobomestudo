
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
  isFavorite: true,
  topics: 12,
  lessons: 24
}, {
  id: "2",
  title: "Direito Tributário",
  description: "Curso completo de direito tributário para concursos federais",
  isFavorite: true,
  topics: 16,
  lessons: 35
}];
const MOCK_FAVORITE_SUBJECTS = [{
  id: "1",
  title: "Direito Administrativo",
  description: "Tópicos essenciais de Direito Administrativo para concursos",
  isFavorite: true,
  topics: 8,
  lessons: 16
}, {
  id: "2",
  title: "Arquivologia",
  description: "Principais temas de arquivologia para concursos de nível médio e superior",
  isFavorite: true,
  topics: 9,
  lessons: 18
}];
interface ItemProps {
  id: string;
  title: string;
  description: string;
  topics: number;
  lessons: number;
  onRemove: (id: string) => void;
}
const FavoriteItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  topics,
  lessons,
  onRemove
}) => {
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1">
        <h3 className="text-[#272f3c] mb-0 leading-none text-xl font-bold">{title}</h3>
        
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-[#262f3c]">Tópicos: <span className="text-gray-600 font-normal">{topics}</span></p>
          <p className="text-sm font-bold text-[#262f3c]">Aulas: <span className="text-gray-600 font-normal">{lessons}</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(id)} aria-label="Remover dos favoritos">
          <Star className="h-5 w-5 fill-[#ea2be2] text-[#ea2be2]" />
        </Button>
      </div>
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
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <h1 className="text-3xl mb-6 text-[#272f3c] font-extrabold md:text-3xl">Minhas Matrículas</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Concursos</h2>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-100">
                {favoriteCourses.length > 0 ? favoriteCourses.map(course => <FavoriteItem key={course.id} id={course.id} title={course.title} description={course.description} topics={course.topics} lessons={course.lessons} onRemove={handleRemoveCourse} />) : <div className="p-8 text-center text-gray-500">
                    Você ainda não adicionou nenhum curso aos favoritos.
                  </div>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Disciplinas</h2>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-100">
                {favoriteSubjects.length > 0 ? favoriteSubjects.map(subject => <FavoriteItem key={subject.id} id={subject.id} title={subject.title} description={subject.description} topics={subject.topics} lessons={subject.lessons} onRemove={handleRemoveSubject} />) : <div className="p-8 text-center text-gray-500">
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
