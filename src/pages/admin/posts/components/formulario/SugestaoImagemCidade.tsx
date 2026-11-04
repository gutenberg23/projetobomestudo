import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Search, ImageOff } from "lucide-react";
import { buscarFotosCidade, CityImage, UF_INFO } from "@/services/cityImageService";
import { cn } from "@/lib/utils";

interface SugestaoImagemCidadeProps {
  aberto: boolean;
  onFechar: () => void;
  cidadeInicial: string;
  ufInicial?: string;
  onEscolher: (img: CityImage) => void;
}

/**
 * Busca fotos da cidade do concurso no Wikimedia Commons (gratuito, livre
 * para uso com crédito ao autor) e deixa escolher uma como imagem destaque.
 */
export const SugestaoImagemCidade: React.FC<SugestaoImagemCidadeProps> = ({
  aberto,
  onFechar,
  cidadeInicial,
  ufInicial,
  onEscolher,
}) => {
  const [cidade, setCidade] = useState(cidadeInicial);
  const [uf, setUf] = useState(ufInicial && UF_INFO[ufInicial] ? ufInicial : "");
  const [fotos, setFotos] = useState<CityImage[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscou, setBuscou] = useState(false);

  const buscar = async (termo = cidade, estado = uf) => {
    if (!termo.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      setFotos(await buscarFotosCidade(termo, estado || undefined));
    } catch (e) {
      console.error(e);
      setErro("Não foi possível falar com o Wikimedia Commons agora. Tente de novo em instantes.");
      setFotos([]);
    } finally {
      setCarregando(false);
      setBuscou(true);
    }
  };

  // Ao abrir, já busca pela cidade sugerida
  useEffect(() => {
    if (!aberto) return;
    const estado = ufInicial && UF_INFO[ufInicial] ? ufInicial : "";
    setCidade(cidadeInicial);
    setUf(estado);
    setFotos([]);
    setBuscou(false);
    if (cidadeInicial.trim()) buscar(cidadeInicial, estado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#5f2ebe]" /> Foto da cidade do concurso
          </DialogTitle>
          <DialogDescription>
            Fotos livres do Wikimedia Commons. O crédito ao autor é adicionado no fim do post, como pede a licença.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            buscar();
          }}
        >
          <Input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade, ex.: Campinas"
            className="flex-1"
            autoFocus
          />
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            aria-label="Estado"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-48"
          >
            <option value="">Qualquer estado</option>
            {Object.entries(UF_INFO).map(([sigla, info]) => (
              <option key={sigla} value={sigla}>
                {info.nome}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={carregando || !cidade.trim()} className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90">
            {carregando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Buscar
          </Button>
        </form>

        <div className="max-h-[55vh] min-h-[200px] overflow-y-auto">
          {carregando && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          )}
          {!carregando && erro && <p className="py-10 text-center text-sm text-red-600">{erro}</p>}
          {!carregando && !erro && buscou && fotos.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-500">
              <ImageOff className="h-8 w-8 text-slate-300" />
              Nenhuma foto horizontal encontrada. Tente o nome da capital ou do estado.
            </div>
          )}
          {!carregando && fotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fotos.map((foto) => (
                <button
                  key={foto.url}
                  type="button"
                  onClick={() => onEscolher(foto)}
                  className={cn(
                    "group overflow-hidden rounded-lg border border-slate-200 text-left transition",
                    "hover:border-[#5f2ebe] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#5f2ebe]"
                  )}
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={foto.thumbUrl}
                      alt={foto.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-0.5 p-2">
                    <p className="truncate text-xs font-medium text-slate-700">{foto.title}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {foto.author} · {foto.license}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
