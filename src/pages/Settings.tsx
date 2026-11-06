import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import InputMask from "react-input-mask";
import { Camera, Eye, EyeOff, KeyRound, Loader2, LogIn, MapPin, Phone, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Carregando, EstadoVazio, Painel } from "@/components/course/ui";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface FormData {
  nome: string;
  sobrenome: string;
  nome_social: string;
  email: string;
  nascimento: string;
  sexo: string;
  escolaridade: string;
  estado_civil: string;
  celular: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  estado: string;
  cidade: string;
  foto_perfil: string;
}

const VAZIO: FormData = {
  nome: "",
  sobrenome: "",
  nome_social: "",
  email: "",
  nascimento: "",
  sexo: "",
  escolaridade: "",
  estado_civil: "",
  celular: "",
  telefone: "",
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  complemento: "",
  estado: "",
  cidade: "",
  foto_perfil: "",
};

const ESTADOS: Array<[string, string]> = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

const SECOES = [
  { id: "perfil", rotulo: "Sobre você", icone: UserIcon },
  { id: "contato", rotulo: "Contato", icone: Phone },
  { id: "endereco", rotulo: "Endereço", icone: MapPin },
  { id: "seguranca", rotulo: "Senha", icone: KeyRound },
];

const campoClasse =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

/** Converte o que vem do banco (data ou data/hora) para AAAA-MM-DD. */
const paraData = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : "");

const Campo: React.FC<{ rotulo: string; htmlFor: string; dica?: React.ReactNode; className?: string; children: React.ReactNode }> = ({
  rotulo,
  htmlFor,
  dica,
  className,
  children,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">
      {rotulo}
    </label>
    {children}
    {dica && <p className="text-[11px] text-slate-400">{dica}</p>}
  </div>
);

const ComMascara: React.FC<{
  id: string;
  mask: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}> = ({ id, mask, value, placeholder, onChange, onBlur }) => (
  <InputMask mask={mask} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {(p: any) => <input {...p} id={id} inputMode="numeric" placeholder={placeholder} className={campoClasse} />}
  </InputMask>
);

const Secao: React.FC<{ id: string; titulo: string; descricao: string; icone: React.ElementType; children: React.ReactNode }> = ({
  id,
  titulo,
  descricao,
  icone: Icone,
  children,
}) => (
  <Painel id={id} className="scroll-mt-6">
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
        <Icone className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
        <p className="text-xs text-slate-500">{descricao}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{children}</div>
  </Painel>
);

/** Troca de senha (Supabase Auth). */
const TrocarSenha: React.FC = () => {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [ver, setVer] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const curta = senha.length > 0 && senha.length < 6;
  const diferente = confirmacao.length > 0 && senha !== confirmacao;
  const pode = senha.length >= 6 && senha === confirmacao && !salvando;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pode) return;
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      toast.error(error.message.includes("different") ? "A nova senha precisa ser diferente da atual." : "Não foi possível trocar a senha.");
      return;
    }
    setSenha("");
    setConfirmacao("");
    toast.success("Senha alterada");
  };

  return (
    <Painel id="seguranca" className="scroll-mt-6">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">Senha</h2>
          <p className="text-xs text-slate-500">Se você entra com o Google, pode criar uma senha para entrar também com e-mail.</p>
        </div>
      </div>
      <form onSubmit={salvar} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <Campo rotulo="Nova senha" htmlFor="nova-senha" dica={curta ? <span className="text-red-500">Use pelo menos 6 caracteres.</span> : "Mínimo de 6 caracteres."}>
          <div className="relative">
            <input
              id="nova-senha"
              type={ver ? "text" : "password"}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={cn(campoClasse, "pr-10")}
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              aria-label={ver ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
            >
              {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Campo>
        <Campo rotulo="Repita a nova senha" htmlFor="confirmar-senha" dica={diferente ? <span className="text-red-500">As senhas não são iguais.</span> : undefined}>
          <input
            id="confirmar-senha"
            type={ver ? "text" : "password"}
            autoComplete="new-password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className={campoClasse}
          />
        </Campo>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!pode}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            Trocar senha
          </button>
        </div>
      </form>
    </Painel>
  );
};

const Settings = () => {
  const { user, loading: carregandoAuth, updateProfile } = useAuth();
  const [form, setForm] = useState<FormData>(VAZIO);
  const [original, setOriginal] = useState<FormData>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("perfil");
  const ultimoCep = useRef("");

  useEffect(() => {
    if (!user?.id) return;
    setCarregando(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Erro ao carregar perfil:", error);
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = data as any;
          const lido: FormData = { ...VAZIO };
          (Object.keys(VAZIO) as Array<keyof FormData>).forEach((k) => (lido[k] = p[k] ? String(p[k]) : ""));
          lido.nascimento = paraData(p.nascimento);
          lido.email = p.email || user.email || "";
          setForm(lido);
          setOriginal(lido);
          ultimoCep.current = lido.cep.replace(/\D/g, "");
        }
        setCarregando(false);
      });
  }, [user?.id, user?.email]);

  // Destaca no menu a seção que está na tela
  useEffect(() => {
    if (carregando) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setSecaoAtiva(visivel.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    SECOES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [carregando]);

  const mudou = useMemo(
    () => (Object.keys(VAZIO) as Array<keyof FormData>).some((k) => k !== "foto_perfil" && k !== "email" && form[k] !== original[k]),
    [form, original]
  );

  const definir = (campo: keyof FormData, valor: string) => {
    if (campo === "celular" || campo === "telefone" || campo === "cep") valor = valor.replace(/\D/g, "");
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  /** Preenche o endereço pelo CEP (ViaCEP). */
  const buscarCep = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8 || cep === ultimoCep.current) return;
    ultimoCep.current = cep;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await r.json();
      if (j.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setForm((f) => ({
        ...f,
        endereco: j.logradouro || f.endereco,
        bairro: j.bairro || f.bairro,
        cidade: j.localidade || f.cidade,
        estado: j.uf || f.estado,
      }));
    } catch {
      /* sem internet ou serviço fora: o aluno preenche à mão */
    } finally {
      setBuscandoCep(false);
    }
  };

  const enviarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !user) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    if (arquivo.size > 2 * 1024 * 1024) {
      toast.error("A foto pode ter no máximo 2 MB.");
      return;
    }
    setEnviandoFoto(true);
    try {
      const ext = arquivo.name.split(".").pop() || "jpg";
      const caminho = `${user.id}/${Date.now()}.${ext}`;
      const { error: erroEnvio } = await supabase.storage.from("profile-photos").upload(caminho, arquivo);
      if (erroEnvio) throw erroEnvio;
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(caminho);
      const { error } = await updateProfile({ foto_perfil: publicUrl });
      if (error) throw error;
      setForm((f) => ({ ...f, foto_perfil: publicUrl }));
      setOriginal((f) => ({ ...f, foto_perfil: publicUrl }));
    } catch (erro) {
      console.error("Erro ao enviar foto:", erro);
      toast.error("Não foi possível enviar a foto. Tente outra imagem.");
    } finally {
      setEnviandoFoto(false);
    }
  };

  const salvar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe seu nome.");
      document.getElementById("nome")?.focus();
      return;
    }
    setSalvando(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email: _email, foto_perfil: _foto, ...dados } = form;
    const { error } = await updateProfile({
      ...dados,
      nome: dados.nome.trim(),
      sobrenome: dados.sobrenome.trim(),
      nascimento: dados.nascimento || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    setSalvando(false);
    if (!error) setOriginal(form);
  };

  if (!carregandoAuth && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-16">
          <EstadoVazio
            icone={LogIn}
            titulo="Entre para ver sua conta"
            texto="Faça login para editar seus dados, sua foto e sua senha."
            className="mx-auto max-w-xl"
            acao={
              <Link to="/login" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                Entrar
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const nomeExibido = [form.nome_social || form.nome, form.nome_social ? "" : form.sobrenome].filter(Boolean).join(" ") || "Sua conta";
  const preenchidos = (["nome", "sobrenome", "nascimento", "escolaridade", "celular", "cep", "cidade", "estado", "foto_perfil"] as const).filter(
    (k) => !!original[k]
  ).length;
  const completo = Math.round((preenchidos / 9) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1 pb-24">
        {/* Topo */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
          <div className="container relative mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center md:py-10">
            <div className="relative shrink-0 self-start">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-md md:h-24 md:w-24">
                <AvatarImage src={form.foto_perfil || user?.foto_perfil || undefined} className="object-cover" />
                <AvatarFallback className="bg-[#5f2ebe]/10 text-2xl font-semibold text-[#5f2ebe]">
                  {(form.nome || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="foto-perfil"
                title="Trocar foto"
                className={cn(
                  "absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#5f2ebe] text-white shadow ring-2 ring-white hover:bg-[#4f25a0]",
                  enviandoFoto && "pointer-events-none opacity-70"
                )}
              >
                {enviandoFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <span className="sr-only">Trocar foto</span>
                <input id="foto-perfil" type="file" accept="image/*" onChange={enviarFoto} className="hidden" />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Minha conta</p>
              {carregando ? (
                <Skeleton className="mt-2 h-8 w-56" />
              ) : (
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{nomeExibido}</h1>
              )}
              <p className="mt-0.5 truncate text-sm text-slate-500">{form.email || user?.email}</p>
            </div>
            {!carregando && (
              <div className="w-full rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur sm:w-60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Perfil completo</span>
                  <span className="font-bold tabular-nums text-[#5f2ebe]">{completo}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2] transition-all" style={{ width: `${completo}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Dados completos ajudam a mostrar estatísticas de aprovação mais precisas.</p>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[200px_minmax(0,1fr)]">
          {/* Menu de seções */}
          <nav aria-label="Seções" className="lg:sticky lg:top-4 lg:self-start">
            <ul className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1 lg:flex-col lg:bg-transparent lg:p-0">
              {SECOES.map((s) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      setSecaoAtiva(s.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors lg:py-2",
                      secaoAtiva === s.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 lg:hover:bg-white/60"
                    )}
                  >
                    <s.icone className={cn("h-4 w-4", secaoAtiva === s.id && "text-[#5f2ebe]")} />
                    {s.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {carregando ? (
            <Painel>
              <Carregando texto="Carregando seus dados..." />
            </Painel>
          ) : (
            <div className="min-w-0 space-y-5">
              <form id="form-conta" onSubmit={salvar} className="space-y-5">
                <Secao id="perfil" titulo="Sobre você" descricao="Como você aparece no site e nos rankings." icone={UserIcon}>
                  <Campo rotulo="Nome *" htmlFor="nome">
                    <input id="nome" value={form.nome} onChange={(e) => definir("nome", e.target.value)} placeholder="Seu nome" autoComplete="given-name" className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Sobrenome" htmlFor="sobrenome">
                    <input
                      id="sobrenome"
                      value={form.sobrenome}
                      onChange={(e) => definir("sobrenome", e.target.value)}
                      placeholder="Seu sobrenome"
                      autoComplete="family-name"
                      className={campoClasse}
                    />
                  </Campo>
                  <Campo rotulo="Nome social" htmlFor="nome_social" dica="Se preencher, é este nome que aparece para você.">
                    <input id="nome_social" value={form.nome_social} onChange={(e) => definir("nome_social", e.target.value)} placeholder="Opcional" className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Data de nascimento" htmlFor="nascimento">
                    <input
                      id="nascimento"
                      type="date"
                      value={form.nascimento}
                      onChange={(e) => definir("nascimento", e.target.value)}
                      min="1900-01-01"
                      max={new Date().toISOString().slice(0, 10)}
                      className={campoClasse}
                    />
                  </Campo>
                  <Campo rotulo="Sexo" htmlFor="sexo">
                    <select id="sexo" value={form.sexo} onChange={(e) => definir("sexo", e.target.value)} className={campoClasse}>
                      <option value="">Prefiro não informar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </Campo>
                  <Campo rotulo="Escolaridade" htmlFor="escolaridade">
                    <select id="escolaridade" value={form.escolaridade} onChange={(e) => definir("escolaridade", e.target.value)} className={campoClasse}>
                      <option value="">Selecione</option>
                      <option value="fundamental">Ensino Fundamental</option>
                      <option value="medio">Ensino Médio</option>
                      <option value="superior">Ensino Superior</option>
                      <option value="pos">Pós-graduação</option>
                    </select>
                  </Campo>
                  <Campo rotulo="Estado civil" htmlFor="estado_civil">
                    <select id="estado_civil" value={form.estado_civil} onChange={(e) => definir("estado_civil", e.target.value)} className={campoClasse}>
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                    </select>
                  </Campo>
                </Secao>

                <Secao id="contato" titulo="Contato" descricao="Usamos só para avisos da sua conta." icone={Phone}>
                  <Campo rotulo="E-mail" htmlFor="email" dica="O e-mail de acesso não pode ser trocado por aqui.">
                    <input id="email" type="email" value={form.email} disabled className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Celular" htmlFor="celular">
                    <ComMascara id="celular" mask="(99) 99999-9999" value={form.celular} onChange={(v) => definir("celular", v)} placeholder="(00) 00000-0000" />
                  </Campo>
                  <Campo rotulo="Telefone fixo" htmlFor="telefone">
                    <ComMascara id="telefone" mask="(99) 9999-9999" value={form.telefone} onChange={(v) => definir("telefone", v)} placeholder="(00) 0000-0000" />
                  </Campo>
                </Secao>

                <Secao id="endereco" titulo="Endereço" descricao="Digite o CEP e preenchemos o resto para você." icone={MapPin}>
                  <Campo rotulo="CEP" htmlFor="cep" dica={buscandoCep ? "Buscando endereço..." : undefined}>
                    <div className="relative">
                      <ComMascara id="cep" mask="99999-999" value={form.cep} onChange={(v) => definir("cep", v)} onBlur={buscarCep} placeholder="00000-000" />
                      {buscandoCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#5f2ebe]" />}
                    </div>
                  </Campo>
                  <div className="hidden sm:block" />
                  <Campo rotulo="Endereço" htmlFor="endereco" className="sm:col-span-2">
                    <input
                      id="endereco"
                      value={form.endereco}
                      onChange={(e) => definir("endereco", e.target.value)}
                      placeholder="Rua, avenida..."
                      autoComplete="address-line1"
                      className={campoClasse}
                    />
                  </Campo>
                  <Campo rotulo="Número" htmlFor="numero">
                    <input id="numero" value={form.numero} onChange={(e) => definir("numero", e.target.value)} placeholder="123" className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Complemento" htmlFor="complemento">
                    <input id="complemento" value={form.complemento} onChange={(e) => definir("complemento", e.target.value)} placeholder="Apto, bloco..." className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Bairro" htmlFor="bairro">
                    <input id="bairro" value={form.bairro} onChange={(e) => definir("bairro", e.target.value)} placeholder="Seu bairro" className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Cidade" htmlFor="cidade">
                    <input id="cidade" value={form.cidade} onChange={(e) => definir("cidade", e.target.value)} placeholder="Sua cidade" className={campoClasse} />
                  </Campo>
                  <Campo rotulo="Estado" htmlFor="estado">
                    <select id="estado" value={form.estado} onChange={(e) => definir("estado", e.target.value)} className={campoClasse}>
                      <option value="">Selecione</option>
                      {ESTADOS.map(([uf, nome]) => (
                        <option key={uf} value={uf}>
                          {nome}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </Secao>
              </form>

              <TrocarSenha />
            </div>
          )}
        </div>
      </main>

      {/* Barra de salvar: aparece quando há alteração */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(16,24,40,0.08)] backdrop-blur transition-transform duration-200",
          mudou ? "visible translate-y-0" : "invisible translate-y-full"
        )}
        aria-hidden={!mudou}
      >
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <p className="mr-auto text-sm text-slate-600">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-400" />
            Alterações não salvas
          </p>
          <button
            type="button"
            onClick={() => setForm(original)}
            disabled={salvando}
            tabIndex={mudou ? 0 : -1}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Descartar
          </button>
          <button
            type="submit"
            form="form-conta"
            disabled={salvando}
            tabIndex={mudou ? 0 : -1}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0] disabled:opacity-60"
          >
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
