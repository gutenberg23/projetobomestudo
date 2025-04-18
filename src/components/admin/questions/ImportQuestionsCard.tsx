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
      const normalizedText = decoded
        // Aspas e citações
        .replace(/[\u2018\u2019]/g, "'") // Aspas simples curvas
        .replace(/[\u201C\u201D]/g, '"') // Aspas duplas curvas
        
        // Travessões e hífens
        .replace(/[\u2013\u2014]/g, '–') // Travessões
        .replace(/[\u2010\u2011\u2012\u2015]/g, '-') // Outros tipos de hífens
        
        // Outros caracteres de formatação
        .replace(/[\u2026]/g, '...') // Reticências
        .replace(/[\u00A0]/g, ' ') // Espaço não-quebrável
        .replace(/[\u2022]/g, '•') // Bullet point
        
        // Símbolos matemáticos comuns - Preservar estes caracteres
        // .replace(/[\u00B1]/g, '±') // Mais ou menos
        // .replace(/[\u00D7]/g, '×') // Multiplicação
        // .replace(/[\u00F7]/g, '÷') // Divisão
        // .replace(/[\u221A]/g, '√') // Raiz quadrada
        // .replace(/[\u222B]/g, '∫') // Integral
        // .replace(/[\u2211]/g, '∑') // Somatório
        // .replace(/[\u221E]/g, '∞') // Infinito
        // .replace(/[\u2248]/g, '≈') // Aproximadamente igual
        // .replace(/[\u2260]/g, '≠') // Diferente
        // .replace(/[\u2264]/g, '≤') // Menor ou igual
        // .replace(/[\u2265]/g, '≥') // Maior ou igual
        
        // Normaliza quebras de linha
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
        
      // Usar normalização Unicode para garantir a consistência
      // Isso ajuda a lidar com caracteres compostos
      return normalizedText.normalize('NFC');
    } catch (e) {
      console.error('Erro ao decodificar texto:', e);
      return text;
    }
  };

  // Função para baixar imagem e fazer upload para o Supabase Storage
  const downloadAndUploadImage = async (imageUrl: string): Promise<string> => {
    try {
      // Verificar se a URL é válida
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log('URL de imagem inválida ou vazia:', imageUrl);
        return imageUrl; // Retornar a URL original se for inválida
      }

      // Gerar nome único para o arquivo
      const fileName = `${generateUUID()}.jpg`;
      const filePath = `imagens/${fileName}`;

      console.log('Iniciando download da imagem:', imageUrl);

      try {
        // Usar nossa rota de proxy para baixar a imagem
        const proxyUrl = `/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        console.log('URL do proxy:', proxyUrl);

        // Configuramos um AbortController para implementar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal 
        });
        
        // Limpar o timeout se a resposta for recebida
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn(`Proxy falhou (${response.status}), mantendo URL original: ${imageUrl}`);
          // Se o proxy falhar, manter a URL original em vez de lançar erro
          return imageUrl;
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
          console.warn('Erro no upload para o Supabase, mantendo URL original:', error);
          return imageUrl;
        }

        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('questoes')
          .getPublicUrl(filePath);

        console.log('Upload concluído com sucesso:', publicUrl);
        return publicUrl;
      } catch (proxyError) {
        console.warn('Erro ao usar proxy para imagem, mantendo URL original:', proxyError);
        return imageUrl; // Em caso de erro no proxy, manter a URL original
      }
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
    // Verificar se há pelo menos duas linhas (cabeçalho + dados)
    if (rows.length < 2) {
      throw new Error('Arquivo CSV vazio ou sem dados');
    }
    
    const headers = rows[0].split('###').map(header => header.trim());
    
    // Verificar se temos os cabeçalhos mínimos necessários
    const requiredHeaders = ['year', 'institution', 'organization', 'discipline', 'questiontype', 'content'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
    }
    
    const questions = [];
    let processedRows = 0;
    let skippedRows = 0;

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) {
        skippedRows++;
        continue;
      }

      try {
        const values = rows[i].split('###').map(value => value.trim());
        
        // Verificar se o número de valores corresponde ao número de cabeçalhos
        if (values.length !== headers.length) {
          console.warn(`Linha ${i} ignorada: número de colunas (${values.length}) difere do número de cabeçalhos (${headers.length})`);
          skippedRows++;
          continue;
        }
        
        const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

        // Verificar campos obrigatórios
        if (!row.content || !row.questiontype) {
          console.warn(`Linha ${i} ignorada: campos obrigatórios ausentes (content, questiontype)`);
          skippedRows++;
          continue;
        }
        
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

        // Transformar tópicos em array
        const topicos = row.topicos 
          ? row.topicos.split(',')
            .map(t => t.trim())
            .filter(Boolean)
          : [];
          
        // Transformar assuntos em array usando ponto e vírgula como separador
        const assuntos = row.assuntos 
          ? row.assuntos.split(';')
            .map(a => a.trim())
            .filter(Boolean)
          : [];
          
        // Transformar role em array (pode ser uma única string separada por vírgulas ou valor único)
        const role = row.role
          ? row.role.includes(',')
            ? row.role.split(',').map(r => r.trim()).filter(Boolean)
            : [row.role.trim()]
          : [];

        // Criar objeto da questão no formato do banco
        const question = {
          id: generateUUID(),
          user_id: user.id,
          year: row.year,
          institution: row.institution,
          organization: row.organization,
          role: role,
          discipline: row.discipline,
          level: row.level,
          difficulty: row.difficulty,
          questiontype: row.questiontype,
          content: processedContent,
          teacherexplanation: processedTeacherExplanation,
          aiexplanation: processedAIExplanation,
          expandablecontent: processedExpandableContent,
          topicos,
          assuntos,
          options
        };

        questions.push(question);
        processedRows++;
      } catch (error) {
        console.error(`Erro ao processar linha ${i}:`, error);
        skippedRows++;
      }
    }

    console.log(`Questões processadas: ${processedRows}, Questões ignoradas: ${skippedRows}`);
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
      
      if (questions.length === 0) {
        toast.error('Nenhuma questão válida encontrada no arquivo');
        return;
      }

      // Log para verificar as questões antes de inserir
      console.log('Questões a serem inseridas:', questions.length, 'itens');
      
      // Log detalhado da primeira questão para debug
      if (questions.length > 0) {
        const sampleQuestion = questions[0];
        console.log('Exemplo de questão formatada:', {
          id: sampleQuestion.id,
          role: sampleQuestion.role,
          topicos: sampleQuestion.topicos,
          assuntos: sampleQuestion.assuntos,
          options: sampleQuestion.options.map(o => ({ id: o.id, isCorrect: o.isCorrect }))
        });
      }

      // Inserir questões no banco de dados
      const { error } = await supabase
        .from('questoes')
        .insert(questions);

      if (error) {
        console.error('Erro detalhado ao inserir questões:', error);
        throw error;
      }

      // Mostrar resumo da importação
      const resumo = `
        Arquivo: ${file.name}
        Tamanho: ${(file.size / 1024).toFixed(2)} KB
        Questões importadas: ${questions.length}
      `;
      console.log('Resumo da importação:', resumo);

      toast.success(`${questions.length} questões importadas com sucesso!`);
      onQuestionsImported();
    } catch (error) {
      console.error('Erro ao importar questões:', error);
      
      // Mensagem de erro mais amigável baseada no tipo de erro
      let errorMessage = 'Erro ao importar questões.';
      
      if (error instanceof Error) {
        if (error.message.includes('Array value must start with')) {
          errorMessage = 'Erro no formato de array (role, topicos ou assuntos). Certifique-se de que os valores estão no formato correto.';
        } else if (error.message.includes('Cabeçalhos obrigatórios')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
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
            <li>assuntos (opcional)</li>
            <li>optionA, optionB, optionC, optionD, optionE</li>
            <li>correctanswer (A, B, C, D ou E)</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">Obs: Os tópicos devem ser separados por vírgula dentro da coluna topicos</p>
          <p className="text-xs text-gray-400">Obs: Os assuntos devem ser separados por ponto e vírgula (;) dentro da coluna assuntos</p>
          <p className="text-xs text-gray-400">Obs: O campo 'role' pode conter múltiplos valores separados por vírgula</p>
        </div>
      </div>
    </Card>
  );
};

export default ImportQuestionsCard; 