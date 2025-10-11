import { useAnuncios } from "@/hooks/useAnuncios";

interface AdBannerListProps {
  position: string;
  interval?: number; // A cada quantos itens mostrar um anúncio
  itemCount: number; // Total de itens na lista
  className?: string;
}

const AdBannerList = ({ position, interval = 5, itemCount, className = "" }: AdBannerListProps) => {
  const { anuncios: ads, loading } = useAnuncios(position);

  // Filtrar apenas anúncios que têm imagem
  const adsWithImages = ads.filter(ad => ad.imagem_url);

  // Determinar em quais posições os anúncios devem aparecer
  const adPositions = [];
  for (let i = interval; i <= itemCount; i += interval) {
    adPositions.push(i);
  }

  if (loading) {
    return null;
  }

  if (adsWithImages.length === 0) {
    return null;
  }

  // Retornar os anúncios para as posições calculadas
  return (
    <div className="space-y-4">
      {adPositions.map((pos, index) => {
        const ad = adsWithImages[index % adsWithImages.length]; // Rotacionar os anúncios
        if (!ad) return null;
        
        return (
          <div key={`${position}-${pos}`} className={`flex justify-center ${className}`}>
            {ad.link_destino ? (
              <a 
                href={ad.link_destino} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src={ad.imagem_url!} 
                  alt={ad.titulo}
                  className="max-w-full h-auto"
                />
              </a>
            ) : (
              <img 
                src={ad.imagem_url!} 
                alt={ad.titulo}
                className="max-w-full h-auto"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdBannerList;