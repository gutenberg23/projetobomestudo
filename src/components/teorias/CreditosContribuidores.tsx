import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContribuidorTeoria, listarContribuidoresTeoria } from "@/services/correcoesTeoria";

/** Linha discreta no fim da teoria com quem teve correções aprovadas nela. */
export const CreditosContribuidores = ({ teoriaId }: { teoriaId: string }) => {
  const [contribuidores, setContribuidores] = useState<ContribuidorTeoria[]>([]);

  useEffect(() => {
    let ativo = true;
    listarContribuidoresTeoria(teoriaId)
      .then((lista) => ativo && setContribuidores(lista))
      // Sem a migration ou sem rede, os créditos simplesmente não aparecem
      .catch(() => ativo && setContribuidores([]));
    return () => {
      ativo = false;
    };
  }, [teoriaId]);

  if (contribuidores.length === 0) return null;

  const nomes = contribuidores.map((c) => c.nome);
  const texto =
    nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;

  return (
    <p className="not-prose mt-10 pt-3 border-t border-gray-100 text-[11px] leading-snug text-gray-400">
      Contribuíram com correções nesta teoria: {texto}.{" "}
      <Link to="/ranking-contribuicoes" className="underline hover:text-[#5f2ebe]">
        Ver ranking
      </Link>
    </p>
  );
};
