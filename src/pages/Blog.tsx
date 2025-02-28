
import React, { useState } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { Pagination } from "../components/blog/Pagination";
import { BlogPost } from "../components/blog/types";

const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "Como se preparar para concurso público em apenas 6 meses",
    excerpt: "Descubra as melhores estratégias para otimizar seu tempo de estudo e conquistar a aprovação em apenas 6 meses de preparação.",
    author: "Rodrigo Santos",
    date: "12 de Maio de 2023",
    commentCount: 24,
    likeCount: 156,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/98b03e84-986d-4ef1-955d-f92b9422fc94.png"
  },
  {
    id: "2",
    title: "5 dicas para gerenciar a ansiedade antes das provas",
    excerpt: "A ansiedade pode ser um grande obstáculo para muitos candidatos. Aprenda técnicas eficazes para controlar o nervosismo e manter o foco durante as provas.",
    author: "Carla Mendes",
    date: "05 de Maio de 2023",
    commentCount: 18,
    likeCount: 132,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/7f20742a-1d1f-424b-9f56-3cece0204c7b.jpg"
  },
  {
    id: "3",
    title: "Concursos previstos para 2023: fique por dentro das oportunidades",
    excerpt: "Confira os principais concursos com previsão de edital para este ano e prepare-se com antecedência para as melhores oportunidades.",
    author: "Pedro Oliveira",
    date: "28 de Abril de 2023",
    commentCount: 32,
    likeCount: 210,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/94836d04-1225-493e-a113-36572286edcd.png"
  },
  {
    id: "4",
    title: "Como montar um cronograma de estudos eficiente",
    excerpt: "Um bom planejamento é essencial para o sucesso. Aprenda a criar um cronograma personalizado que maximize seu aprendizado e otimize seu tempo.",
    author: "Marina Costa",
    date: "15 de Abril de 2023",
    commentCount: 27,
    likeCount: 189,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/72f4e3ba-f775-45ec-a63f-d01db14a5b60.jpg"
  },
  {
    id: "5",
    title: "O impacto da tecnologia nos estudos para concursos",
    excerpt: "Descubra como usar aplicativos, plataformas online e ferramentas digitais para potencializar seus estudos e alcançar melhores resultados.",
    author: "Rafael Souza",
    date: "02 de Abril de 2023",
    commentCount: 15,
    likeCount: 120,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/1a751e43-0164-4c7d-bcb7-8afe675bfb25.jpg"
  },
  {
    id: "6",
    title: "Direito Administrativo: os temas mais cobrados em provas",
    excerpt: "Uma análise detalhada dos tópicos que mais caem em provas de concursos na área de Direito Administrativo e como se preparar para eles.",
    author: "Amanda Lima",
    date: "25 de Março de 2023",
    commentCount: 22,
    likeCount: 178,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg"
  },
  {
    id: "7",
    title: "A importância da revisão no processo de aprendizagem",
    excerpt: "Entenda por que revisar regularmente o conteúdo estudado é fundamental para a fixação do conhecimento e melhores resultados nas provas.",
    author: "Lucas Ferreira",
    date: "18 de Março de 2023",
    commentCount: 19,
    likeCount: 145,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/98b03e84-986d-4ef1-955d-f92b9422fc94.png"
  },
  {
    id: "8",
    title: "Como interpretar corretamente questões de múltipla escolha",
    excerpt: "Aprenda técnicas para entender o que realmente está sendo perguntado e evitar as pegadinhas comuns em questões de concursos públicos.",
    author: "Juliana Martins",
    date: "10 de Março de 2023",
    commentCount: 31,
    likeCount: 203,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/7f20742a-1d1f-424b-9f56-3cece0204c7b.jpg"
  },
  {
    id: "9",
    title: "Alimentação e exercícios: aliados na sua preparação",
    excerpt: "Saiba como uma dieta equilibrada e a prática regular de exercícios físicos podem contribuir para seu desempenho cognitivo e bem-estar durante os estudos.",
    author: "Marcelo Andrade",
    date: "03 de Março de 2023",
    commentCount: 14,
    likeCount: 126,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/94836d04-1225-493e-a113-36572286edcd.png"
  },
  {
    id: "10",
    title: "Português para concursos: dicas para dominar a gramática",
    excerpt: "Um guia prático com as principais regras gramaticais e dicas para melhorar seu desempenho nas questões de língua portuguesa em provas de concurso.",
    author: "Beatriz Campos",
    date: "25 de Fevereiro de 2023",
    commentCount: 28,
    likeCount: 195,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/72f4e3ba-f775-45ec-a63f-d01db14a5b60.jpg"
  },
  {
    id: "11",
    title: "História dos concursos públicos no Brasil",
    excerpt: "Conheça a evolução dos concursos no país, desde sua implementação até os formatos atuais, e entenda como isso impacta as provas de hoje.",
    author: "Ricardo Alves",
    date: "18 de Fevereiro de 2023",
    commentCount: 12,
    likeCount: 98,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/1a751e43-0164-4c7d-bcb7-8afe675bfb25.jpg"
  },
  {
    id: "12",
    title: "Matemática básica: revisão dos principais conceitos",
    excerpt: "Uma revisão completa dos tópicos essenciais de matemática que são frequentemente cobrados em provas de concursos de diversos níveis.",
    author: "Fernanda Santos",
    date: "10 de Fevereiro de 2023",
    commentCount: 25,
    likeCount: 167,
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg"
  }
];

export const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // Cálculo para paginação
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = mockPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(mockPosts.length / postsPerPage);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-[88px] bg-[#f6f8fa]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#272f3c] mb-4">Blog BomEstudo</h1>
            <p className="text-lg text-[#67748a]">
              Artigos e dicas para ajudar na sua preparação para concursos públicos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
