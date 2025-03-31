import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Card from './Card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ImportQuestionsCardProps {
  onQuestionsImported: () => void;
}

const ImportQuestionsCard: React.FC<ImportQuestionsCardProps> = ({ onQuestionsImported }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  // Função para gerar UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Função para decodificar texto UTF-8
  const decodeUTF8 = (text: string) => {
    try {
      // Primeiro decodifica o texto UTF-8
      const decoded = decodeURIComponent(escape(text));
      
      // Substitui caracteres especiais problemáticos
      return decoded
        .replace(/[\u2018\u2019]/g, "'") // Aspas simples curvas
        .replace(/[\u201C\u201D]/g, '"') // Aspas duplas curvas
        .replace(/[\u2013\u2014]/g, '–') // Travessões
        .replace(/[\u2026]/g, '...') // Reticências
        .replace(/[\u00A0]/g, ' ') // Espaço não-quebrável
        .replace(/[\u2022]/g, '•') // Bullet point
        .replace(/[\u2010\u2011\u2012\u2015]/g, '-') // Outros tipos de hífens
        .replace(/\r\n/g, '\n') // Normaliza quebras de linha
        .replace(/\r/g, '\n'); // Normaliza quebras de linha
    } catch (e) {
      console.error('Erro ao decodificar texto:', e);
      return text;
    }
  };

  // Função para baixar imagem e fazer upload para o Supabase Storage
  const downloadAndUploadImage = async (imageUrl: string): Promise<string> => {
    try {
      // Gerar nome único para o arquivo
      const fileName = `${generateUUID()}.jpg`;
      const filePath = `imagens/${fileName}`;

      console.log('Iniciando download da imagem:', imageUrl);

      // Usar nossa rota de proxy para baixar a imagem
      const proxyUrl = `/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      console.log('URL do proxy:', proxyUrl);

      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do proxy:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type recebido:', contentType);

      const blob = await response.blob();
      console.log('Tamanho do blob:', blob.size, 'bytes');

      // Fazer upload para o Supabase Storage
      console.log('Iniciando upload para o Supabase:', filePath);
      const { data, error } = await supabase.storage
        .from('questoes')
        .upload(filePath, blob, {
          contentType: contentType || 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload para o Supabase:', error);
        throw error;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('questoes')
        .getPublicUrl(filePath);

      console.log('Upload concluído com sucesso:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro detalhado ao processar imagem:', error);
      return imageUrl; // Retorna URL original em caso de erro
    }
  };

  // Função para processar conteúdo e substituir URLs de imagens
  const processContentWithImages = async (content: string): Promise<string> => {
    try {
      // Encontrar todas as URLs de imagens no conteúdo
      const imageRegex = /(https?:\/\/[^\s<>"]+?\.(?:png|jpe?g|gif|webp))/gi;
      const matches = content.match(imageRegex) || [];
      
      // Processar cada URL encontrada
      for (const imageUrl of matches) {
        try {
          const newUrl = await downloadAndUploadImage(imageUrl);
          content = content.replace(imageUrl, newUrl);
          console.log(`Imagem processada: ${imageUrl} -> ${newUrl}`);
        } catch (error) {
          console.error(`Erro ao processar imagem ${imageUrl}:`, error);
        }
      }

      return content;
    } catch (error) {
      console.error('Erro ao processar conteúdo:', error);
      return content;
    }
  };

  const processCSV = async (file: File) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Ler o arquivo como UTF-8 com BOM
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Decodificar o texto UTF-8
        const decodedText = decodeUTF8(result);
        resolve(decodedText);
      };
      reader.readAsBinaryString(file);
    });

    // Remover BOM se presente
    const cleanText = text.replace(/^\uFEFF/, '');
    
    const rows = cleanText.split('\n');
    const headers = rows[0].split('###').map(header => header.trim());
    const questions = [];

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      const values = rows[i].split('###').map(value => value.trim());
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

      // Processar imagens no conteúdo
      const processedContent = await processContentWithImages(row.content);
      const processedTeacherExplanation = await processContentWithImages(row.teacherexplanation || '');
      const processedAIExplanation = await processContentWithImages(row.aiexplanation || '');
      const processedExpandableContent = await processContentWithImages(row.expandablecontent || '');

      // Normalizar a resposta correta (remover espaços e converter para maiúsculo)
      const correctAnswer = row.correctanswer?.toString()?.trim()?.toUpperCase() || '';
      console.log('Dados da resposta:', {
        correctAnswerOriginal: row.correctanswer,
        correctAnswerNormalizado: correctAnswer,
        tipo: typeof correctAnswer,
        tamanho: correctAnswer.length
      });

      // Transformar as alternativas no formato esperado pelo banco
      const options = [
        { id: 'A', text: row.optionA, isCorrect: false },
        { id: 'B', text: row.optionB, isCorrect: false },
        { id: 'C', text: row.optionC, isCorrect: false },
        { id: 'D', text: row.optionD, isCorrect: false },
        { id: 'E', text: row.optionE, isCorrect: false }
      ].filter(option => option.text); // Remove opções vazias

      // Marcar a alternativa correta
      let foundCorrect = false;
      options.forEach(option => {
        // Comparar strings diretamente
        const isCorrect = option.id === correctAnswer;
        if (isCorrect) {
          option.isCorrect = true;
          foundCorrect = true;
          console.log(`Alternativa ${option.id} marcada como correta. Comparação: ${option.id} === ${correctAnswer}`);
        }
      });

      if (!foundCorrect) {
        console.warn(`Nenhuma alternativa marcada como correta. Resposta esperada: "${correctAnswer}"`);
        console.log('Alternativas disponíveis:', options.map(o => o.id));
      }

      // Log detalhado para debug
      console.log('Processando questão:', {
        correctAnswer: `"${correctAnswer}"`, // Mostrar aspas para visualizar espaços
        correctAnswerTipo: typeof correctAnswer,
        correctAnswerBytes: Array.from(correctAnswer).map(c => c.charCodeAt(0)),
        options: options.map(opt => ({
          id: `"${opt.id}"`, // Mostrar aspas para visualizar espaços
          idTipo: typeof opt.id,
          idBytes: Array.from(opt.id).map(c => c.charCodeAt(0)),
          isCorrect: opt.isCorrect,
          text: opt.text.substring(0, 50) + '...'
        }))
      });

      // Transformar tópicos em array
      const topicos = row.topicos 
        ? row.topicos.split(',')
          .map(t => t.trim())
          .filter(Boolean)
        : [];

      // Criar objeto da questão no formato do banco
      const question = {
        id: generateUUID(),
        user_id: user.id,
        year: row.year,
        institution: row.institution,
        organization: row.organization,
        role: row.role,
        discipline: row.discipline,
        level: row.level,
        difficulty: row.difficulty,
        questiontype: row.questiontype,
        content: processedContent,
        teacherexplanation: processedTeacherExplanation,
        aiexplanation: processedAIExplanation,
        expandablecontent: processedExpandableContent,
        topicos,
        options
      };

      questions.push(question);
    }

    return questions;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      if (!user) {
        toast.error('Você precisa estar logado para importar questões');
        return;
      }

      // Verificar se é um arquivo CSV
      if (!file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }

      // Processar o arquivo CSV
      const questions = await processCSV(file);

      // Log para verificar as questões antes de inserir
      console.log('Questões a serem inseridas:', questions.map(q => ({
        content: q.content.substring(0, 50) + '...',
        options: q.options.map(opt => ({
          id: opt.id,
          isCorrect: opt.isCorrect
        }))
      })));

      // Inserir questões no banco de dados
      console.log('Estrutura da primeira questão:', JSON.stringify(questions[0], null, 2));
      
      // Garantir que estamos enviando apenas os campos necessários
      const questionsToInsert = questions.map(q => ({
        id: q.id,
        user_id: q.user_id,
        year: q.year,
        institution: q.institution,
        organization: q.organization,
        role: q.role,
        discipline: q.discipline,
        level: q.level,
        difficulty: q.difficulty,
        questiontype: q.questiontype,
        content: q.content,
        teacherexplanation: q.teacherexplanation,
        aiexplanation: q.aiexplanation,
        expandablecontent: q.expandablecontent,
        topicos: q.topicos,
        options: q.options
      }));

      console.log('Estrutura da primeira questão após limpeza:', JSON.stringify(questionsToInsert[0], null, 2));

      const { data, error } = await supabase
        .from('questoes')
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error('Erro detalhado do Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Dados inseridos com sucesso:', data);
      toast.success(`${questions.length} questões importadas com sucesso!`);
      onQuestionsImported();
    } catch (error) {
      console.error('Erro ao importar questões:', error);
      toast.error('Erro ao importar questões. Verifique o formato do arquivo.');
    } finally {
      setIsUploading(false);
      // Limpar o input file
      event.target.value = '';
    }
  };

  return (
    <Card title="Importar Questões" description="Importe questões a partir de um arquivo CSV" defaultOpen={false}>
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">CSV (Máximo 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f2ebe]"></div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p className="font-semibold mb-2">O arquivo CSV deve conter as seguintes colunas (separadas por ###):</p>
          <ul className="list-disc list-inside space-y-1">
            <li>year, institution, organization, role</li>
            <li>discipline, level, difficulty</li>
            <li>questiontype, content, teacherexplanation</li>
            <li>aiexplanation, expandablecontent, topicos</li>
            <li>optionA, optionB, optionC, optionD, optionE</li>
            <li>correctanswer (A, B, C, D ou E)</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">Obs: Os tópicos devem ser separados por vírgula dentro da coluna topicos</p>
        </div>
      </div>
    </Card>
  );
};

export default ImportQuestionsCard; 