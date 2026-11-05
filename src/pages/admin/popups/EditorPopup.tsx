import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CampoImagem } from "@/components/admin/ui/CampoImagem";
import { botaoPrimario, selectClasse } from "@/components/admin/ui/listagem";
import { DURACOES, deInputLocal, paraInputLocal, somarDias } from "@/components/admin/ui/periodo";
import { CartaoPopup } from "@/components/popups/Popup";
import { PAGINAS_POPUP, paginaConhecida } from "@/components/popups/paginas";
import { cn } from "@/lib/utils";

export interface FormPopup {
  titulo: string;
  conteudo: string;
  imagem_url: string;
  link_destino: string;
  data_inicio: string;
  data_fim: string;
  pagina: string;
  ativo: boolean;
  ordem: number;
}

export const novoFormPopup = (pagina = "home"): FormPopup => {
  const inicio = new Date();
  inicio.setSeconds(0, 0);
  return {
    titulo: "",
    conteudo: "",
    imagem_url: "",
    link_destino: "",
    data_inicio: inicio.toISOString(),
    data_fim: somarDias(inicio.toISOString(), 7),
    pagina,
    ativo: true,
    ordem: 0,
  };
};

interface Props {
  editando: boolean;
  inicial: FormPopup;
  onFechar: () => void;
  onSalvar: (f: FormPopup) => Promise<boolean>;
}

const EditorPopup: React.FC<Props> = ({ editando, inicial, onFechar, onSalvar }) => {
  const [f, setF] = useState<FormPopup>(inicial);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => setF(inicial), [inicial]);

  const mudar = <K extends keyof FormPopup>(k: K, v: FormPopup[K]) => setF((x) => ({ ...x, [k]: v }));
  const linkOk = !f.link_destino || /^(https?:\/\/|\/)/i.test(f.link_destino);
  const periodoOk = !!f.data_inicio && !!f.data_fim && new Date(f.data_fim) > new Date(f.data_inicio);
  const temCorpo = !!f.conteudo.trim() || !!f.imagem_url;
  const pode = !!f.titulo.trim() && temCorpo && linkOk && periodoOk;

  const enviar = async () => {
    if (!pode) return;
    setSalvando(true);
    const ok = await onSalvar({ ...f, titulo: f.titulo.trim(), link_destino: f.link_destino.trim() });
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar popup" : "Novo popup"}</DialogTitle>
          <DialogDescription>Abre por cima da página escolhida, uma vez por visita. O aluno pode marcar "Não mostrar novamente".</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <form
            id="form-popup"
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="pp-titulo">Título *</Label>
              <Input id="pp-titulo" value={f.titulo} onChange={(e) => mudar("titulo", e.target.value)} placeholder="Ex.: Edital do INSS publicado!" autoFocus />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pp-texto">Texto</Label>
              <Textarea
                id="pp-texto"
                value={f.conteudo}
                onChange={(e) => mudar("conteudo", e.target.value)}
                rows={4}
                placeholder="Uma ou duas frases. Linha em branco separa parágrafos."
              />
              <p className="text-[11px] text-slate-400">Aceita texto simples ou HTML básico (&lt;b&gt;, &lt;a&gt;, &lt;br&gt;).</p>
            </div>

            <div className="space-y-1.5">
              <Label>Imagem</Label>
              <CampoImagem url={f.imagem_url} onChange={(u) => mudar("imagem_url", u)} pasta="popups" proporcao="aspect-[3/1]" dica="Opcional. Fica no topo do popup; 800 × 450 px funciona bem." />
              {!temCorpo && f.titulo && <p className="text-[11px] text-amber-700">Coloque um texto ou uma imagem.</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pp-link">Link do botão "Saiba mais"</Label>
              <Input id="pp-link" value={f.link_destino} onChange={(e) => mudar("link_destino", e.target.value)} placeholder="https://… ou /concursos" inputMode="url" />
              {linkOk ? (
                <p className="text-[11px] text-slate-400">Sem link, o popup não mostra botão.</p>
              ) : (
                <p className="text-[11px] text-red-600">Comece com https:// (outro site) ou / (página deste site).</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pp-pagina">Onde aparece *</Label>
              <select id="pp-pagina" value={f.pagina} onChange={(e) => mudar("pagina", e.target.value)} className={cn(selectClasse, "h-10 w-full")}>
                {!paginaConhecida(f.pagina) && <option value={f.pagina}>{f.pagina} (não existe mais)</option>}
                {PAGINAS_POPUP.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">{PAGINAS_POPUP.find((p) => p.codigo === f.pagina)?.descricao || "Escolha uma página da lista para o popup voltar a aparecer."}</p>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-800">Período</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pp-inicio" className="text-xs text-slate-500">
                    Começa
                  </Label>
                  <Input id="pp-inicio" type="datetime-local" value={paraInputLocal(f.data_inicio)} onChange={(e) => mudar("data_inicio", deInputLocal(e.target.value))} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pp-fim" className="text-xs text-slate-500">
                    Termina
                  </Label>
                  <Input id="pp-fim" type="datetime-local" value={paraInputLocal(f.data_fim)} onChange={(e) => mudar("data_fim", deInputLocal(e.target.value))} required />
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
                <Label htmlFor="pp-ordem">Prioridade</Label>
                <Input id="pp-ordem" type="number" min={0} value={f.ordem} onChange={(e) => mudar("ordem", Math.max(0, parseInt(e.target.value) || 0))} className="h-9 w-24" />
                <p className="flex gap-1 text-[11px] text-slate-400">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Só um popup abre por vez: o de menor número. Os outros esperam o aluno fechar o primeiro.
                </p>
              </div>
              <div className="flex items-start justify-between gap-3 sm:block">
                <div>
                  <Label htmlFor="pp-ativo">Ativo</Label>
                  <p className="text-[11px] text-slate-400">Desligue para pausar sem apagar.</p>
                </div>
                <Switch id="pp-ativo" checked={f.ativo} onCheckedChange={(v) => mudar("ativo", v)} className="sm:mt-2" />
              </div>
            </div>
          </form>

          <aside className="md:sticky md:top-0 md:self-start">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Prévia</p>
            <div className="rounded-2xl bg-slate-900/60 p-4">
              <div className="shadow-2xl">
                <CartaoPopup popup={f} previa naoMostrar={false} onNaoMostrar={() => undefined} onFechar={() => undefined} />
              </div>
            </div>
          </aside>
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-popup" disabled={salvando || !pode} className={botaoPrimario}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar popup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorPopup;
