
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MessageSquare, Heart, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/components/blog/types";

// Usando os mesmos dados fictícios da página Blog
// Na implementação real, você buscaria os dados de uma API
const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Dicas para provas de Português em concursos públicos",
    summary: "Confira nossas dicas essenciais para se destacar nas provas de língua portuguesa em concursos públicos e aumentar suas chances de aprovação.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    author: "Maria Silva",
    commentCount: 15,
    likesCount: 32,
    createdAt: "2023-10-15T14:30:00Z",
    slug: "dicas-para-provas-de-portugues",
    category: "blog"
  },
  {
    id: "2",
    title: "Como estudar para concursos jurídicos",
    summary: "Aprenda métodos eficientes para estudar direito e conquistar sua aprovação em concursos jurídicos, com planejamento e técnicas de estudo.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    author: "Carlos Mendes",
    commentCount: 8,
    likesCount: 24,
    createdAt: "2023-10-10T09:45:00Z",
    slug: "como-estudar-para-concursos-juridicos",
    category: "blog"
  },
  // ... outros posts
];

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Encontrar o post com base no slug
  const post = MOCK_BLOG_POSTS.find(post => post.slug === slug);
  
  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
        <Header />
        <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-3xl mx-auto text-center">
          <h1 className="text-3xl mb-6 font-extrabold text-[#272f3c]">Artigo não encontrado</h1>
          <p className="text-[#67748a] mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/blog')} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm");
  
  // Dividir o conteúdo em parágrafos para melhor formatação
  const paragraphs = post.content.split('\n\n');

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6 text-[#67748a] hover:text-[#272f3c]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Blog
          </Button>
          
          <article className="bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#272f3c] mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-[#67748a] mb-6">
              <span className="mr-4">Por {post.author}</span>
              <span className="flex items-center mr-4">
                <Clock className="h-4 w-4 mr-1" />
                {formattedDate}
              </span>
            </div>
            
            <div className="prose max-w-none text-[#67748a]">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex items-center mt-8 pt-6 border-t border-gray-100 text-[#67748a]">
              <div className="flex items-center space-x-6">
                <span className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {post.commentCount} comentários
                </span>
                <span className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  {post.likesCount} curtidas
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
