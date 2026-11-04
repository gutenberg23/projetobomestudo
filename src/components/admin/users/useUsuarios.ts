import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormUsuario, NIVEL_POR_TIPO, ROLE_POR_TIPO, UserData, tipoDoPerfil } from "./types";

const soData = (v?: string | null) => (v ? String(v).slice(0, 10) : "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paraUsuario = (p: any): UserData => ({
  id: p.id || "",
  nome: p.nome || "",
  email: p.email || "",
  tipo: tipoDoPerfil(p.nivel, p.role),
  status: p.status === "inativo" ? "inativo" : "ativo",
  criadoEm: p.created_at || p.data_cadastro || "",
  ultimoLogin: p.ultimo_login || "",
  fotoPerfil: p.foto_url || p.foto_perfil || "",
  assinante: !!p.assinante,
  inicioAssinatura: soData(p.inicio_assinatura),
  terminoAssinatura: soData(p.termino_assinatura),
});

const COLUNAS =
  "id, nome, email, nivel, role, status, created_at, data_cadastro, ultimo_login, foto_url, foto_perfil, assinante, inicio_assinatura, termino_assinatura";

/** Lê o erro devolvido por uma Edge Function (o corpo vem em error.context). */
const erroDaFuncao = async (error: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (error as any)?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const corpo = await ctx.json();
      if (corpo?.error) return String(corpo.error);
    } catch {
      /* corpo não é JSON */
    }
  }
  return (error as Error)?.message || "Erro desconhecido";
};

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      // A API devolve no máximo 1000 linhas por vez
      const todos: UserData[] = [];
      for (let de = 0; ; de += 1000) {
        const { data, error } = await supabase
          .from("profiles")
          .select(COLUNAS)
          .order("created_at", { ascending: false })
          .range(de, de + 999);
        if (error) throw error;
        todos.push(...(data || []).map(paraUsuario));
        if (!data || data.length < 1000) break;
      }
      setUsuarios(todos);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Não foi possível carregar os usuários");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const trocar = (id: string, parcial: Partial<UserData>) =>
    setUsuarios((l) => l.map((u) => (u.id === id ? { ...u, ...parcial } : u)));

  const alterarStatus = async (u: UserData, status: UserData["status"]) => {
    const { error } = await supabase.from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", u.id);
    if (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Não foi possível alterar o status. " + error.message);
      return false;
    }
    trocar(u.id, { status });
    toast.success(status === "ativo" ? "Usuário reativado" : "Usuário desativado");
    return true;
  };

  const salvar = async (id: string, f: FormUsuario) => {
    const dados = {
      nome: f.nome.trim(),
      nivel: NIVEL_POR_TIPO[f.tipo],
      role: ROLE_POR_TIPO[f.tipo],
      status: f.status,
      assinante: f.assinante,
      inicio_assinatura: f.assinante && f.inicioAssinatura ? f.inicioAssinatura : null,
      termino_assinatura: f.assinante && f.terminoAssinatura ? f.terminoAssinatura : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(dados).eq("id", id);
    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Não foi possível salvar. " + error.message);
      return false;
    }
    trocar(id, {
      nome: dados.nome,
      tipo: f.tipo,
      status: f.status,
      assinante: f.assinante,
      inicioAssinatura: dados.inicio_assinatura || "",
      terminoAssinatura: dados.termino_assinatura || "",
    });
    toast.success("Usuário atualizado");
    return true;
  };

  const criar = async (f: FormUsuario) => {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        nome: f.nome.trim(),
        email: f.email.trim(),
        senha: f.senha,
        tipo: f.tipo,
        status: f.status,
        assinante: f.assinante,
        inicioAssinatura: f.inicioAssinatura,
        terminoAssinatura: f.terminoAssinatura,
      },
    });
    if (error || data?.error) {
      const msg = data?.error || (await erroDaFuncao(error));
      console.error("Erro ao criar usuário:", msg);
      toast.error("Não foi possível criar o usuário. " + msg);
      return false;
    }
    if (data?.aviso) toast.warning(data.aviso);
    else toast.success("Usuário criado. Ele já pode entrar com o e-mail e a senha informados.");
    await carregar();
    return true;
  };

  const excluir = async (u: UserData) => {
    const { data, error } = await supabase.functions.invoke("delete-user", { body: { userId: u.id } });
    if (error || data?.error) {
      const msg = data?.error || (await erroDaFuncao(error));
      console.error("Erro ao excluir usuário:", msg);
      toast.error("Não foi possível excluir. " + msg);
      return;
    }
    setUsuarios((l) => l.filter((x) => x.id !== u.id));
    toast.success("Usuário excluído");
  };

  return { usuarios, carregando, carregar, alterarStatus, salvar, criar, excluir };
};
