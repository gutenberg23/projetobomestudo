import { useAnuncios } from "@/hooks/useAnuncios";
import { ImagemAnuncio } from "./AdBanner";

interface AdBannerListProps {
  position: string;
  /**
   * Qual espaço da lista é este (0 para o primeiro, 1 para o segundo...).
   * Os anúncios da posição se revezam entre os espaços.
   */
  indice?: number;
  className?: string;
}

/**
 * Um anúncio de um espaço que se repete numa lista (ex.: a cada 5 questões).
 * Cada espaço mostra um único anúncio; havendo vários, eles se alternam.
 */
const AdBannerList = ({ position, indice = 0, className = "" }: AdBannerListProps) => {
  const { anuncios, loading } = useAnuncios(position);
  if (loading || anuncios.length === 0) return null;
  const ad = anuncios[Math.max(0, indice) % anuncios.length];
  return (
    <div className={className}>
      <ImagemAnuncio ad={ad} className="rounded-lg" />
    </div>
  );
};

export default AdBannerList;
