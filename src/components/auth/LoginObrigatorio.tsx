import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Popup "Entre ou crie sua conta" para visitantes sem login.
 *
 * Uso:
 *   const exigirLogin = useExigirLogin();
 *   if (!exigirLogin({ motivo: "responder questões" })) return;
 *
 * Devolve true quando a pessoa já está logada. Caso contrário abre o popup e
 * devolve false. `aoEntrar` roda depois que a pessoa entra pelo popup.
 */

type Aba = "entrar" | "cadastrar";

type Pedido = {
  /** Completa a frase "Entre ou crie sua conta para ..." */
  motivo?: string;
  aba?: Aba;
  aoEntrar?: () => void;
};

type ContextoLogin = {
  exigirLogin: (pedido?: Pedido) => boolean;
  abrirLogin: (pedido?: Pedido) => void;
};

const Contexto = createContext<ContextoLogin | null>(null);

export const useExigirLogin = () => {
  const ctx = useContext(Contexto);
  const { user } = useAuth();
  return useCallback(
    (pedido?: Pedido) => {
      if (user) return true;
      ctx?.abrirLogin(pedido);
      return false;
    },
    [user, ctx]
  );
};

export const useAbrirLogin = () => useContext(Contexto)?.abrirLogin ?? (() => {});

const MOTIVO_PADRAO = "continuar";

export const LoginObrigatorioProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [pedido, setPedido] = useState<Pedido>({});
  const aoEntrarRef = useRef<(() => void) | undefined>();

  const abrirLogin = useCallback((p?: Pedido) => {
    aoEntrarRef.current = p?.aoEntrar;
    setPedido(p || {});
    setAberto(true);
  }, []);

  const exigirLogin = useCallback(
    (p?: Pedido) => {
      if (user) return true;
      abrirLogin(p);
      return false;
    },
    [user, abrirLogin]
  );

  // Entrou (pelo popup ou em outra aba): fecha e continua a ação pedida
  useEffect(() => {
    if (!user || !aberto) return;
    setAberto(false);
    const continuar = aoEntrarRef.current;
    aoEntrarRef.current = undefined;
    if (continuar) setTimeout(continuar, 0);
  }, [user, aberto]);

  return (
    <Contexto.Provider value={{ exigirLogin, abrirLogin }}>
      {children}
      <Dialog
        open={aberto}
        onOpenChange={(v) => {
          setAberto(v);
          if (!v) aoEntrarRef.current = undefined;
        }}
      >
        <DialogContent className="max-h-[92vh] w-[calc(100%-24px)] max-w-[440px] overflow-y-auto rounded-2xl p-0 sm:rounded-2xl">
          {aberto && (
            <FormularioLogin
              motivo={pedido.motivo || MOTIVO_PADRAO}
              abaInicial={pedido.aba || "entrar"}
              aoFechar={() => setAberto(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Contexto.Provider>
  );
};

const IconeGoogle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FormularioLogin = ({ motivo, abaInicial, aoFechar }: { motivo: string; abaInicial: Aba; aoFechar: () => void }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [aba, setAba] = useState<Aba>(abaInicial);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const trocarAba = (nova: Aba) => {
    setAba(nova);
    setErro("");
    setAviso("");
  };

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const { error } = await signIn(email, senha);
      if (error) setErro(error.message.includes("Invalid login credentials") ? "Email ou senha incorretos." : error.message);
    } finally {
      setEnviando(false);
    }
  };

  const cadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não coincidem.");
    setEnviando(true);
    try {
      const { error } = await signUp(email, senha, nome, sobrenome);
      if (error) {
        setErro(error.message.includes("already registered") ? "Este email já tem conta. Entre com ele." : error.message);
      } else {
        setAba("entrar");
        setSenha("");
        setConfirmar("");
        setAviso("Conta criada! Confirme o cadastro pelo link enviado ao seu email e depois entre aqui.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const google = async () => {
    setErro("");
    setEnviando(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="rounded-t-2xl bg-gradient-to-br from-[#5f2ebe] to-[#7c3aed] px-6 pb-5 pt-6 text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Lock className="h-5 w-5" />
        </span>
        <DialogTitle className="mt-3 text-xl font-bold leading-tight">
          {aba === "entrar" ? "Entre para " + motivo : "Crie sua conta grátis"}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-white/80">
          {aba === "entrar"
            ? "Você pode navegar à vontade. Para usar os recursos, entre ou crie sua conta: leva menos de um minuto."
            : `Com a conta você pode ${motivo}, salvar seu progresso e acompanhar sua evolução.`}
        </DialogDescription>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          {(["entrar", "cadastrar"] as Aba[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => trocarAba(a)}
              className={cn(
                "rounded-lg py-2 transition-colors",
                aba === a ? "bg-white text-[#5f2ebe] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {a === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {aviso && <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{aviso}</p>}
        {erro && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 rounded-xl font-semibold"
          onClick={google}
          disabled={enviando}
        >
          <IconeGoogle /> Continuar com Google
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> ou com email <span className="h-px flex-1 bg-slate-200" />
        </div>

        {aba === "entrar" ? (
          <form className="space-y-3" onSubmit={entrar}>
            <div>
              <Label htmlFor="lo-email">Email</Label>
              <Input id="lo-email" type="email" placeholder="seu.email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lo-senha">Senha</Label>
                <Link to="/esqueci-senha" onClick={aoFechar} className="text-xs font-medium text-[#5f2ebe] hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input id="lo-senha" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="h-11 w-full rounded-xl bg-[#5f2ebe] font-semibold hover:bg-[#4f25a0]" disabled={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Ainda não tem conta?{" "}
              <button type="button" onClick={() => trocarAba("cadastrar")} className="font-semibold text-[#5f2ebe] hover:underline">
                Cadastre-se grátis
              </button>
            </p>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={cadastrar}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lo-nome">Nome</Label>
                <Input id="lo-nome" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome" />
              </div>
              <div>
                <Label htmlFor="lo-sobrenome">Sobrenome</Label>
                <Input id="lo-sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} placeholder="Sobrenome" />
              </div>
            </div>
            <div>
              <Label htmlFor="lo-email-c">Email</Label>
              <Input id="lo-email-c" type="email" placeholder="seu.email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lo-senha-c">Senha</Label>
                <Input id="lo-senha-c" type="password" placeholder="mín. 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="lo-confirmar">Confirmar</Label>
                <Input id="lo-confirmar" type="password" placeholder="repita a senha" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required autoComplete="new-password" />
              </div>
            </div>
            <Button type="submit" className="h-11 w-full rounded-xl bg-[#ea2be2] font-semibold hover:bg-[#ea2be2]/90" disabled={enviando}>
              {enviando ? "Criando conta..." : "Criar conta grátis"}
            </Button>
            <p className="text-center text-xs text-slate-500">
              Ao criar uma conta, você concorda com os{" "}
              <Link to="/termos-e-politicas" onClick={aoFechar} className="text-[#5f2ebe] hover:underline">
                Termos e Políticas
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

/**
 * Envolve uma área da página: para visitantes sem login, qualquer clique em
 * botão, link, campo ou aba dentro dela abre o popup em vez de executar a ação.
 * Elementos com data-livre-sem-login continuam funcionando.
 */
const SELETOR_ACAO =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [role="tab"], [role="checkbox"], [role="radio"], [role="switch"], [role="combobox"], [role="option"], [role="menuitem"], [role="link"], [role="slider"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export const AreaComLogin = ({
  children,
  motivo,
  className,
}: {
  children: React.ReactNode;
  motivo?: string;
  className?: string;
}) => {
  const { user, loading } = useAuth();
  const abrirLogin = useAbrirLogin();
  const bloquear = !user && !loading;

  const ehAcao = (alvo: EventTarget | null) => {
    if (!(alvo instanceof Element)) return false;
    const el = alvo.closest(SELETOR_ACAO);
    return Boolean(el && !el.closest("[data-livre-sem-login]"));
  };

  const segurar = (e: React.SyntheticEvent) => {
    if (!bloquear || !ehAcao(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const interceptarClique = (e: React.MouseEvent) => {
    if (!bloquear || !ehAcao(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    abrirLogin({ motivo });
  };

  const interceptarTecla = (e: React.KeyboardEvent) => {
    if (!bloquear || !ehAcao(e.target)) return;
    if (e.key === "Tab" || e.key === "Escape" || e.key.startsWith("Arrow") || e.key === "Shift") return;
    e.preventDefault();
    e.stopPropagation();
    abrirLogin({ motivo });
  };

  return (
    <div
      className={className}
      onPointerDownCapture={segurar}
      onMouseDownCapture={segurar}
      onTouchStartCapture={bloquear ? (e) => ehAcao(e.target) && e.stopPropagation() : undefined}
      onClickCapture={interceptarClique}
      onKeyDownCapture={interceptarTecla}
      onChangeCapture={segurar}
    >
      {children}
    </div>
  );
};
