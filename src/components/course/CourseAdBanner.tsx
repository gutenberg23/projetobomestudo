import { useAnuncioAtivo } from "@/hooks/useAnuncios";
import { ImagemAnuncio } from "@/components/ads/AdBanner";

interface CourseAdBannerProps {
  className?: string;
}

/**
 * Anúncio abaixo das abas do curso. Sem anúncio no ar não renderiza nada
 * (antes ficava uma div vazia com espaçamento entre as abas e o conteúdo).
 */
const CourseAdBanner = ({ className = "" }: CourseAdBannerProps) => {
  const { anuncio: ad, loading, error } = useAnuncioAtivo("course_navigation");
  if (loading || error || !ad) return null;

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="w-full max-w-[1400px] px-[10px] pb-4 md:px-[32px]">
        <ImagemAnuncio ad={ad} className="rounded-lg" />
      </div>
    </div>
  );
};

export default CourseAdBanner;
