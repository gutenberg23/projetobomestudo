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
        .replace(/[\u2013\u2014]/g, '-') // Substitui hífens especiais
        .replace(/[\u2018\u2019]/g, "'") // Substitui aspas simples especiais
        .replace(/[\u201C\u201D]/g, '"') // Substitui aspas duplas especiais
        .replace(/[\u2026]/g, '...') // Substitui reticências especiais
        .replace(/[\u00A0]/g, ' ') // Substitui espaço não-quebrável
        .replace(/[\u2022]/g, '•') // Substitui bullet point
        .replace(/[\u2013\u2014]/g, '-') // Substitui hífens especiais
        .replace(/[\u2010\u2011\u2012\u2015]/g, '-') // Substitui outros tipos de hífens
        .replace(/[\u00B0]/g, '°') // Substitui grau
        .replace(/[\u00AE]/g, '®') // Substitui registro
        .replace(/[\u2122]/g, '™') // Substitui trademark
        .replace(/[\u00A9]/g, '©') // Substitui copyright
        .replace(/[\u00A7]/g, '§') // Substitui seção
        .replace(/[\u00B6]/g, '¶') // Substitui parágrafo
        .replace(/[\u00B7]/g, '·') // Substitui ponto médio
        .replace(/[\u00B4]/g, "'") // Substitui acento agudo
        .replace(/[\u00B8]/g, '¸') // Substitui cedilha
        .replace(/[\u00B0]/g, '°') // Substitui grau
        .replace(/[\u00B1]/g, '±') // Substitui mais/menos
        .replace(/[\u00B2]/g, '²') // Substitui ao quadrado
        .replace(/[\u00B3]/g, '³') // Substitui ao cubo
        .replace(/[\u00B5]/g, 'µ') // Substitui micro
        .replace(/[\u00B9]/g, '¹') // Substitui expoente 1
        .replace(/[\u00BA]/g, 'º') // Substitui ordinal masculino
        .replace(/[\u00BB]/g, '»') // Substitui aspas duplas angulares
        .replace(/[\u00BC]/g, '¼') // Substitui um quarto
        .replace(/[\u00BD]/g, '½') // Substitui meio
        .replace(/[\u00BE]/g, '¾') // Substitui três quartos
        .replace(/[\u00BF]/g, '¿') // Substitui interrogação invertida
        .replace(/[\u00C0]/g, 'À') // Substitui A com grave
        .replace(/[\u00C1]/g, 'Á') // Substitui A com agudo
        .replace(/[\u00C2]/g, 'Â') // Substitui A com circunflexo
        .replace(/[\u00C3]/g, 'Ã') // Substitui A com til
        .replace(/[\u00C4]/g, 'Ä') // Substitui A com trema
        .replace(/[\u00C5]/g, 'Å') // Substitui A com anel
        .replace(/[\u00C6]/g, 'Æ') // Substitui AE
        .replace(/[\u00C7]/g, 'Ç') // Substitui C com cedilha
        .replace(/[\u00C8]/g, 'È') // Substitui E com grave
        .replace(/[\u00C9]/g, 'É') // Substitui E com agudo
        .replace(/[\u00CA]/g, 'Ê') // Substitui E com circunflexo
        .replace(/[\u00CB]/g, 'Ë') // Substitui E com trema
        .replace(/[\u00CC]/g, 'Ì') // Substitui I com grave
        .replace(/[\u00CD]/g, 'Í') // Substitui I com agudo
        .replace(/[\u00CE]/g, 'Î') // Substitui I com circunflexo
        .replace(/[\u00CF]/g, 'Ï') // Substitui I com trema
        .replace(/[\u00D0]/g, 'Ð') // Substitui ETH
        .replace(/[\u00D1]/g, 'Ñ') // Substitui N com til
        .replace(/[\u00D2]/g, 'Ò') // Substitui O com grave
        .replace(/[\u00D3]/g, 'Ó') // Substitui O com agudo
        .replace(/[\u00D4]/g, 'Ô') // Substitui O com circunflexo
        .replace(/[\u00D5]/g, 'Õ') // Substitui O com til
        .replace(/[\u00D6]/g, 'Ö') // Substitui O com trema
        .replace(/[\u00D7]/g, '×') // Substitui multiplicação
        .replace(/[\u00D8]/g, 'Ø') // Substitui O com barra
        .replace(/[\u00D9]/g, 'Ù') // Substitui U com grave
        .replace(/[\u00DA]/g, 'Ú') // Substitui U com agudo
        .replace(/[\u00DB]/g, 'Û') // Substitui U com circunflexo
        .replace(/[\u00DC]/g, 'Ü') // Substitui U com trema
        .replace(/[\u00DD]/g, 'Ý') // Substitui Y com agudo
        .replace(/[\u00DE]/g, 'Þ') // Substitui THORN
        .replace(/[\u00DF]/g, 'ß') // Substitui eszett
        .replace(/[\u00E0]/g, 'à') // Substitui a com grave
        .replace(/[\u00E1]/g, 'á') // Substitui a com agudo
        .replace(/[\u00E2]/g, 'â') // Substitui a com circunflexo
        .replace(/[\u00E3]/g, 'ã') // Substitui a com til
        .replace(/[\u00E4]/g, 'ä') // Substitui a com trema
        .replace(/[\u00E5]/g, 'å') // Substitui a com anel
        .replace(/[\u00E6]/g, 'æ') // Substitui ae
        .replace(/[\u00E7]/g, 'ç') // Substitui c com cedilha
        .replace(/[\u00E8]/g, 'è') // Substitui e com grave
        .replace(/[\u00E9]/g, 'é') // Substitui e com agudo
        .replace(/[\u00EA]/g, 'ê') // Substitui e com circunflexo
        .replace(/[\u00EB]/g, 'ë') // Substitui e com trema
        .replace(/[\u00EC]/g, 'ì') // Substitui i com grave
        .replace(/[\u00ED]/g, 'í') // Substitui i com agudo
        .replace(/[\u00EE]/g, 'î') // Substitui i com circunflexo
        .replace(/[\u00EF]/g, 'ï') // Substitui i com trema
        .replace(/[\u00F0]/g, 'ð') // Substitui eth
        .replace(/[\u00F1]/g, 'ñ') // Substitui n com til
        .replace(/[\u00F2]/g, 'ò') // Substitui o com grave
        .replace(/[\u00F3]/g, 'ó') // Substitui o com agudo
        .replace(/[\u00F4]/g, 'ô') // Substitui o com circunflexo
        .replace(/[\u00F5]/g, 'õ') // Substitui o com til
        .replace(/[\u00F6]/g, 'ö') // Substitui o com trema
        .replace(/[\u00F7]/g, '÷') // Substitui divisão
        .replace(/[\u00F8]/g, 'ø') // Substitui o com barra
        .replace(/[\u00F9]/g, 'ù') // Substitui u com grave
        .replace(/[\u00FA]/g, 'ú') // Substitui u com agudo
        .replace(/[\u00FB]/g, 'û') // Substitui u com circunflexo
        .replace(/[\u00FC]/g, 'ü') // Substitui u com trema
        .replace(/[\u00FD]/g, 'ý') // Substitui y com agudo
        .replace(/[\u00FE]/g, 'þ') // Substitui thorn
        .replace(/[\u00FF]/g, 'ÿ') // Substitui y com trema
        .replace(/[\u2028]/g, '\n') // Substitui quebra de linha
        .replace(/[\u2029]/g, '\n\n') // Substitui quebra de parágrafo
        .replace(/[\u202F]/g, ' ') // Substitui espaço fino
        .replace(/[\u205F]/g, ' ') // Substitui espaço matemático
        .replace(/[\u3000]/g, ' ') // Substitui espaço ideográfico
        .replace(/[\uFEFF]/g, ''); // Remove BOM
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
      const { error } = await supabase
        .from('questoes')
        .insert(questions);

      if (error) throw error;

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