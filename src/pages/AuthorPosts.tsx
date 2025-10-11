import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPost } from "@/components/blog/types";
import { fetchBlogPosts } from "@/services/blogService";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

const AuthorPostsPage: React.FC = () => {
  const { author } = useParams<{ author: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const decodedAuthor = author ? decodeURIComponent(author) : '';
  const formattedAuthor = decodedAuthor.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await fetchBlogPosts();
        // Filtrar posts pelo autor (case insensitive)
        const authorPosts = allPosts.filter(
          post => post.author.toLowerCase() === decodedAuthor
        );
        setPosts(authorPosts);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [decodedAuthor]);

  return (
    <PublicLayout>
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Navegação de volta */}
          <div className="mb-6">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Blog
            </Link>
          </div>

          {/* Cabeçalho */}
          <div className="mb-8 flex items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#272f3c]">Artigos de {formattedAuthor}</h1>
              <p className="text-[#67748a]">
                {posts.length} {posts.length === 1 ? 'artigo publicado' : 'artigos publicados'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white p-6 rounded-lg shadow-sm">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h2>
              <p className="text-[#67748a] mb-6">
                Não encontramos artigos publicados por {formattedAuthor}.
              </p>
              <Link
                to="/blog"
                className="text-primary hover:underline"
              >
                Ver todos os artigos
              </Link>
            </div>
          )}
        </main>
        <Footer />
      </>
    </PublicLayout>
  );
};

export default AuthorPostsPage;