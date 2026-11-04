import React, { useEffect, useState } from "react";
import { Crown, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LinhaOpcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { FormUsuario, TIPOS, UserData, hojeISO } from "./types";

interface UsuarioDialogProps {
  aberto: boolean;
  /** null = novo usuário */
  usuario: UserData | null;
  onFechar: () => void;
  onCriar: (f: FormUsuario) => Promise<boolean>;
  onSalvar: (id: string, f: FormUsuario) => Promise<boolean>;
}

const VAZIO: FormUsuario = {
  nome: "",
  email: "",
  senha: "",
  tipo: "aluno",
  status: "ativo",
  assinante: false,
  inicioAssinatura: "",
  terminoAssinatura: "",
};

const somarMeses = (iso: string, meses: number) => {
  const [a, m, d] = iso.split("-").map(Number);
  const dt = new Date(a, m - 1 + meses, d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const UsuarioDialog: React.FC<UsuarioDialogProps> = ({ aberto, usuario, onFechar, onCriar, onSalvar }) => {
  const [f, setF] = useState<FormUsuario>(VAZIO);
  const [verSenha, setVerSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const novo = !usuario;

  useEffect(() => {
    if (!aberto) return;
    setVerSenha(false);
    setF(
      usuario
        ? {
            nome: usuario.nome,
            email: usuario.email,
            senha: "",
            tipo: usuario.tipo,
            status: usuario.status,
            assinante: usuario.assinante,
            inicioAssinatura: usuario.inicioAssinatura,
            terminoAssinatura: usuario.terminoAssinatura,
          }
        : VAZIO
    );
  }, [aberto, usuario]);

  const mudar = <K extends keyof FormUsuario>(k: K, v: FormUsuario[K]) => setF((x) => ({ ...x, [k]: v }));

  const erroDatas = f.assinante && f.inicioAssinatura && f.terminoAssinatura && f.terminoAssinatura < f.inicioAssinatura;
  const emailValido = /^\S+@\S+\.\S+$/.test(f.email.trim());
  const podeSalvar = !!f.nome.trim() && !erroDatas && (!novo || (emailValido && f.senha.length >= 6));

  const periodo = (meses: number) => {
    const inicio = f.inicioAssinatura || hojeISO();
    setF((x) => ({ ...x, assinante: true, inicioAssinatura: inicio, terminoAssinatura: somarMeses(inicio, meses) }));
  };

  const enviar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);
    const ok = novo ? await onCriar(f) : await onSalvar(usuario!.id, f);
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{novo ? "Novo usuário" : "Editar usuário"}</DialogTitle>
          <DialogDescription>
            {novo ? "A conta é criada já confirmada. Passe o e-mail e a senha para a pessoa entrar." : usuario?.email}
          </DialogDescription>
        </DialogHeader>

        <form
          id="form-usuario"
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="usr-nome">Nome *</Label>
              <Input id="usr-nome" value={f.nome} onChange={(e) => mudar("nome", e.target.value)} autoComplete="off" />
            </div>
            {novo ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="usr-email">E-mail *</Label>
                  <Input id="usr-email" type="email" value={f.email} onChange={(e) => mudar("email", e.target.value)} autoComplete="off" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="usr-senha">Senha inicial *</Label>
                  <div className="relative">
                    <Input
                      id="usr-senha"
                      type={verSenha ? "text" : "password"}
                      value={f.senha}
                      onChange={(e) => mudar("senha", e.target.value)}
                      autoComplete="new-password"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                      aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}
                    >
                      {verSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className={cn("text-[11px]", f.senha && f.senha.length < 6 ? "text-red-600" : "text-slate-400")}>Mínimo de 6 caracteres.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">O e-mail de acesso não pode ser alterado por aqui.</p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-slate-800">Função</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIPOS.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                    f.tipo === t.id ? "border-[#5f2ebe] bg-[#5f2ebe]/5" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="usr-tipo"
                    checked={f.tipo === t.id}
                    onChange={() => mudar("tipo", t.id)}
                    className="mt-0.5 h-4 w-4 accent-[#5f2ebe]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{t.label}</span>
                    <span className="block text-[11px] leading-snug text-slate-500">{t.descricao}</span>
                  </span>
                </label>
              ))}
            </div>
            {!novo && usuario?.tipo !== "administrador" && f.tipo === "administrador" && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">Essa pessoa vai ter acesso total ao painel.</p>
            )}
          </fieldset>

          <div className="space-y-3 rounded-lg border border-slate-200 px-3 py-3">
            <LinhaOpcao titulo="Conta ativa" descricao="Desative para marcar a conta como inativa sem apagar os dados." htmlFor="usr-status">
              <Switch id="usr-status" checked={f.status === "ativo"} onCheckedChange={(v) => mudar("status", v ? "ativo" : "inativo")} />
            </LinhaOpcao>
            <div className="border-t border-slate-100" />
            <LinhaOpcao
              titulo={
                <span className="inline-flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Assinante premium
                </span>
              }
              descricao="Libera o conteúdo premium durante o período abaixo."
              htmlFor="usr-premium"
            >
              <Switch id="usr-premium" checked={f.assinante} onCheckedChange={(v) => mudar("assinante", v)} />
            </LinhaOpcao>
            {f.assinante && (
              <div className="space-y-2 pt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="usr-inicio" className="text-xs">
                      Início
                    </Label>
                    <Input id="usr-inicio" type="date" value={f.inicioAssinatura} onChange={(e) => mudar("inicioAssinatura", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="usr-fim" className="text-xs">
                      Término
                    </Label>
                    <Input id="usr-fim" type="date" value={f.terminoAssinatura} onChange={(e) => mudar("terminoAssinatura", e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span>Período rápido:</span>
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => periodo(m)}
                      className="rounded-full border border-slate-200 px-2 py-0.5 font-medium text-slate-600 hover:border-[#5f2ebe] hover:text-[#5f2ebe]"
                    >
                      {m === 12 ? "1 ano" : m === 1 ? "1 mês" : `${m} meses`}
                    </button>
                  ))}
                </div>
                {erroDatas && <p className="text-xs text-red-600">O término precisa ser depois do início.</p>}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-usuario" disabled={salvando || !podeSalvar} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : novo ? "Criar usuário" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioDialog;
