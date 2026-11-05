import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { botaoPrimario } from "@/components/admin/ui/listagem";
import { ConteudoCartao } from "@/components/flashcards/ConteudoCartao";
import type { Flashcard } from "@/lib/flashcards";
import { EscolherCursos, EscolherTopico, deEscolha, paraEscolha, type EscolhaCursos } from "./Escolhas";
import type { FlashcardsAdmin } from "./useFlashcardsAdmin";

/** Criar ou editar um flashcard. */
export const FlashcardDialog: React.FC<{
  aberto: boolean;
  onFechar: () => void;
  cartao: Flashcard | null;
  /** Tópico já escolhido ao criar (filtro da página) */
  topicoInicial?: string | null;
  admin: FlashcardsAdmin;
}> = ({ aberto, onFechar, cartao, topicoInicial, admin }) => {
  const [topicoId, setTopicoId] = useState<string | null>(null);
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [tags, setTags] = useState("");
  const [cursos, setCursos] = useState<EscolhaCursos>({ todos: true, ids: [] });
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setTopicoId(cartao?.topicoId ?? topicoInicial ?? null);
    setFrente(cartao?.frente ?? "");
    setVerso(cartao?.verso ?? "");
    setTags((cartao?.tags ?? []).join(" "));
    setCursos(paraEscolha(cartao?.cursosIds ?? []));
    setPrevia(false);
  }, [aberto, cartao, topicoInicial]);

  const salvar = async (continuar: boolean) => {
    if (!topicoId) return toast.error("Escolha o tópico do flashcard.");
    if (!frente.trim() || !verso.trim()) return toast.error("Preencha a frente e o verso.");
    if (!cursos.todos && cursos.ids.length === 0) return toast.error("Escolha ao menos um curso ou marque “Todos os cursos”.");
    const dados = {
      topicoId,
      frente: frente.trim(),
      verso: verso.trim(),
      tags: Array.from(new Set(tags.split(/[\s,]+/).filter(Boolean))),
      cursosIds: deEscolha(cursos),
    };
    setSalvando(true);
    try {
      if (cartao) {
        if (await admin.atualizar(cartao.id, dados)) {
          toast.success("Flashcard salvo");
          onFechar();
        }
      } else if ((await admin.criar([dados])) > 0) {
        toast.success("Flashcard criado");
        if (continuar) {
          setFrente("");
          setVerso("");
          setPrevia(false);
        } else onFechar();
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cartao ? "Editar flashcard" : "Novo flashcard"}</DialogTitle>
          <DialogDescription>O cartão aparece na aba Flashcards dos cursos e como botão abaixo do vídeo do tópico.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tópico *</Label>
            <EscolherTopico topicos={admin.topicos} valor={topicoId} onChange={setTopicoId} cursosDoTopico={admin.cursosDoTopico} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="flash-frente">Frente (pergunta) *</Label>
              <button type="button" onClick={() => setPrevia((v) => !v)} className="text-xs font-medium text-[#5f2ebe] hover:underline">
                {previa ? "Editar" : "Pré-visualizar"}
              </button>
            </div>
            {previa ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <ConteudoCartao texto={frente || "—"} className="text-center font-medium text-slate-900" />
                <div className="border-t border-dashed border-slate-300" />
                <ConteudoCartao texto={verso || "—"} className="text-center text-slate-700" />
              </div>
            ) : (
              <>
                <Textarea id="flash-frente" value={frente} onChange={(e) => setFrente(e.target.value)} rows={3} placeholder="Ex.: Quais são os princípios do art. 37 da CF?" />
                <Label htmlFor="flash-verso" className="block pt-2">
                  Verso (resposta) *
                </Label>
                <Textarea id="flash-verso" value={verso} onChange={(e) => setVerso(e.target.value)} rows={4} placeholder="Ex.: Legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE)." />
                <p className="text-xs text-slate-500">Aceita texto simples ou HTML (negrito, listas, imagens com link público), como no Anki.</p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flash-tags">Tags</Label>
            <Input id="flash-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Opcional, separadas por espaço" />
          </div>

          <div className="space-y-1.5">
            <Label>Em quais cursos aparece</Label>
            <EscolherCursos nome="flash-cursos" cursos={admin.cursos} valor={cursos} onChange={setCursos} destaque={topicoId ? admin.cursosDoTopico[topicoId] || [] : []} />
          </div>
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          {!cartao && (
            <Button variant="outline" onClick={() => salvar(true)} disabled={salvando}>
              Salvar e criar outro
            </Button>
          )}
          <Button onClick={() => salvar(false)} disabled={salvando} className={botaoPrimario}>
            {salvando ? "Salvando..." : cartao ? "Salvar" : "Criar flashcard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Define os cursos de vários cartões de uma vez. */
export const DefinirCursosDialog: React.FC<{
  aberto: boolean;
  onFechar: () => void;
  ids: string[];
  admin: FlashcardsAdmin;
  onConcluido: () => void;
}> = ({ aberto, onFechar, ids, admin, onConcluido }) => {
  const [cursos, setCursos] = useState<EscolhaCursos>({ todos: true, ids: [] });
  const [salvando, setSalvando] = useState(false);

  // Cursos que usam ao menos um dos tópicos dos cartões escolhidos
  const destaque = Array.from(
    new Set(
      admin.cartoes
        .filter((c) => ids.includes(c.id))
        .flatMap((c) => admin.cursosDoTopico[c.topicoId] || [])
    )
  );

  useEffect(() => {
    if (aberto) setCursos({ todos: true, ids: [] });
  }, [aberto]);

  const salvar = async () => {
    if (!cursos.todos && cursos.ids.length === 0) return toast.error("Escolha ao menos um curso.");
    setSalvando(true);
    try {
      if (await admin.definirCursos(ids, deEscolha(cursos))) {
        toast.success(`Cursos definidos para ${ids.length} ${ids.length === 1 ? "cartão" : "cartões"}`);
        onConcluido();
        onFechar();
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Em quais cursos aparecem {ids.length} {ids.length === 1 ? "cartão" : "cartões"}?
          </DialogTitle>
          <DialogDescription>Substitui a escolha atual de cada cartão selecionado.</DialogDescription>
        </DialogHeader>
        <EscolherCursos nome="lote-cursos" cursos={admin.cursos} valor={cursos} onChange={setCursos} destaque={destaque} />
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando} className={botaoPrimario}>
            {salvando ? "Salvando..." : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
