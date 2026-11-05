import React, { useEffect, useMemo, useState } from "react";
import { Info, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CampoImagem } from "@/components/admin/ui/CampoImagem";
import { botaoPrimario, selectClasse } from "@/components/admin/ui/listagem";
import { DURACOES, deInputLocal, paraInputLocal, somarDias } from "@/components/admin/ui/periodo";
import { POSICOES_ANUNCIO, paginasDeAnuncio, posicaoDoCodigo } from "@/components/ads/posicoes";
import { cn } from "@/lib/utils";

export interface FormAnuncio {
  titulo: string;
  imagem_url: string;
  link_destino: string;
  data_inicio: string;
  data_fim: string;
  posicao: string;
  ativo: boolean;
  ordem: number;
}

export const novoFormAnuncio = (posicao = POSICOES_ANUNCIO[0].codigo): FormAnuncio => {
  const inicio = new Date();
  inicio.setSeconds(0, 0);
  return {
    titulo: "",
    imagem_url: "",
    link_destino: "",
    data_inicio: inicio.toISOString(),
    data_fim: somarDias(inicio.toISOString(), 30),
    posicao,
    ativo: true,
    ordem: 0,
  };
};

interface Props {
  aberto: boolean;
  editando: boolean;
  inicial: FormAnuncio;
  onFechar: () => void;
  onSalvar: (f: FormAnuncio) => Promise<boolean>;
}

const EditorAnuncio: React.FC<Props> = ({ aberto, editando, inicial, onFechar, onSalvar }) => {
  const [f, setF] = useState<FormAnuncio>(inicial);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) setF(inicial);
  }, [aberto, inicial]);

  const mudar = <K extends keyof FormAnuncio>(k: K, v: FormAnuncio[K]) => setF((x) => ({ ...x, [k]: v }));
  const posicao = posicaoDoCodigo(f.posicao);
  const antiga = !POSICOES_ANUNCIO.some((p) => p.codigo === f.posicao);
  const linkOk = !f.link_destino || /^(https?:\/\/|\/)/i.test(f.link_destino);
  const periodoOk = !!f.data_inicio && !!f.data_fim && new Date(f.data_fim) > new Date(f.data_inicio);
  const pode = !!f.titulo.trim() && !!f.imagem_url && linkOk && periodoOk;
  const grupos = useMemo(() => paginasDeAnuncio(), []);

  const enviar = async () => {
    if (!pode) return;
    setSalvando(true);
    const ok = await onSalvar({ ...f, titulo: f.titulo.trim(), link_destino: f.link_destino.trim() });
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar anúncio" : "Novo anúncio"}</DialogTitle>
          <DialogDescription>O banner aparece no espaço escolhido enquanto estiver ativo e dentro do período.</DialogDescription>
        </DialogHeader>

        <form
          id="form-anuncio"
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="an-titulo">Nome do anúncio *</Label>
            <Input id="an-titulo" value={f.titulo} onChange={(e) => mudar("titulo", e.target.value)} placeholder="Ex.: Curso INSS - Black Friday" autoFocus />
            <p className="text-[11px] text-slate-400">Só para você identificar. Também vira o texto alternativo da imagem.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="an-posicao">Onde aparece *</Label>
            <select id="an-posicao" value={f.posicao} onChange={(e) => mudar("posicao", e.target.value)} className={cn(selectClasse, "h-10 w-full")}>
              {antiga && <option value={f.posicao}>{posicao ? `${posicao.pagina} · ${posicao.local} (código antigo)` : `${f.posicao} (não existe mais)`}</option>}
              {grupos.map((g) => (
                <optgroup key={g} label={g}>
                  {POSICOES_ANUNCIO.filter((p) => p.pagina === g).map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.pagina} · {p.local}
                      {p.repete ? ` (${p.repete})` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {posicao ? (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span>Tamanho sugerido: {posicao.tamanho}</span>
                {posicao.repete && (
                  <span className="inline-flex items-center gap-1 text-[#5f2ebe]">
                    <Repeat className="h-3 w-3" /> Repete {posicao.repete}; vários anúncios aqui se revezam
                  </span>
                )}
              </p>
            ) : (
              <p className="text-[11px] text-amber-700">Esse espaço não existe mais no site. Escolha outro para o anúncio voltar a aparecer.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Imagem do banner *</Label>
            <CampoImagem
              url={f.imagem_url}
              onChange={(u) => mudar("imagem_url", u)}
              pasta="anuncios"
              dica="JPG, PNG, GIF ou WebP até 3 MB. Sem imagem o anúncio não aparece."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="an-link">Link ao clicar</Label>
            <Input
              id="an-link"
              value={f.link_destino}
              onChange={(e) => mudar("link_destino", e.target.value)}
              placeholder="https://… ou /explore"
              inputMode="url"
            />
            {linkOk ? (
              <p className="text-[11px] text-slate-400">Links de outros sites abrem em nova aba. Deixe vazio para um banner sem link.</p>
            ) : (
              <p className="text-[11px] text-red-600">Comece com https:// (outro site) ou / (página deste site).</p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-800">Período</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="an-inicio" className="text-xs text-slate-500">
                  Começa
                </Label>
                <Input
                  id="an-inicio"
                  type="datetime-local"
                  value={paraInputLocal(f.data_inicio)}
                  onChange={(e) => mudar("data_inicio", deInputLocal(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="an-fim" className="text-xs text-slate-500">
                  Termina
                </Label>
                <Input id="an-fim" type="datetime-local" value={paraInputLocal(f.data_fim)} onChange={(e) => mudar("data_fim", deInputLocal(e.target.value))} required />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Duração:</span>
              {DURACOES.map((d) => (
                <button
                  key={d.dias}
                  type="button"
                  onClick={() => mudar("data_fim", somarDias(f.data_inicio || new Date().toISOString(), d.dias))}
                  className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-[#5f2ebe]/40 hover:bg-[#5f2ebe]/5 hover:text-[#5f2ebe]"
                >
                  {d.rotulo}
                </button>
              ))}
            </div>
            {!periodoOk && <p className="text-[11px] text-red-600">O fim precisa ser depois do início.</p>}
          </fieldset>

          <div className="grid gap-4 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="an-ordem" className="flex items-center gap-1">
                Prioridade
              </Label>
              <Input
                id="an-ordem"
                type="number"
                min={0}
                value={f.ordem}
                onChange={(e) => mudar("ordem", Math.max(0, parseInt(e.target.value) || 0))}
                className="h-9 w-24"
              />
              <p className="flex gap-1 text-[11px] text-slate-400">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Menor número aparece primeiro quando há mais de um anúncio no mesmo espaço.
              </p>
            </div>
            <div className="flex items-start justify-between gap-3 sm:block">
              <div>
                <Label htmlFor="an-ativo">Ativo</Label>
                <p className="text-[11px] text-slate-400">Desligue para pausar sem apagar.</p>
              </div>
              <Switch id="an-ativo" checked={f.ativo} onCheckedChange={(v) => mudar("ativo", v)} className="sm:mt-2" />
            </div>
          </div>
        </form>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-anuncio" disabled={salvando || !pode} className={botaoPrimario}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar anúncio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorAnuncio;
