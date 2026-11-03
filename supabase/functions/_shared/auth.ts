// Helper de autenticação/autorização compartilhado pelas Edge Functions.
//
// As funções estão configuradas com verify_jwt = false (supabase/config.toml),
// então TODA verificação precisa ser feita aqui dentro. Apenas checar se o
// header Authorization existe NÃO é suficiente: qualquer pessoa pode enviar
// "Authorization: Bearer qualquer-coisa".
//
// Formas aceitas de autenticação:
//   1. JWT de um usuário logado cujo papel (tabela user_roles) esteja em `roles`.
//   2. Chamadas servidor-a-servidor (ex.: N8N) usando o header
//      `x-api-key: <INTERNAL_API_TOKEN>` (secret configurado no Supabase) ou
//      `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`.
//
// @ts-ignore - import remoto do Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

declare const Deno: { env: { get(key: string): string | undefined } };

export type AuthResult =
  | { ok: true; userId: string | null; viaServiceToken: boolean }
  | { ok: false; status: number; error: string };

// Comparação em tempo constante para evitar timing attacks em tokens.
const safeEqual = (a: string, b: string): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function authorize(
  req: Request,
  roles: string[],
  options: { allowServiceToken?: boolean } = {},
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const internalToken = Deno.env.get("INTERNAL_API_TOKEN") || "";
  const apiKeyHeader = req.headers.get("x-api-key") || "";

  if (options.allowServiceToken) {
    if (
      (internalToken && (safeEqual(apiKeyHeader, internalToken) || safeEqual(bearer, internalToken))) ||
      (serviceKey && safeEqual(bearer, serviceKey))
    ) {
      return { ok: true, userId: null, viaServiceToken: true };
    }
  }

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

  return { ok: true, userId: user.id, viaServiceToken: false };
}

export const STAFF_ROLES = ["admin", "professor", "assistente"];
export const BLOG_ROLES = ["admin", "jornalista"];
