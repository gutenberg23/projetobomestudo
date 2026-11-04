import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

/**
 * Cria um usuário pelo painel (/admin/usuarios).
 * Criar conta no Auth exige a service role, que não pode ficar no navegador,
 * por isso a criação passa por aqui. Só administradores podem chamar.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const NIVEL: Record<string, string> = {
  aluno: 'usuario',
  professor: 'professor',
  administrador: 'admin',
  assistente: 'assistente',
  jornalista: 'usuario',
}
const ROLE: Record<string, string> = {
  aluno: 'aluno',
  professor: 'professor',
  administrador: 'admin',
  assistente: 'assistente',
  jornalista: 'jornalista',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Não autenticado' }, 401)

    const cliente = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await cliente.auth.getUser()
    if (!user) return json({ error: 'Usuário não autenticado' }, 401)

    const { data: papeis } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    if (!papeis?.some((r) => r.role === 'admin')) {
      return json({ error: 'Apenas administradores podem criar usuários' }, 403)
    }

    const corpo = await req.json()
    const nome = String(corpo.nome || '').trim()
    const email = String(corpo.email || '').trim().toLowerCase()
    const senha = String(corpo.senha || '')
    const tipo = String(corpo.tipo || 'aluno')

    if (!nome || !email) return json({ error: 'Informe nome e e-mail' }, 400)
    if (senha.length < 6) return json({ error: 'A senha precisa de pelo menos 6 caracteres' }, 400)
    if (!NIVEL[tipo]) return json({ error: 'Tipo de usuário inválido' }, 400)

    const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { name: nome, nome },
    })
    if (erroCriar || !criado.user) {
      const msg = erroCriar?.message || 'Não foi possível criar a conta'
      return json({ error: /already|registered|exists/i.test(msg) ? 'Já existe uma conta com esse e-mail' : msg }, 400)
    }

    // O trigger handle_new_user já cria a linha em profiles; aqui completamos os dados.
    const agora = new Date().toISOString()
    const perfil: Record<string, unknown> = {
      id: criado.user.id,
      email,
      nome,
      nivel: NIVEL[tipo],
      role: ROLE[tipo],
      status: corpo.status === 'inativo' ? 'inativo' : 'ativo',
      assinante: !!corpo.assinante,
      inicio_assinatura: corpo.assinante && corpo.inicioAssinatura ? corpo.inicioAssinatura : null,
      termino_assinatura: corpo.assinante && corpo.terminoAssinatura ? corpo.terminoAssinatura : null,
      updated_at: agora,
    }
    const { error: erroPerfil } = await admin.from('profiles').upsert(perfil, { onConflict: 'id' })
    if (erroPerfil) {
      console.error('Conta criada, mas o perfil falhou:', erroPerfil)
      return json({ id: criado.user.id, aviso: 'Conta criada, mas não foi possível salvar todos os dados do perfil.' })
    }

    return json({ id: criado.user.id })
  } catch (error) {
    console.error('Erro na função create-user:', error)
    return json({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, 500)
  }
})
