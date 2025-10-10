import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeiSeca {
  id: string;
  titulo: string;
  conteudo: string;
  palavras_treino: Array<{
    palavra: string;
    posicao: number;
  }>;
}

interface LeiSecaViewerProps {
  lei: LeiSeca;
  onBack: () => void;
}

export const LeiSecaViewer = ({ lei, onBack }: LeiSecaViewerProps) => {
  const [modoTreino, setModoTreino] = useState(false);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [palavrasReveladas, setPalavrasReveladas] = useState<Set<number>>(new Set());

  // Processar o conteúdo para substituir palavras por inputs
  const conteudoProcessado = useMemo(() => {
    if (!modoTreino || !lei.palavras_treino || lei.palavras_treino.length === 0) {
      return lei.conteudo;
    }

    let resultado = lei.conteudo;
    const palavrasOrdenadas = [...lei.palavras_treino].sort((a, b) => b.posicao - a.posicao);

    palavrasOrdenadas.forEach((item, index) => {
      const palavra = item.palavra;
      const posicao = item.posicao;
      
      if (palavrasReveladas.has(index)) {
        // Palavra foi revelada, mostrar em destaque
        const antes = resultado.substring(0, posicao);
        const depois = resultado.substring(posicao + palavra.length);
        resultado = `${antes}<span class="palavra-revelada">${palavra}</span>${depois}`;
      } else {
        // Substituir por input
        const antes = resultado.substring(0, posicao);
        const depois = resultado.substring(posicao + palavra.length);
        resultado = `${antes}<span class="input-placeholder" data-index="${index}" data-palavra="${palavra}"></span>${depois}`;
      }
    });

    return resultado;
  }, [lei.conteudo, lei.palavras_treino, modoTreino, palavrasReveladas]);

  const handleInputChange = (index: number, value: string, palavraCorreta: string) => {
    setRespostas(prev => ({ ...prev, [index]: value }));
    
    // Verificar se a resposta está correta (case insensitive)
    if (value.trim().toLowerCase() === palavraCorreta.toLowerCase()) {
      setPalavrasReveladas(prev => new Set([...prev, index]));
    }
  };

  const renderConteudo = () => {
    if (!modoTreino) {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">
            {lei.conteudo}
          </p>
        </div>
      );
    }

    // Criar elementos dinamicamente para o modo treino
    const parser = new DOMParser();
    const doc = parser.parseFromString(conteudoProcessado, 'text/html');
    const elementos: JSX.Element[] = [];
    let textoAtual = '';
    let key = 0;

    const processarNodo = (nodo: Node) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        textoAtual += nodo.textContent || '';
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        
        if (textoAtual) {
          elementos.push(
            <span key={key++} className="whitespace-pre-wrap">
              {textoAtual}
            </span>
          );
          textoAtual = '';
        }

        if (elemento.classList.contains('input-placeholder')) {
          const index = parseInt(elemento.getAttribute('data-index') || '0');
          const palavraCorreta = elemento.getAttribute('data-palavra') || '';
          
          elementos.push(
            <Input
              key={key++}
              type="text"
              value={respostas[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value, palavraCorreta)}
              className="inline-block w-32 h-8 mx-1 text-center"
              placeholder="______"
            />
          );
        } else if (elemento.classList.contains('palavra-revelada')) {
          elementos.push(
            <span key={key++} className="bg-primary/20 px-1 rounded font-semibold">
              {elemento.textContent}
            </span>
          );
        } else {
          Array.from(elemento.childNodes).forEach(processarNodo);
        }
      }
    };

    Array.from(doc.body.childNodes).forEach(processarNodo);
    
    if (textoAtual) {
      elementos.push(
        <span key={key++} className="whitespace-pre-wrap">
          {textoAtual}
        </span>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <div className="text-foreground leading-relaxed">
          {elementos}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant={!modoTreino ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setModoTreino(false);
              setRespostas({});
              setPalavrasReveladas(new Set());
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          
          {lei.palavras_treino && lei.palavras_treino.length > 0 && (
            <Button
              variant={modoTreino ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModoTreino(true);
                setRespostas({});
                setPalavrasReveladas(new Set());
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Treinar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{lei.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderConteudo()}
          
          {modoTreino && lei.palavras_treino && lei.palavras_treino.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Progresso: {palavrasReveladas.size} de {lei.palavras_treino.length} palavras encontradas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};