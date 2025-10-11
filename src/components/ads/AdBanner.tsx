import { useAnuncioAtivo } from "@/hooks/useAnuncios";

interface AdBannerProps {
  position: string;
  className?: string;
}

const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  const { anuncio: ad, loading, error } = useAnuncioAtivo(position);
  
  // Mostrar erro se houver
  if (error) {
    console.error(`AdBanner - Error fetching ad for position ${position}:`, error);
    return null;
  }
  
  // Só mostrar o anúncio se houver uma imagem
  if (loading || !ad || !ad.imagem_url) {
    return null;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      {ad.link_destino ? (
        <a 
          href={ad.link_destino} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src={ad.imagem_url} 
            alt={ad.titulo}
            className="max-w-full h-auto"
          />
        </a>
      ) : (
        <img 
          src={ad.imagem_url} 
          alt={ad.titulo}
          className="max-w-full h-auto"
        />
      )}
    </div>
  );
};

export default AdBanner;