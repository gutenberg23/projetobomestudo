import React, { useEffect, useState } from "react";
import { Facebook, Globe, Instagram, Star, Twitter, Youtube } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FotoProfessor } from "./FotoProfessor";
import { FormProfessor, Professor } from "./types";

interface ProfessorDialogProps {
  aberto: boolean;
  professor: Professor | null;
  /** Disciplinas já usadas, para sugerir no campo */
  disciplinas: string[];
  onFechar: () => void;
  onSalvar: (f: FormProfessor, id?: string) => Promise<boolean>;
}

const VAZIO: FormProfessor = {
  nome: "",
  email: "",
  disciplina: "",
  youtube: "",
  instagram: "",
  twitter: "",
  facebook: "",
  website: "",
  foto: "",
  rating: 0,
};

const REDES: { campo: keyof FormProfessor; label: string; icone: React.ElementType; placeholder: string }[] = [
  { campo: "youtube", label: "YouTube", icone: Youtube, placeholder: "youtube.com/@canal" },
  { campo: "instagram", label: "Instagram", icone: Instagram, placeholder: "@perfil" },
  { campo: "twitter", label: "X / Twitter", icone: Twitter, placeholder: "@perfil" },
  { campo: "facebook", label: "Facebook", icone: Facebook, placeholder: "facebook.com/pagina" },
  { campo: "website", label: "Site", icone: Globe, placeholder: "site.com.br" },
];

const ProfessorDialog: React.FC<ProfessorDialogProps> = ({ aberto, professor, disciplinas, onFechar, onSalvar }) => {
  const [f, setF] = useState<FormProfessor>(VAZIO);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (professor) {
      const { id, criadoEm, ...resto } = professor;
      setF(resto);
    } else setF(VAZIO);
  }, [aberto, professor]);

  const mudar = <K extends keyof FormProfessor>(k: K, v: FormProfessor[K]) => setF((x) => ({ ...x, [k]: v }));
  const emailOk = !f.email.trim() || /^\S+@\S+\.\S+$/.test(f.email.trim());
  const pode = !!f.nome.trim() && !!f.disciplina.trim() && !!f.email.trim() && emailOk;

  const enviar = async () => {
    if (!pode) return;
    setSalvando(true);
    const ok = await onSalvar(f, professor?.id);
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{professor ? "Editar professor" : "Novo professor"}</DialogTitle>
          <DialogDescription>O professor pode ser escolhido nos tópicos e nas teorias.</DialogDescription>
        </DialogHeader>

        <form
          id="form-professor"
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <FotoProfessor url={f.foto} onChange={(u) => mudar("foto", u)} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prof-nome">Nome completo *</Label>
              <Input id="prof-nome" value={f.nome} onChange={(e) => mudar("nome", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-email">E-mail *</Label>
              <Input id="prof-email" type="email" value={f.email} onChange={(e) => mudar("email", e.target.value)} />
              {!emailOk && <p className="text-[11px] text-red-600">E-mail inválido.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-disc">Disciplina *</Label>
              <Input id="prof-disc" list="prof-disciplinas" value={f.disciplina} onChange={(e) => mudar("disciplina", e.target.value)} placeholder="Ex.: Direito Administrativo" />
              <datalist id="prof-disciplinas">
                {disciplinas.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-slate-800">Redes e canal</legend>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {REDES.map((r) => (
                <label key={r.campo} className="flex items-center gap-3 px-3 py-1.5">
                  <r.icone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-600">{r.label}</span>
                  <input
                    value={String(f[r.campo] || "")}
                    onChange={(e) => mudar(r.campo, e.target.value as never)}
                    placeholder={r.placeholder}
                    className="min-w-0 flex-1 bg-transparent py-1.5 text-sm placeholder:text-slate-300 focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label>Avaliação interna</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => mudar("rating", f.rating === n ? 0 : n)}
                  className="rounded p-0.5 hover:bg-amber-50"
                  aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                >
                  <Star className={cn("h-5 w-5", n <= Math.round(f.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                </button>
              ))}
              <span className="ml-2 text-xs text-slate-500">{f.rating ? `${f.rating.toLocaleString("pt-BR")} de 5` : "sem nota"}</span>
            </div>
          </div>
        </form>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-professor" disabled={salvando || !pode} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : professor ? "Salvar alterações" : "Adicionar professor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessorDialog;
