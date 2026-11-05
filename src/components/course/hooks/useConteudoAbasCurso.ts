import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";

export interface ConteudoAbasCurso {
  carregando: boolean;
  edital: boolean;
  simulados: boolean;
  leiseca: boolean;
}

/**
 * Diz se o curso tem conteúdo para as abas Edital, Simulados e Lei Seca,
 * com as mesmas regras que cada aba usa ao carregar:
 *  - Edital: edital verticalizado do curso ativo (ou sem status);
 *  - Simulados: simulado ativo do curso;
 *  - Lei Seca: lei ativa ligada ao curso (curso_id ou cursos_ids).
 * Se uma consulta falhar, a aba continua aparecendo.
 */
export function useConteudoAbasCurso(courseId: string | undefined, ativo: boolean): ConteudoAbasCurso {
  const [estado, setEstado] = useState<ConteudoAbasCurso>({ carregando: true, edital: false, simulados: false, leiseca: false });

  useEffect(() => {
    if (!courseId || !ativo) return;
    let cancelado = false;
    setEstado((e) => ({ ...e, carregando: true }));
    const id = extractIdFromFriendlyUrl(courseId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existe = async (consulta: PromiseLike<{ data: any[] | null; error: unknown }>) => {
      try {
        const { data, error } = await consulta;
        if (error) throw error;
        return (data || []).length > 0;
      } catch (e) {
        console.error("Erro ao verificar conteúdo da aba:", e);
        return true;
      }
    };

    Promise.all([
      existe(supabase.from("cursoverticalizado").select("id").eq("curso_id", id).or("ativo.is.null,ativo.eq.true").limit(1)),
      existe(supabase.from("simulados").select("id").eq("curso_id", id).eq("ativo", true).limit(1)),
      existe(
        supabase
          .from("leis_secas")
          .select("id")
          .eq("ativo", true)
          .or(`curso_id.eq.${id},cursos_ids.cs.{${id}}`)
          .limit(1)
      ),
    ]).then(([edital, simulados, leiseca]) => {
      if (!cancelado) setEstado({ carregando: false, edital, simulados, leiseca });
    });

    return () => {
      cancelado = true;
    };
  }, [courseId, ativo]);

  return estado;
}
