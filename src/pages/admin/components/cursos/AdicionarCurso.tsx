import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { CursosPageProps } from "./CursosTypes";

interface DisciplinaOpcao {
  id: string;
  titulo: string;
  banca: string | null;
}

const normalizar = (t: string) => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const AdicionarCurso: React.FC<CursosPageProps> = ({
  tituloNovoCurso,
  setTituloNovoCurso,
  descricaoNovoCurso,
  setDescricaoNovoCurso,
  informacoesCurso,
  setInformacoesCurso,
  handleAdicionarCurso,
}) => {
  const [disciplinas, setDisciplinas] = useState<DisciplinaOpcao[]>([]);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    supabase
      .from("disciplinas")
      .select("id, titulo, banca")
      .order("titulo")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar disciplinas:", error);
          return;
        }
        setDisciplinas((data || []) as DisciplinaOpcao[]);
      });
  }, []);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return disciplinas
      .filter((d) => !termo || normalizar(d.titulo).includes(termo) || normalizar(d.banca || "").includes(termo))
      .slice(0, 100);
  }, [disciplinas, busca]);

  const alternar = (id: string) =>
    setEscolhidas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const criar = async () => {
    setCriando(true);
    try {
      const ok = await handleAdicionarCurso(escolhidas);
      if (ok !== false) {
        setEscolhidas([]);
        setBusca("");
      }
    } finally {
      setCriando(false);
    }
  };

  const tituloDe = (id: string) => disciplinas.find((d) => d.id === id)?.titulo || id;

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4 text-[#272f3c]">Adicionar Novo Curso</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="titulo-curso" className="mb-1 block text-[#67748a]">Título *</Label>
          <Input
            id="titulo-curso"
            placeholder="Digite o título do curso"
            value={tituloNovoCurso}
            onChange={(e) => setTituloNovoCurso(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="descricao-curso" className="mb-1 block text-[#67748a]">Cargo</Label>
          <Input
            id="descricao-curso"
            placeholder="Digite o cargo"
            value={descricaoNovoCurso}
            onChange={(e) => setDescricaoNovoCurso(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="informacoes-curso" className="mb-1 block text-[#67748a]">Informações do Curso</Label>
        <Textarea
          id="informacoes-curso"
          placeholder="Digite informações detalhadas sobre o curso"
          value={informacoesCurso}
          onChange={(e) => setInformacoesCurso(e.target.value)}
          className="resize-y min-h-[100px]"
        />
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="busca-disciplinas" className="block text-[#67748a]">
          Disciplinas do curso ({escolhidas.length} escolhidas)
        </Label>
        {escolhidas.length > 0 && (
          <ol className="flex flex-wrap gap-2">
            {escolhidas.map((id, i) => (
              <li key={id} className="flex items-center gap-1 rounded-full bg-[#f8f5ff] pl-3 pr-1 py-1 text-xs text-[#272f3c]">
                <span className="text-[#67748a]">{i + 1}.</span>
                <span className="truncate max-w-[220px]">{tituloDe(id)}</span>
                <button type="button" onClick={() => alternar(id)} className="p-0.5 text-gray-500 hover:text-red-500" aria-label="Remover">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="relative">
          <Input
            id="busca-disciplinas"
            placeholder="Buscar disciplina por título ou banca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pr-9"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="max-h-56 overflow-y-auto rounded border border-gray-200">
          {filtradas.length === 0 ? (
            <p className="p-3 text-sm text-[#67748a]">Nenhuma disciplina encontrada.</p>
          ) : (
            filtradas.map((d) => (
              <label
                key={d.id}
                className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <Checkbox checked={escolhidas.includes(d.id)} onCheckedChange={() => alternar(d.id)} />
                <span className="text-[#272f3c]">{d.titulo}</span>
                {d.banca && <span className="text-xs text-[#67748a]">· {d.banca}</span>}
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-[#67748a]">
          As aulas, os tópicos e as questões das disciplinas escolhidas entram no curso automaticamente, na ordem escolhida.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={criar}
          className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90"
          disabled={!tituloNovoCurso.trim() || criando}
        >
          {criando ? "Criando..." : "Adicionar Curso"}
        </Button>
      </div>
    </div>
  );
};
