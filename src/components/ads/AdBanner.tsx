import { useAnuncioAtivo, type AnuncioSite } from "@/hooks/useAnuncios";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  position: string;
  className?: string;
}

/** Imagem do anúncio, com link quando houver. */
export const ImagemAnuncio = ({ ad, className = "" }: { ad: AnuncioSite; className?: string }) => {
  const imagem = (
    <img src={ad.imagem_url!} alt={ad.titulo} loading="lazy" className={cn("block h-auto max-w-full", className)} />
  );
  const externo = !!ad.link_destino && /^https?:\/\//i.test(ad.link_destino) && !ad.link_destino.includes(window.location.host);
  return (
    <div className="flex w-full justify-center" data-anuncio={ad.posicao}>
      {ad.link_destino ? (
        <a
          href={ad.link_destino}
          target={externo ? "_blank" : undefined}
          rel={externo ? "noopener noreferrer sponsored" : undefined}
          className="block max-w-full"
          aria-label={`Anúncio: ${ad.titulo}`}
        >
          {imagem}
        </a>
      ) : (
        imagem
      )}
    </div>
  );
};

/** Anúncio de um espaço fixo: mostra o de maior prioridade que estiver no ar. */
const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  const { anuncio: ad, loading, error } = useAnuncioAtivo(position);
  if (loading || error || !ad) return null;
  return (
    <div className={className}>
      <ImagemAnuncio ad={ad} className="rounded-lg" />
    </div>
  );
};

export default AdBanner;
