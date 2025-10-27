import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Rss, 
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  List,
  ArrowLeft
} from 'lucide-react';
import { 
  fetchRSSConfigs, 
  saveRSSConfig, 
  updateRSSConfig, 
  deleteRSSConfig, 
  fetchRSSFeed,
  syncAllRSSFeeds,
  fetchAllRSSPosts,
  processIndividualRSSItem,
  clearRewriteCache,
  getRewriteCacheStats,
  fetchAllTransmittedRSSItems,
  registerTransmittedRSSItem
} from '@/services/rssService';

interface RSSConfig {
  id?: string;
  name: string;
  url: string;
  active: boolean;
  lastSync?: string;
  created_at?: string;
}

interface RSSPostItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  feedName: string;
}

const RSSManager: React.FC = () => {
  const [configs, setConfigs] = useState<RSSConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [newConfig, setNewConfig] = useState({ name: '', url: '', active: true });
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [showPostsTable, setShowPostsTable] = useState(false);
  const [allPosts, setAllPosts] = useState<RSSPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [transmittingPosts, setTransmittingPosts] = useState<Set<string>>(new Set());
  const [transmittedItems, setTransmittedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await fetchRSSConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações RSS.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.name.trim() || !newConfig.url.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome e URL são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const savedConfig = await saveRSSConfig(newConfig);
      if (savedConfig) {
        setConfigs([savedConfig, ...configs]);
        setNewConfig({ name: '', url: '', active: true });
        setShowAddForm(false);
        toast({
          title: 'Sucesso',
          description: 'Configuração RSS adicionada com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a configuração RSS.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const updatedConfig = await updateRSSConfig(id, { active });
      if (updatedConfig) {
        setConfigs(configs.map(config => 
          config.id === id ? { ...config, active } : config
        ));
        toast({
          title: 'Sucesso',
          description: `RSS ${active ? 'ativado' : 'desativado'} com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a configuração.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração RSS?')) {
      return;
    }

    try {
      const success = await deleteRSSConfig(id);
      if (success) {
        setConfigs(configs.filter(config => config.id !== id));
        toast({
          title: 'Sucesso',
          description: 'Configuração RSS excluída com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a configuração.',
        variant: 'destructive',
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const result = await syncAllRSSFeeds();
      
      toast({
        title: 'Sincronização concluída',
        description: `${result.success} posts criados com sucesso. ${result.errors} erros encontrados.`,
        variant: result.errors > 0 ? 'destructive' : 'default',
      });
      
      // Recarregar configurações para atualizar timestamps
      await loadConfigs();
    } catch (error) {
      console.error('Erro ao sincronizar RSS:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível sincronizar os RSS feeds.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchAllPosts = async () => {
    try {
      setLoadingPosts(true);
      const feedsWithPosts = await fetchAllRSSPosts();
      
      const flattenedPosts: RSSPostItem[] = [];
      feedsWithPosts.forEach(feed => {
        feed.items.forEach(item => {
          flattenedPosts.push({
            ...item,
            feedName: feed.feedName
          });
        });
      });
      
      // Ordenar por data de publicação (mais recentes primeiro)
      flattenedPosts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      
      setAllPosts(flattenedPosts);
      setShowPostsTable(true);
      
      // Carregar itens transmitidos
      const transmittedItemsData = await fetchAllTransmittedRSSItems();
      const transmittedGuids = new Set(transmittedItemsData.map(item => item.rss_item_guid));
      setTransmittedItems(transmittedGuids);
      
      toast({
        title: 'Posts carregados',
        description: `${flattenedPosts.length} posts encontrados nos feeds RSS.`,
      });
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar os posts dos RSS feeds.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleTransmitPost = async (post: RSSPostItem) => {
    try {
      setTransmittingPosts(prev => new Set([...prev, post.guid]));
      
      const blogPost = await processIndividualRSSItem({
        title: post.title,
        link: post.link,
        description: post.description,
        pubDate: post.pubDate,
        guid: post.guid
      });
      
      if (blogPost) {
        // Registrar como transmitido
        await registerTransmittedRSSItem(post, post.feedName, blogPost.id);
        
        // Atualizar o conjunto de itens transmitidos
        setTransmittedItems(prev => new Set([...prev, post.guid]));
        
        toast({
          title: 'Post transmitido com sucesso',
          description: `"${post.title}" foi processado e criado no blog.`,
        });
      } else {
        toast({
          title: 'Post não transmitido',
          description: 'O post pode já existir ou houve um erro no processamento.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao transmitir post:', error);
      toast({
        title: 'Erro na transmissão',
        description: 'Não foi possível transmitir o post.',
        variant: 'destructive',
      });
    } finally {
      setTransmittingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.guid);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleTestRSS = async (url: string) => {
    try {
      setTestingUrl(url);
      const feed = await fetchRSSFeed(url);
      
      if (feed) {
        toast({
          title: 'RSS válido',
          description: `Feed encontrado: ${feed.title} (${feed.items.length} itens)`,
        });
      } else {
        toast({
          title: 'RSS inválido',
          description: 'Não foi possível acessar ou parsear o RSS feed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao testar RSS:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao testar o RSS feed.',
        variant: 'destructive',
      });
    } finally {
      setTestingUrl(null);
    }
  };

  const handleClearCache = () => {
    try {
      const stats = getRewriteCacheStats();
      clearRewriteCache();
      
      toast({
        title: 'Cache limpo com sucesso',
        description: `${stats.size} entradas removidas do cache de reescrita da IA.`,
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar o cache.',
        variant: 'destructive',
      });
    }
  };

  const formatDateOptional = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  if (showPostsTable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#272f3c]">Posts dos Feeds RSS</h2>
            <p className="text-[#67748a] mt-1">
              Selecione os posts que deseja transmitir para o blog
            </p>
          </div>
          <Button
            onClick={() => setShowPostsTable(false)}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allPosts.map((post, index) => (
                    <tr 
                      key={post.guid || index} 
                      className={`hover:bg-gray-50 ${transmittedItems.has(post.guid) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {truncateText(post.title, 80)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {truncateText(post.description, 120)}
                          </div>
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver original
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{post.feedName}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.pubDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transmittedItems.has(post.guid) ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Transmitido
                          </Badge>
                        ) : (
                          <Badge variant="outline">Novo</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => handleTransmitPost(post)}
                          disabled={transmittingPosts.has(post.guid)}
                          size="sm"
                          className="bg-[#ea2be2] hover:bg-[#d029d5]"
                        >
                          {transmittingPosts.has(post.guid) ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Transmitir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum post encontrado nos feeds RSS.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#272f3c]">Gerenciador de RSS</h2>
          <p className="text-[#67748a] mt-1">
            Configure feeds RSS para importação automática de conteúdo
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleFetchAllPosts}
            disabled={loadingPosts || configs.filter(c => c.active).length === 0}
            className="bg-[#ea2be2] hover:bg-[#d029d5]"
          >
            {loadingPosts ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <List className="h-4 w-4 mr-2" />
            )}
            Sincronizar Todos
          </Button>
          <Button
            onClick={handleSyncAll}
            disabled={syncing || configs.filter(c => c.active).length === 0}
            variant="outline"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronização Automática
          </Button>
          <Button
            onClick={handleClearCache}
            variant="outline"
            className="text-orange-600 hover:text-orange-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache IA
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar RSS
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rss className="h-5 w-5 mr-2" />
              Adicionar Nova Configuração RSS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input
                  placeholder="Ex: PCI Concursos"
                  value={newConfig.name}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL do RSS</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://exemplo.com/rss.xml"
                    value={newConfig.url}
                    onChange={(e) => setNewConfig({ ...newConfig, url: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestRSS(newConfig.url)}
                    disabled={!newConfig.url.trim() || testingUrl === newConfig.url}
                  >
                    {testingUrl === newConfig.url ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Testar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newConfig.active}
                onCheckedChange={(active) => setNewConfig({ ...newConfig, active })}
              />
              <label className="text-sm">Ativo</label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddConfig}>
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewConfig({ name: '', url: '', active: true });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Rss className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhuma configuração RSS encontrada.</p>
              <p className="text-sm text-gray-400 mt-2">
                Adicione uma configuração para começar a importar conteúdo automaticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{config.name}</h3>
                      <Badge variant={config.active ? 'default' : 'secondary'}>
                        {config.active ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {config.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <a
                          href={config.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {config.url}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Última sync: {formatDateOptional(config.lastSync)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestRSS(config.url)}
                      disabled={testingUrl === config.url}
                    >
                      {testingUrl === config.url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Testar'
                      )}
                    </Button>
                    <Switch
                      checked={config.active}
                      onCheckedChange={(active) => handleToggleActive(config.id!, active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfig(config.id!)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {configs.filter(c => c.active).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Sincronização Automática</h3>
              <p className="text-sm text-gray-600 mb-4">
                {configs.filter(c => c.active).length} RSS feed(s) ativo(s) serão sincronizados automaticamente.
              </p>
              <Button
                onClick={handleSyncAll}
                disabled={syncing}
                className="bg-[#ea2be2] hover:bg-[#d029d5]"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sincronizar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RSSManager;