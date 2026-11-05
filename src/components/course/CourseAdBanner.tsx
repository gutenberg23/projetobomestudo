import { useAnuncioAtivo } from "@/hooks/useAnuncios";

interface CourseAdBannerProps {
  className?: string;
}

/**
 * Anúncio abaixo das abas do curso. Sem anúncio ativo não renderiza nada
 * (antes ficava uma div vazia com espaçamento entre as abas e o conteúdo).
 */
const CourseAdBanner = ({ className = "" }: CourseAdBannerProps) => {
  const { anuncio: ad, loading, error } = useAnuncioAtivo("course_navigation");

  if (loading || error || !ad || !ad.imagem_url) return null;

  const imagem = <img src={ad.imagem_url} alt={ad.titulo} className="h-auto max-w-full" />;

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="flex w-full max-w-[1400px] justify-center px-[10px] pb-4 md:px-[32px]">
        {ad.link_destino ? (
          <a href={ad.link_destino} target="_blank" rel="noopener noreferrer" className="block">
            {imagem}
          </a>
        ) : (
          imagem
        )}
      </div>
    </div>
  );
};

export default CourseAdBanner;
