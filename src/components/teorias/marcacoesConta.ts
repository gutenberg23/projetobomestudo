/**
 * Grifos salvos na conta do aluno (tabela teoria_marcacoes), para estudar em
 * qualquer aparelho. Uma linha por aluno e teoria, com a lista inteira em JSON.
 *
 * Os grifos antigos, que ficavam só no navegador, são levados para a conta no
 * primeiro acesso logado e depois apagados do navegador.
 */
import { supabase } from "@/integrations/supabase/client";
import { gravarMarcacoes, lerMarcacoes, type Marcacao } from "./marcacoes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase as any;

const PREFIXO_LOCAL = "bomestudo:teoria-marcacoes:";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const valida = (m: unknown): m is Marcacao =>
  !!m && typeof (m as Marcacao).id === "string" && typeof (m as Marcacao).texto === "string" && typeof (m as Marcacao).cor === "string";

/** Junta duas listas pelo id; em caso de repetição, vale a versão de `prioridade`. */
export const juntarMarcacoes = (base: Marcacao[], prioridade: Marcacao[]) => {
  const porId = new Map<string, Marcacao>();
  base.forEach((m) => porId.set(m.id, m));
  prioridade.forEach((m) => porId.set(m.id, m));
  return [...porId.values()].sort((a, b) => (a.criadaEm || "").localeCompare(b.criadaEm || ""));
};

/** Lê os grifos da conta. Devolve null se não deu para ler (sem rede ou tabela ainda não criada). */
export const carregarMarcacoesConta = async (userId: string, teoriaId: string): Promise<Marcacao[] | null> => {
  const { data, error } = await db()
    .from("teoria_marcacoes")
    .select("marcacoes")
    .eq("user_id", userId)
    .eq("teoria_id", teoriaId)
    .maybeSingle();
  if (error) {
    console.error("Erro ao carregar grifos:", error);
    return null;
  }
  const lista = data?.marcacoes;
  return Array.isArray(lista) ? lista.filter(valida) : [];
};

const gravarAgora = async (userId: string, teoriaId: string, lista: Marcacao[]) => {
  const tabela = db().from("teoria_marcacoes");
  const { error } = lista.length
    ? await tabela.upsert(
        { user_id: userId, teoria_id: teoriaId, marcacoes: lista, updated_at: new Date().toISOString() },
        { onConflict: "user_id,teoria_id" }
      )
    : await tabela.delete().eq("user_id", userId).eq("teoria_id", teoriaId);
  if (error) throw error;
};

// Gravações em fila, uma de cada vez, para a última alteração nunca ser sobrescrita por uma anterior
let fila: Promise<unknown> = Promise.resolve();
let pendentes = 0;

export const temGravacaoPendente = () => pendentes > 0;

export const salvarMarcacoesConta = (userId: string, teoriaId: string, lista: Marcacao[]): Promise<void> => {
  pendentes++;
  const tarefa = fila.then(() => gravarAgora(userId, teoriaId, lista));
  fila = tarefa.catch(() => undefined).finally(() => {
    pendentes--;
  });
  return tarefa;
};

/**
 * Leva para a conta os grifos que estão só neste navegador (de todas as teorias)
 * e apaga do navegador os que foram salvos. Devolve os ids das teorias migradas.
 */
export const migrarMarcacoesLocais = async (userId: string): Promise<string[]> => {
  let ids: string[] = [];
  try {
    ids = Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO_LOCAL))
      .map((k) => k.slice(PREFIXO_LOCAL.length))
      .filter((id) => UUID.test(id));
  } catch {
    return [];
  }

  const migradas: string[] = [];
  for (const teoriaId of ids) {
    const locais = lerMarcacoes(teoriaId);
    if (!locais.length) {
      gravarMarcacoes(teoriaId, []);
      continue;
    }
    const daConta = await carregarMarcacoesConta(userId, teoriaId);
    if (daConta === null) break; // sem acesso ao banco agora: tenta de novo na próxima visita
    try {
      await salvarMarcacoesConta(userId, teoriaId, juntarMarcacoes(locais, daConta));
      gravarMarcacoes(teoriaId, []);
      migradas.push(teoriaId);
    } catch (error) {
      // Teoria apagada (chave estrangeira): o grifo não tem mais onde ficar
      if ((error as { code?: string })?.code === "23503") gravarMarcacoes(teoriaId, []);
      else console.error("Erro ao migrar grifos:", error);
    }
  }
  return migradas;
};
