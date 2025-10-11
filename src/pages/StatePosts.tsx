import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { STATES } from "@/data/blogFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";

const StatePosts = () => {
  const { stateId } = useParams<{ stateId: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar o nome completo do estado a partir do ID
  const stateInfo = STATES.find(s => s.value.toLowerCase() === stateId?.toLowerCase() || s.id.toLowerCase() === stateId?.toLowerCase());
  const stateName = stateInfo?.value || stateId;

  // Buscar posts e filtrar por estado
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await fetchBlogPosts();
        
        // Filtrar posts por estado
        const filteredPosts = allPosts.filter(post => 
          (post.state && post.state.toLowerCase() === stateId?.toLowerCase()) ||
          (post.state && stateInfo && post.state.toLowerCase() === stateInfo.value.toLowerCase())
        );

        setPosts(filteredPosts.length > 0 ? filteredPosts : []);
      } catch (error) {
        console.error("Erro ao carregar posts do estado:", error);
        
        // Se houver erro, tenta filtrar os posts mock
        const filteredMockPosts = MOCK_BLOG_POSTS.filter(post => 
          (post.state && post.state.toLowerCase() === stateId?.toLowerCase()) ||
          (post.state && stateInfo && post.state.toLowerCase() === stateInfo.value.toLowerCase())
        );
        
        setPosts(filteredMockPosts);
      } finally {
        setLoading(false);
      }
    };

    if (stateId) {
      loadPosts();
    }
  }, [stateId, stateInfo]);

  if (loading) {
    return (
      <PublicLayout>
        <BlogLayout>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </div>
        </BlogLayout>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <BlogLayout>
        <div className="mb-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#5f2ebe] hover:underline mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para o Blog
          </Link>
          <h1 className="text-2xl font-bold mb-6">
            Posts do estado {stateName}
          </h1>
          
          {posts.length > 0 ? (
            <BlogList posts={posts} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum post encontrado para este estado.</p>
              <Link 
                to="/blog"
                className="mt-4 inline-block text-[#5f2ebe] hover:underline"
              >
                Ver todos os posts
              </Link>
            </div>
          )}
        </div>
      </BlogLayout>
    </PublicLayout>
  );
};

export default StatePosts;