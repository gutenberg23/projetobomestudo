import { supabase } from "@/integrations/supabase/client";

// Função para gerar o conteúdo do sitemap.xml dinamicamente
export async function generateSitemapXML(): Promise<string> {
  try {
    // Buscar posts do blog
    const blogPosts = await fetchBlogPosts();
    
    // Buscar cadernos de questões (cursos)
    const questionBooks = await fetchQuestionBooks();
    
    // Gerar o conteúdo do sitemap
    const baseUrl = "https://bomestudo.com.br"; // Esta URL deve ser configurável
    
    // Cabeçalho do sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // URLs estáticas principais (do sitemap.xml original)
    sitemap += `  <!-- Páginas principais -->\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/blog</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.9</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/questions</loc>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/cadernos</loc>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/ranking-comentarios</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.7</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/ranking-questoes</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.7</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/explore</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.9</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/concursos</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.9</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/login</loc>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.6</priority>\n`;
    sitemap += `  </url>\n`;
    sitemap += `\n`;
    sitemap += `  <!-- Páginas de conteúdo público -->\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/termos-politicas</loc>\n`;
    sitemap += `    <changefreq>yearly</changefreq>\n`;
    sitemap += `    <priority>0.3</priority>\n`;
    sitemap += `  </url>\n`;
    
    // Adicionar posts do blog
    if (blogPosts && blogPosts.length > 0) {
      sitemap += `\n  <!-- Posts do blog -->\n`;
      for (const post of blogPosts) {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        sitemap += `    <lastmod>${new Date(post.created_at).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>daily</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
      }
    }
    
    // Adicionar cadernos de questões (cursos)
    if (questionBooks && questionBooks.length > 0) {
      sitemap += `\n  <!-- Cadernos de questões -->\n`;
      for (const book of questionBooks) {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/cadernos/${book.id}</loc>\n`;
        sitemap += `    <lastmod>${new Date(book.created_at).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `  </url>\n`;
      }
    }
    
    // Fechar o sitemap
    sitemap += `</urlset>\n`;
    
    return sitemap;
  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);
    // Retornar um sitemap básico em caso de erro
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bomestudo.com.br/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}

// Função para buscar posts do blog
async function fetchBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, created_at')
      .eq('is_draft', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar posts do blog:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar posts do blog:", error);
    return [];
  }
}

// Função para buscar cadernos de questões
async function fetchQuestionBooks() {
  try {
    const { data, error } = await supabase
      .from('cadernos_questoes')
      .select('id, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar cadernos de questões:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar cadernos de questões:", error);
    return [];
  }
}