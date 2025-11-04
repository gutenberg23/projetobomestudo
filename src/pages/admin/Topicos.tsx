import { useState, useEffect } from "react";
import { 
  TopicosFilter, 
  TopicosTable, 
  AdicionarAula,
  EditTopicoModal,
  DeleteTopicoModal,
  TopicosHeader
} from "./components/topicos";
import { 
  useTopicosState,
  useTopicosFiltrados,
  useTopicosActions
} from "./components/topicos/hooks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { MultiFileUploadField } from "@/components/ui/multi-file-upload-field";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "./components/topicos/TopicosTypes";
import { QuestionsManager } from "./components/topicos/modals/components/QuestionsManager";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";

interface TeacherData {
  id: string;
  nomeCompleto: string;
  disciplina: string;
}

const Topicos = () => {
  const {
    topicos,
    setTopicos,
    loading,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    professorFiltro,
    setProfessorFiltro,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    tituloNovaAula,
    setTituloNovaAula,
    descricaoNovaAula,
    setDescricaoNovaAula,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentTopico,
    setCurrentTopico
  } = useTopicosState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopico, setNewTopico] = useState<Omit<Topico, 'id' | 'selecionado' | 'thumbnail' | 'abrirVideoEm'>>({
    titulo: "",
    disciplina: "",
    patrocinador: "",
    questoesIds: [],
    professor_id: "",
    professor_nome: "",
    videoUrl: "",
    pdfUrl: "",
    mapaUrl: "",
    resumoUrl: "",
    musicaUrl: [],
    resumoAudioUrl: [],
    cadernoQuestoesUrl: "",
    abrirEmNovaGuia: false
  });

  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  const [newQuestaoId, setNewQuestaoId] = useState("");

  const { topicosFiltrados, todosSelecionados, totalPages, totalItems } = useTopicosFiltrados(
    topicos,
    searchTerm,
    disciplinaFiltro,
    professorFiltro,
    currentPage,
    itemsPerPage
  );

  const {
    handleSelecaoTodos,
    handleSelecaoTopico,
    openEditModal,
    openDeleteModal,
    handleSaveTopico,
    handleDeleteTopico,
    handleAdicionarAula
  } = useTopicosActions(
    topicos,
    setTopicos,
    setIsOpenEdit,
    setIsOpenDelete,
    setCurrentTopico,
    setTituloNovaAula,
    setDescricaoNovaAula
  );

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchTeachers();
    }
  }, [isCreateModalOpen]);



  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome_completo, disciplina')
        .order('nome_completo');
        
      if (error) throw error;
      
      const formattedTeachers: TeacherData[] = data?.map(teacher => ({
        id: teacher.id,
        nomeCompleto: teacher.nome_completo,
        disciplina: teacher.disciplina
      })) || [];

      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast.error("Erro ao carregar professores. Tente novamente.");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const addQuestaoId = () => {
    if (!newQuestaoId.trim()) {
      toast.error("Digite um ID de questão válido");
      return;
    }

    if (newTopico.questoesIds.includes(newQuestaoId)) {
      toast.error("Esta questão já foi adicionada");
      return;
    }

    setNewTopico({
      ...newTopico,
      questoesIds: [...newTopico.questoesIds, newQuestaoId]
    });
    setNewQuestaoId("");
  };

  const removeQuestaoId = (index: number) => {
    const updatedQuestoes = [...newTopico.questoesIds];
    updatedQuestoes.splice(index, 1);
    setNewTopico({
      ...newTopico,
      questoesIds: updatedQuestoes
    });
  };

  const handleCreateTopico = async () => {
    if (!newTopico.titulo || !newTopico.disciplina) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }

    try {
      let professor_nome = "";
      let professor_id = newTopico.professor_id || null;
      
      // Se um professor foi selecionado, verificar se é um UUID válido
      if (professor_id) {
        const selectedTeacher = teachers.find(t => t.id === newTopico.professor_id);
        if (selectedTeacher) {
          professor_nome = selectedTeacher.nomeCompleto;
        } else {
          // Se não encontrou o professor, definir como null
          professor_id = null;
        }
      }

      const { data, error } = await supabase
        .from('topicos')
        .insert({
          nome: newTopico.titulo,
          patrocinador: newTopico.patrocinador,
          disciplina: newTopico.disciplina,
          questoes_ids: newTopico.questoesIds,
          professor_id: professor_id, // Usar o valor corrigido
          professor_nome: professor_nome,
          video_url: newTopico.videoUrl,
          pdf_url: newTopico.pdfUrl,
          mapa_url: newTopico.mapaUrl,
          resumo_url: newTopico.resumoUrl,
          musica_url: Array.isArray(newTopico.musicaUrl) ? newTopico.musicaUrl.join(',') : newTopico.musicaUrl,
          resumo_audio_url: Array.isArray(newTopico.resumoAudioUrl) ? newTopico.resumoAudioUrl.join(',') : newTopico.resumoAudioUrl,
          caderno_questoes_url: newTopico.cadernoQuestoesUrl,
          abrir_em_nova_guia: newTopico.abrirEmNovaGuia
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const novoTopico: Topico = {
          id: data[0].id,
          titulo: data[0].nome,
          thumbnail: "",
          patrocinador: data[0].patrocinador,
          disciplina: data[0].disciplina,
          videoUrl: data[0].video_url,
          pdfUrl: data[0].pdf_url,
          mapaUrl: data[0].mapa_url,
          resumoUrl: data[0].resumo_url,
          musicaUrl: data[0].musica_url ? data[0].musica_url.split(',').filter(Boolean) : [],
          resumoAudioUrl: data[0].resumo_audio_url ? data[0].resumo_audio_url.split(',').filter(Boolean) : [],
          cadernoQuestoesUrl: data[0].caderno_questoes_url,
          questoesIds: data[0].questoes_ids,
          professor_id: data[0].professor_id,
          professor_nome: data[0].professor_nome,
          selecionado: false,
          abrirEmNovaGuia: data[0].abrir_em_nova_guia
        };
        
        setTopicos([...topicos, novoTopico]);
        toast.success("Tópico criado com sucesso!");
        
        setNewTopico({
          titulo: "",
          disciplina: "",
          patrocinador: "",
          videoUrl: "",
          pdfUrl: "",
          mapaUrl: "",
          resumoUrl: "",
          musicaUrl: [],
          resumoAudioUrl: [],
          cadernoQuestoesUrl: "",
          questoesIds: [],
          professor_id: "",
          professor_nome: "",
          abrirEmNovaGuia: false
        });
        
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      toast.error("Erro ao criar o tópico. Tente novamente.");
    }
  };

  const temTopicosSelecionados = topicos.some(topico => topico.selecionado);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TopicosHeader />
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Criar Tópico
        </Button>
      </div>
      
      <TopicosFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        disciplinaFiltro={disciplinaFiltro}
        setDisciplinaFiltro={setDisciplinaFiltro}
        professorFiltro={professorFiltro}
        setProfessorFiltro={setProfessorFiltro}
      />
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <TopicosTable 
            topicos={topicosFiltrados}
            todosSelecionados={todosSelecionados}
            handleSelecaoTodos={() => handleSelecaoTodos(topicosFiltrados, todosSelecionados)}
            handleSelecaoTopico={handleSelecaoTopico}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </>
      )}
      
      <AdicionarAula 
        tituloNovaAula={tituloNovaAula}
        setTituloNovaAula={setTituloNovaAula}
        descricaoNovaAula={descricaoNovaAula}
        setDescricaoNovaAula={setDescricaoNovaAula}
        handleAdicionarAula={() => handleAdicionarAula(tituloNovaAula, descricaoNovaAula)}
        temTopicosSelecionados={temTopicosSelecionados}
      />
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="topico-titulo">Título</Label>
              <Input
                id="topico-titulo"
                value={newTopico.titulo}
                onChange={(e) => setNewTopico({ ...newTopico, titulo: e.target.value })}
                placeholder="Digite o título do tópico"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-disciplina">Disciplina</Label>
              <Input
                id="topico-disciplina"
                value={newTopico.disciplina}
                onChange={(e) => setNewTopico({ ...newTopico, disciplina: e.target.value })}
                placeholder="Digite o nome da disciplina"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-professor">Professor</Label>
              {loadingTeachers ? (
                <div className="text-sm text-[#67748a] p-2 border rounded flex items-center">
                  Carregando professores...
                </div>
              ) : (
                <Select 
                  value={newTopico.professor_id} 
                  onValueChange={(value) => setNewTopico({ ...newTopico, professor_id: value })}
                >
                  <SelectTrigger id="topico-professor">
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.nomeCompleto} - {teacher.disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-patrocinador">Patrocinador</Label>
              <Input
                id="topico-patrocinador"
                value={newTopico.patrocinador}
                onChange={(e) => setNewTopico({ ...newTopico, patrocinador: e.target.value })}
                placeholder="Digite o nome do patrocinador"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topico-video-url">Link da Videoaula</Label>
              <Input
                id="topico-video-url"
                value={newTopico.videoUrl}
                onChange={(e) => {
                  // Transformar URL do YouTube no formato de incorporação
                  const url = e.target.value;
                  let transformedUrl = url;
                  
                  // Verificar se é um link do YouTube no formato padrão
                  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&.*)?/;
                  const youtubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)(?:\?.*)?/;
                  
                  const match = url.match(youtubeRegex);
                  const shortMatch = url.match(youtubeShortRegex);
                  
                  if (match && match[1]) {
                    // Transformar para o formato de incorporação
                    transformedUrl = `https://www.youtube.com/embed/${match[1]}`;
                  } else if (shortMatch && shortMatch[1]) {
                    // Transformar links curtos do YouTube
                    transformedUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
                  }
                  
                  setNewTopico({ ...newTopico, videoUrl: transformedUrl });
                }}
                placeholder="https://exemplo.com/video"
              />
              <p className="text-xs text-[#67748a] mt-1">
                Links do YouTube serão automaticamente convertidos para o formato de incorporação.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="abrir-em-nova-guia"
                checked={newTopico.abrirEmNovaGuia || false}
                onCheckedChange={(checked) => setNewTopico({ ...newTopico, abrirEmNovaGuia: checked === true })}
              />
              <Label htmlFor="abrir-em-nova-guia" className="cursor-pointer text-sm text-[#272f3c]">
                Abrir aula em nova guia
              </Label>
            </div>
            
            <FileUploadField
              id="topico-pdf-url"
              label="Link da Aula em texto"
              value={newTopico.pdfUrl}
              onChange={(value) => setNewTopico({ ...newTopico, pdfUrl: value })}
              placeholder="URL"
              allowedTypes={['pdf']}
              rootFolder="pdf"
            />
            
            <FileUploadField
              id="topico-mapa-url"
              label="Link do Mapa Mental"
              value={newTopico.mapaUrl}
              onChange={(value) => setNewTopico({ ...newTopico, mapaUrl: value })}
              placeholder="URL do mapa mental ou faça upload"
              allowedTypes={['pdf', 'jpg', 'jpeg', 'png', 'gif']}
              rootFolder="mapa-mental"
            />
            
            <FileUploadField
              id="topico-resumo-url"
              label="Link do Resumo"
              value={newTopico.resumoUrl}
              onChange={(value) => setNewTopico({ ...newTopico, resumoUrl: value })}
              placeholder="URL do resumo ou faça upload"
              allowedTypes={['pdf', 'doc', 'docx']}
              rootFolder="resumo"
            />
            
            <MultiFileUploadField
              id="topico-musica-url"
              label="Link da Música"
              values={Array.isArray(newTopico.musicaUrl) ? newTopico.musicaUrl : []}
              onChange={(values) => setNewTopico({ ...newTopico, musicaUrl: values })}
              placeholder="URLs das músicas ou faça upload"
              allowedTypes={['mp3', 'wav', 'ogg', 'm4a', 'aac']}
              rootFolder="musica"
            />
            
            <MultiFileUploadField
              id="topico-resumo-audio-url"
              label="Link do Resumo em Áudio"
              values={Array.isArray(newTopico.resumoAudioUrl) ? newTopico.resumoAudioUrl : []}
              onChange={(values) => setNewTopico({ ...newTopico, resumoAudioUrl: values })}
              placeholder="URLs dos resumos em áudio ou faça upload"
              allowedTypes={['mp3', 'wav', 'ogg', 'm4a', 'aac']}
              rootFolder="resumo-audio"
            />
            
            <div className="space-y-2">
              <Label htmlFor="topico-caderno-questoes-url">Link do Caderno de Questões</Label>
              <Input
                id="topico-caderno-questoes-url"
                value={newTopico.cadernoQuestoesUrl}
                onChange={(e) => setNewTopico({ ...newTopico, cadernoQuestoesUrl: e.target.value })}
                placeholder="https://exemplo.com/caderno"
              />
            </div>
            
            <QuestionsManager
              questoesIds={newTopico.questoesIds}
              newQuestaoId={newQuestaoId}
              setNewQuestaoId={setNewQuestaoId}
              addQuestaoId={addQuestaoId}
              removeQuestaoId={removeQuestaoId}
              label="Questões"
            />
            
            <Button onClick={handleCreateTopico} className="w-full">Cadastrar Tópico</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditTopicoModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        topico={currentTopico}
        onSave={handleSaveTopico}
      />
      
      <DeleteTopicoModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        topico={currentTopico}
        onDelete={handleDeleteTopico}
      />
    </div>
  );
};

export default Topicos;
