import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { REGIONS } from "@/data/blogFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const RegionPosts = () => {
  const { regionId } = useParams<{ regionId: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar o nome da região a partir do ID
  const regionName = REGIONS.find(r => r.value.toLowerCase() === regionId?.toLowerCase())?.name || regionId;

  // Buscar posts e filtrar por região
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await fetchBlogPosts();
        
        // Filtrar posts por região
        const filteredPosts = allPosts.filter(post => 
          post.region && post.region.toLowerCase() === regionId?.toLowerCase()
        );

        setPosts(filteredPosts.length > 0 ? filteredPosts : []);
      } catch (error) {
        console.error("Erro ao carregar posts da região:", error);
        
        // Se houver erro, tenta filtrar os posts mock
        const filteredMockPosts = MOCK_BLOG_POSTS.filter(post => 
          post.region && post.region.toLowerCase() === regionId?.toLowerCase()
        );
        
        setPosts(filteredMockPosts);
      } finally {
        setLoading(false);
      }
    };

    if (regionId) {
      loadPosts();
    }
  }, [regionId]);

  if (loading) {
    return (
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
    );
  }

  return (
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
          Posts da região {regionName}
        </h1>
        
        {posts.length > 0 ? (
          <BlogList posts={posts} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nenhum post encontrado para esta região.</p>
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
  );
};

export default RegionPosts; 