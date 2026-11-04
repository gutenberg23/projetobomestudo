import { useEffect, useMemo, useState } from "react";
import { Copy, Crown, Edit, History, Plus, Power, StickyNote, Trash2, ShieldCheck, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  CartoesResumo,
  Etiqueta,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  TomEtiqueta,
  botaoPrimario,
  copiarTexto,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useUsuarios } from "@/components/admin/users/useUsuarios";
import UsuarioDialog from "@/components/admin/users/UsuarioDialog";
import FichaUsuarioDialog, { AbaFicha } from "@/components/admin/users/FichaUsuarioDialog";
import { AvatarUsuario } from "@/components/admin/users/AvatarUsuario";
import { TIPOS, UserData, UserType, dataBR, rotuloTipo, situacaoPremium, tempoRelativo } from "@/components/admin/users/types";

type Aba = "todos" | "premium" | "equipe" | "inativos";
type Ordem = "recentes" | "acesso" | "nome";
const POR_PAGINA = 25;
const EQUIPE: UserType[] = ["administrador", "assistente", "professor", "jornalista"];

const TOM_TIPO: Record<UserType, TomEtiqueta> = {
  administrador: "roxo",
  assistente: "ciano",
  professor: "azul",
  jornalista: "ambar",
  aluno: "cinza",
};

const passa = (u: UserData, aba: Aba) =>
  aba === "todos" ||
  (aba === "premium" && situacaoPremium(u) === "ativo") ||
  (aba === "equipe" && EQUIPE.includes(u.tipo)) ||
  (aba === "inativos" && u.status === "inativo");

const Usuarios = () => {
  const { user } = useAuth();
  const { usuarios, carregando, alterarStatus, salvar, criar, excluir } = useUsuarios();

  const [aba, setAba] = useState<Aba>("todos");
  const [tipo, setTipo] = useState<"todos" | UserType>("todos");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const [form, setForm] = useState<{ aberto: boolean; usuario: UserData | null }>({ aberto: false, usuario: null });
  const [ficha, setFicha] = useState<{ usuario: UserData | null; aba: AbaFicha }>({ usuario: null, aba: "notas" });
  const [excluindo, setExcluindo] = useState<UserData | null>(null);
  const [desativando, setDesativando] = useState<UserData | null>(null);

  useEffect(() => setPagina(1), [aba, tipo, busca, ordem]);

  const resumo = useMemo(() => {
    const limite = Date.now() - 30 * 86400000;
    return {
      total: usuarios.length,
      novos: usuarios.filter((u) => u.criadoEm && new Date(u.criadoEm).getTime() >= limite).length,
      ativos30: usuarios.filter((u) => u.ultimoLogin && new Date(u.ultimoLogin).getTime() >= limite).length,
      premium: usuarios.filter((u) => situacaoPremium(u) === "ativo").length,
      vencidos: usuarios.filter((u) => situacaoPremium(u) === "vencido").length,
      equipe: usuarios.filter((u) => EQUIPE.includes(u.tipo)).length,
    };
  }, [usuarios]);

  // Filtros que não são a aba (as contagens das abas respeitam busca e tipo)
  const base = useMemo(() => {
    const t = normalizar(busca.trim());
    return usuarios.filter((u) => (tipo === "todos" || u.tipo === tipo) && (!t || normalizar(`${u.nome} ${u.email}`).includes(t)));
  }, [usuarios, busca, tipo]);

  const filtrados = useMemo(() => {
    const l = base.filter((u) => passa(u, aba));
    const tempo = (s: string) => (s ? new Date(s).getTime() || 0 : 0);
    if (ordem === "nome") l.sort((a, b) => normalizar(a.nome || a.email).localeCompare(normalizar(b.nome || b.email)));
    else if (ordem === "acesso") l.sort((a, b) => tempo(b.ultimoLogin) - tempo(a.ultimoLogin));
    else l.sort((a, b) => tempo(b.criadoEm) - tempo(a.criadoEm));
    return l;
  }, [base, aba, ordem]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const filtroAtivo = !!busca || tipo !== "todos" || aba !== "todos";

  const copiarEmail = async (u: UserData) => {
    if (await copiarTexto(u.email)) toast.success("E-mail copiado");
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Usuários"
        descricao="Contas do site: alunos, professores e equipe. Ajuste a função, o premium e veja a atividade de cada pessoa."
        acoes={
          <Button onClick={() => setForm({ aberto: true, usuario: null })} className={botaoPrimario}>
            <Plus className="mr-1.5 h-4 w-4" />
            Novo usuário
          </Button>
        }
      />

      <CartoesResumo
        carregando={carregando}
        itens={[
          { rotulo: "Usuários", valor: resumo.total.toLocaleString("pt-BR"), icone: Users, detalhe: `+${resumo.novos.toLocaleString("pt-BR")} nos últimos 30 dias` },
          { rotulo: "Entraram em 30 dias", valor: resumo.ativos30.toLocaleString("pt-BR"), icone: UserCheck, tom: "verde" },
          {
            rotulo: "Premium ativos",
            valor: resumo.premium.toLocaleString("pt-BR"),
            icone: Crown,
            tom: "ambar",
            detalhe: resumo.vencidos ? `${resumo.vencidos} com assinatura vencida` : undefined,
          },
          { rotulo: "Equipe", valor: resumo.equipe.toLocaleString("pt-BR"), icone: ShieldCheck, tom: "rosa", detalhe: "todos menos alunos" },
        ]}
      />

      <PainelListagem
        empilhada
        barra={
          <>
            <FiltrosBarra>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)} className={selectClasse} aria-label="Função">
                <option value="todos">Todas as funções</option>
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={selectClasse} aria-label="Ordenar">
                <option value="recentes">Cadastro mais recente</option>
                <option value="acesso">Último acesso</option>
                <option value="nome">Nome (A–Z)</option>
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail" rotulo="Buscar usuários" />
            </FiltrosBarra>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: base.length },
                { id: "premium", label: "Premium", n: base.filter((u) => passa(u, "premium")).length },
                { id: "equipe", label: "Equipe", n: base.filter((u) => passa(u, "equipe")).length },
                { id: "inativos", label: "Inativos", n: base.filter((u) => passa(u, "inativos")).length },
              ]}
              ativa={aba}
              onChange={setAba}
            />
          </>
        }
        rodape={
          !carregando && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPagina} singular="usuário" plural="usuários" />
          )
        }
      >
        {carregando ? (
          <ListaEsqueleto redondo />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={Users}
            titulo={filtroAtivo ? "Nenhum usuário encontrado" : "Nenhum usuário ainda"}
            texto={filtroAtivo ? "Tente outra busca, função ou aba." : "As contas aparecem aqui quando as pessoas se cadastrarem."}
            acao={
              filtroAtivo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setTipo("todos");
                    setAba("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((u) => {
              const premium = situacaoPremium(u);
              const souEu = u.id === user?.id;
              return (
                <li key={u.id} className={cn("flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#faf8ff] sm:gap-4 sm:px-4", u.status === "inativo" && "bg-slate-50/60")}>
                  <AvatarUsuario usuario={u} className={cn(u.status === "inativo" && "opacity-50 grayscale")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button
                        type="button"
                        onClick={() => setForm({ aberto: true, usuario: u })}
                        className={cn(
                          "truncate text-left text-sm font-semibold text-slate-900 hover:text-[#5f2ebe]",
                          u.status === "inativo" && "text-slate-500"
                        )}
                      >
                        {u.nome || <span className="italic text-slate-400">Sem nome</span>}
                      </button>
                      {souEu && <span className="text-[11px] text-slate-400">(você)</span>}
                      {u.tipo !== "aluno" && <Etiqueta tom={TOM_TIPO[u.tipo]}>{rotuloTipo(u.tipo)}</Etiqueta>}
                      {premium !== "nao" && (
                        <Etiqueta
                          tom={premium === "ativo" ? "ambar" : "cinza"}
                          title={u.terminoAssinatura ? `Término em ${dataBR(u.terminoAssinatura)}` : "Sem data de término"}
                        >
                          <Crown className="h-3 w-3" />
                          {premium === "ativo" ? "Premium" : "Premium vencido"}
                        </Etiqueta>
                      )}
                      {u.status === "inativo" && <Etiqueta tom="vermelho">Inativo</Etiqueta>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{u.email}</p>
                  </div>

                  <div className="hidden w-28 shrink-0 text-xs md:block">
                    <p className="text-slate-400">Cadastro</p>
                    <p className="tabular-nums text-slate-700">{dataBR(u.criadoEm) || "—"}</p>
                  </div>
                  <div className="hidden w-28 shrink-0 text-xs sm:block" title={u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString("pt-BR") : undefined}>
                    <p className="text-slate-400">Último acesso</p>
                    <p className={cn("whitespace-nowrap", u.ultimoLogin ? "text-slate-700" : "text-slate-400")}>{tempoRelativo(u.ultimoLogin) || "nunca"}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setForm({ aberto: true, usuario: u })} className="hidden text-slate-600 lg:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => setForm({ aberto: true, usuario: u }) },
                        { label: "Notas da equipe", icone: StickyNote, onClick: () => setFicha({ usuario: u, aba: "notas" }) },
                        { label: "Atividade", icone: History, onClick: () => setFicha({ usuario: u, aba: "atividade" }) },
                        { label: "Copiar e-mail", icone: Copy, onClick: () => copiarEmail(u) },
                        {
                          label: u.status === "ativo" ? "Desativar conta" : "Reativar conta",
                          icone: Power,
                          onClick: () => (u.status === "ativo" ? setDesativando(u) : alterarStatus(u, "ativo")),
                          separadorAntes: true,
                          oculto: souEu,
                        },
                        { label: "Excluir conta", icone: Trash2, onClick: () => setExcluindo(u), perigo: true, oculto: souEu },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <UsuarioDialog
        aberto={form.aberto}
        usuario={form.usuario}
        onFechar={() => setForm({ aberto: false, usuario: null })}
        onCriar={criar}
        onSalvar={salvar}
      />

      <FichaUsuarioDialog
        usuario={ficha.usuario}
        aba={ficha.aba}
        onAba={(a) => setFicha((f) => ({ ...f, aba: a }))}
        onFechar={() => setFicha((f) => ({ ...f, usuario: null }))}
      />

      <ConfirmarAcao
        aberto={!!desativando}
        onFechar={() => setDesativando(null)}
        titulo={`Desativar a conta de ${desativando?.nome || desativando?.email || ""}?`}
        descricao="A conta fica marcada como inativa e os dados são mantidos. Você pode reativar quando quiser."
        textoConfirmar="Desativar"
        onConfirmar={async () => {
          if (desativando) await alterarStatus(desativando, "inativo");
        }}
      />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir a conta de ${excluindo?.nome || excluindo?.email || ""}?`}
        descricao="A conta é apagada de vez e a pessoa não consegue mais entrar. Para manter os dados, use Desativar."
        textoConfirmar="Excluir conta"
        perigo
        onConfirmar={async () => {
          if (excluindo) await excluir(excluindo);
        }}
      />
    </div>
  );
};

export default Usuarios;
