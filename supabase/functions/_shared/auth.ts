// Helper de autenticação/autorização compartilhado pelas Edge Functions.
//
// As funções estão configuradas com verify_jwt = false (supabase/config.toml),
// então TODA verificação precisa ser feita aqui dentro. Apenas checar se o
// header Authorization existe NÃO é suficiente: qualquer pessoa pode enviar
// "Authorization: Bearer qualquer-coisa".
//
// Aceita apenas o JWT de um usuário logado cujo papel (tabela user_roles)
// esteja em `roles`.
//
// @ts-ignore - import remoto do Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

declare const Deno: { env: { get(key: string): string | undefined } };

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

export async function authorize(
  req: Request,
  roles: string[],
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!bearer) {
    return { ok: false, status: 401, error: "Não autenticado" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, status: 500, error: "Credenciais do Supabase não configuradas" };
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Valida o JWT no servidor de Auth (assinatura + expiração)
  const { data: userData, error: userError } = await admin.auth.getUser(bearer);
  const user = userData?.user;
  if (userError || !user) {
    return { ok: false, status: 401, error: "Sessão inválida ou expirada" };
  }

  const { data: userRoles, error: rolesError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) {
    return { ok: false, status: 500, error: "Erro ao verificar permissões" };
  }

  const hasRole = (userRoles || []).some((r: { role: string }) => roles.includes(r.role));
  if (!hasRole) {
    return { ok: false, status: 403, error: "Permissão insuficiente" };
  }

  return { ok: true, userId: user.id };
}

export const STAFF_ROLES = ["admin", "professor", "assistente"];
export const BLOG_ROLES = ["admin", "jornalista"];
