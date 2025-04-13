import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: Request, res: Response) {
  // Verificar se o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar se o usuário está autenticado e é admin
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { data: userRoles } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userRoles || userRoles.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Permissões de administrador necessárias.' });
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }

  // Obter o conteúdo do robots.txt do corpo da requisição
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo não fornecido' });
  }

  try {
    // Caminho para o arquivo robots.txt
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

    // Escrever o novo conteúdo no arquivo
    fs.writeFileSync(robotsPath, content);

    // Também salvar na configuração do site para backup
    await supabase
      .from('configuracoes_site')
      .upsert({
        chave: 'seo_config',
        valor: JSON.stringify({
          ...JSON.parse((await supabase.from('configuracoes_site').select('valor').eq('chave', 'seo_config').single()).data?.valor || '{}'),
          robotsTxt: content
        }),
        updated_at: new Date().toISOString()
      }, { onConflict: 'chave' });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar robots.txt:', error);
    return res.status(500).json({ error: 'Erro ao atualizar arquivo robots.txt' });
  }
} 