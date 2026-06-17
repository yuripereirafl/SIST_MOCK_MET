import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { operators, fmtBRL, teams } from "@/lib/mock-data";
import { getProfile, getVendasOntem, type StatusGuia, type EventoHistorico, type ColaboradorProfile } from "@/lib/mock-colaboradores";
import { toast } from "sonner";
import {
  ArrowLeft, UserCheck, Target, Wallet, TrendingUp,
  Clock, Mail, Briefcase, Flame, IdCard, MapPin, FileSignature,
  CalendarDays, Search, FileSpreadsheet, Hash, Plane, AlertTriangle, RotateCcw, Sparkles,
  X, Pencil, Plus, User, PieChart, Percent, Star, ThumbsUp, ThumbsDown, TrendingDown, BarChart2
} from "lucide-react";

export const Route = createFileRoute("/colaborador/$id")({
  head: () => ({ meta: [{ title: "Colaborador — Portal de Metas" }] }),
  loader: ({ params }) => {
    const op = operators.find((o) => o.id === params.id);
    if (!op) throw notFound();
    return { op };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Colaborador não encontrado</h2>
        <Link to="/equipe" className="text-accent text-sm mt-2 inline-block">Voltar para a equipe</Link>
      </div>
    </AppShell>
  ),
  component: ColaboradorPage,
});

function ColaboradorPage() {
  const { op } = Route.useLoaderData();
  const [tab, setTab] = useState<"visao" | "extrato" | "cadastro">("visao");
  const [extratoFilter, setExtratoFilter] = useState<{ status: "Todos" | StatusGuia; q: string; dataInicio: string; dataFim: string; categoria: string }>({ status: "Todos", q: "", dataInicio: "", dataFim: "", categoria: "Todas" });
  const [openEdit, setOpenEdit] = useState(false);
  const [openOcorrencia, setOpenOcorrencia] = useState(false);

  const profile = getProfile(op.id);
  const vendasOntem = getVendasOntem(op.id);

  // Aproximando comissão de hoje a partir do realizado
  const comissaoHoje = Math.round(op.produzidoHoje * 0.05);

  // Projeções Mensais
  const diasUteisTotais = 22;
  const diasUteisPassados = 15;
  const ritmoDiario = op.produzido / diasUteisPassados;
  const projetadoMes = ritmoDiario * diasUteisTotais;
  const previsaoAtingimento = op.metaMensal > 0 ? (projetadoMes / op.metaMensal) * 100 : 0;

  // Comissão Detalhada (Mock)
  const comissaoProducao = op.produzido * 0.025; // 2.5% do produzido
  const comissaoCampanhas = 150;
  const comissaoDrCentral = 85;
  const comissaoTotal = comissaoProducao + comissaoCampanhas + comissaoDrCentral;

  // Vendas por Categoria (Mock baseado no total para exibir no painel individual)
  const vendasCategoria = [
    { cat: "DR. CENTRAL", icon: "🏥", qtd: Math.floor(op.produzido * 0.40 / 100) },
    { cat: "BABYCLICK", icon: "👶", qtd: Math.floor(op.produzido * 0.10 / 150) },
    { cat: "CHECKUP", icon: "❤️", qtd: Math.floor(op.produzido * 0.20 / 200) },
    { cat: "EXAMES (ECG)", icon: "🔬", qtd: Math.floor(op.produzido * 0.15 / 50) },
    { cat: "ODONTO", icon: "🦷", qtd: Math.floor(op.produzido * 0.10 / 250) },
    { cat: "ORÇAMENTOS", icon: "📝", qtd: Math.floor(op.produzido * 0.05 / 500) },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <Link to="/equipe" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar para Gestão de Equipe
        </Link>

        {/* Header card: Simplificado */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-accent to-chart-5 text-accent-foreground grid place-items-center text-xl font-bold shadow-md">
              {op.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{op.name}</h1>
                <StatusBadge status={op.status} />
              </div>
              <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5"><Briefcase className="size-3.5" /> {profile?.cargo ?? op.team}</span>
                <span className="inline-flex items-center gap-1.5"><UserCheck className="size-3.5" /> Líder: {profile?.liderDireto ?? "—"}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> {profile?.email ?? "—"}</span>
                {profile?.statusEmprego === "Afastado" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warning/20 text-warning-foreground border border-warning/30">
                    <Plane className="size-3" /> Afastado
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpenOcorrencia(true)} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary/60 shadow-sm transition-colors inline-flex items-center gap-2">
                <Plus className="size-4" /> Lançar Ocorrência
              </button>
              <button onClick={() => setOpenEdit(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm transition-colors inline-flex items-center gap-2">
                <Pencil className="size-4" /> Editar Colaborador
              </button>
            </div>
          </div>
        </div>

        {/* Tabs nav */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {[
            { id: "visao", label: "Visão Geral Diária", icon: TrendingUp },
            { id: "extrato", label: "Extrato Completo", icon: FileSpreadsheet },
            { id: "cadastro", label: "Cadastro e Dados", icon: IdCard },
          ].map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`inline-flex items-center gap-2 px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "visao" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left Column: Vendas Diárias Expandidas */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Performance D-1</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">Ontem</span>
              </div>

              {/* KPIs D-1 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icon={Target} label="Meta Diária" value={fmtBRL(op.metaDiaria)} tone="primary" />
                <KpiCard icon={Wallet} label="Realizado D-1" value={fmtBRL(op.produzidoHoje)} tone="success" />
                <KpiCard icon={Flame} label="Gap D-1" value={fmtBRL(Math.max(0, op.metaDiaria - op.produzidoHoje))} tone={op.produzidoHoje >= op.metaDiaria ? "success" : "danger"} />
                <KpiCard icon={TrendingUp} label="Comissão D-1" value={fmtBRL(comissaoHoje)} tone="accent" />
              </div>

              {/* Performance Mensal, Projeções e Comissão */}
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-bold">Resumo do Mês</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Projeção */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                      <TrendingUp className="size-4" /> Projeção de Metas
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Previsão de Atingimento</div>
                          <div className="text-2xl font-bold sora">{previsaoAtingimento.toFixed(1)}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Realizado Projetado</div>
                          <div className="text-xl font-semibold sora text-foreground">{fmtBRL(projetadoMes)}</div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${previsaoAtingimento >= 100 ? "bg-success" : previsaoAtingimento >= 80 ? "bg-warning" : "bg-danger"}`} style={{ width: `${Math.min(previsaoAtingimento, 100)}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        Meta: <span className="font-medium text-foreground">{fmtBRL(op.metaMensal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comissão Detalhada */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-accent font-semibold">
                        <Wallet className="size-4" /> Comissão Total
                      </div>
                      <div className="text-xl font-bold sora text-accent">{fmtBRL(comissaoTotal)}</div>
                    </div>
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Produção (Realizado)</span>
                        <span className="font-medium">{fmtBRL(comissaoProducao)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Campanhas / Bônus</span>
                        <span className="font-medium">{fmtBRL(comissaoCampanhas)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">DR Central</span>
                        <span className="font-medium text-success">+{fmtBRL(comissaoDrCentral)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mix de Vendas / Categoria */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <PieChart className="size-4 text-primary" />
                    <h3 className="font-semibold text-lg">Vendas por Categoria</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {vendasCategoria.map(c => (
                      <button
                        key={c.cat}
                        onClick={() => { setExtratoFilter({ ...extratoFilter, categoria: c.cat }); setTab("extrato"); }}
                        className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-center justify-center text-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-secondary/60 transition-all group"
                      >
                        <span className="text-xl mb-1 opacity-80 group-hover:opacity-100 transition-opacity">{c.icon}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate w-full">{c.cat}</span>
                        <span className="text-2xl font-bold sora text-foreground mt-1 text-primary">{c.qtd}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nota do Colaborador */}
                <NotaColaboradorCard seed={op.id} />

                {/* Produção por Dia */}
                <ProducaoPorDia vendas={vendasOntem} metaDiaria={op.metaDiaria} />
              </div>

              {/* Resumo de Vendas */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Últimas Vendas D-1</h3>
                  <button onClick={() => setTab("extrato")} className="text-sm text-accent hover:underline font-medium">Ver todas</button>
                </div>
                <div className="space-y-3">
                  {vendasOntem.slice(0, 6).map((v, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-colors gap-4">
                      <div className="flex flex-col min-w-[200px]">
                        <span className="font-medium text-sm md:text-base">{v.paciente}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{v.categoria} · {v.horario} · {v.unidade}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold tabular-nums text-sm md:text-base">{fmtBRL(v.valor)}</span>
                        <div className="w-24 text-right"><GuiaStatusPill status={v.status} /></div>
                      </div>
                    </div>
                  ))}
                  {vendasOntem.length === 0 && (
                    <p className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-xl">Nenhuma venda registrada ainda hoje.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Quadro de Ocorrências */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <CalendarDays className="size-5 text-accent" /> Quadro de Ocorrências
                </h3>

                <div className="flex-1 space-y-6">
                  {/* Resumo Mensal */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Progresso do Mês</div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Meta Acumulada</span>
                      <span className="text-sm font-bold text-primary">{((op.produzido / op.metaMensal) * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={(op.produzido / op.metaMensal) * 100} status="green" className="h-2" />
                  </div>

                  {/* Faltas e Atestados */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Atestados e Afastamentos</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{profile?.afastamentos.length || 0}</span>
                    </div>

                    {profile?.afastamentos.length === 0 ? (
                      <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-xl text-center border border-dashed border-border">
                        Nenhum registro ativo.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile?.afastamentos.map(a => (
                          <div key={a.id} className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 shadow-sm">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-semibold text-sm text-foreground">{a.motivo}</span>
                              {a.fim === null && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning text-warning-foreground uppercase tracking-wide">Ativo</span>}
                            </div>
                            {a.observacao && <p className="text-xs text-muted-foreground mb-2">{a.observacao}</p>}
                            <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                              <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> Início: {a.inicio}</span>
                              {a.fim && <span className="inline-flex items-center gap-1"><RotateCcw className="size-3" /> Fim: {a.fim}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full mt-6 h-10 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors border border-border flex items-center justify-center gap-2 text-foreground">
                  <AlertTriangle className="size-4" /> Lançar Falta / Atestado
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "extrato" && (
          <ExtratoCompletoPanel vendas={vendasOntem} filter={extratoFilter} setFilter={setExtratoFilter} />
        )}

        {tab === "cadastro" && profile && (
          <CadastroPanel profile={profile} eventos={profile.historico} />
        )}
      </div>

      {openEdit && profile && <EditarColaboradorModal profile={profile} onClose={() => setOpenEdit(false)} />}
      {openOcorrencia && <LancarOcorrenciaModal opName={op.name} onClose={() => setOpenOcorrencia(false)} />}
    </AppShell>
  );
}

// ----------------------------------------------------
// COMPONENTS
// ----------------------------------------------------

const UNIDADES_LISTA = ["Assis Brasil 3224", "Assis Brasil 3044", "Administrativo", "Agendas Médicas", "Alvorada", "Canoas", "Gravataí", "Cachoeirinha"];
const STATUS_EMPREGO_OPTS = ["Ativo", "Férias", "Afastado", "Licença Médica", "Licença Maternidade", "Licença Paternidade", "Inativo"];
const NIVEL_OPTS = ["Iniciante", "Júnior", "Pleno", "Sênior", "Especialista"];
const TIPO_OCORRENCIA = ["Falta justificada", "Falta injustificada", "Atestado médico", "Férias", "Afastamento INSS", "Licença maternidade", "Licença paternidade", "Acidente de trabalho"];

function EditarColaboradorModal({ profile, onClose }: { profile: ColaboradorProfile; onClose: () => void }) {
  const [form, setForm] = useState({
    codigo: profile.codigo,
    email: profile.email,
    nome: profile.nomeCompleto.split(" ")[0] ?? "",
    sobrenome: profile.nomeCompleto.split(" ").slice(1).join(" ") ?? "",
    cpf: profile.cpf,
    cargo: profile.cargo,
    funcao: profile.cargo,
    equipe: profile.equipe,
    nivel: profile.nivel,
    liderDireto: profile.liderDireto,
    contrato: profile.tipoContrato,
    unidadePrincipal: profile.unidades[0] ?? "",
    unidadesExtra: profile.unidades.slice(1),
    statusEmprego: profile.statusEmprego as string,
    dataAdmissao: profile.dataAdmissao,
    dataDesligamento: profile.dataDesligamento ?? "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleUnidade = (u: string) => {
    setForm(f => ({
      ...f,
      unidadesExtra: f.unidadesExtra.includes(u) ? f.unidadesExtra.filter(x => x !== u) : [...f.unidadesExtra, u],
    }));
  };

  const handleSave = () => {
    toast.success("Informações do colaborador atualizadas com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <User className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Editar Colaborador</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Atualize as informações cadastrais e de metas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-5" /></button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

          {/* Dados Pessoais */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <User className="size-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Dados Pessoais</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Código Interno" value={form.codigo} onChange={v => set("codigo", v)} />
              <FormField label="Email Corporativo" value={form.email} onChange={v => set("email", v)} />
              <FormField label="Nome" value={form.nome} onChange={v => set("nome", v)} />
              <FormField label="Sobrenome" value={form.sobrenome} onChange={v => set("sobrenome", v)} />
              <FormField label="CPF" value={form.cpf} onChange={v => set("cpf", v)} placeholder="Apenas números" />
            </div>
          </section>

          {/* Carreira */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Briefcase className="size-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Carreira e Estrutura</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cargo" value={form.cargo} onChange={v => set("cargo", v)} />
              <FormField label="Função" value={form.funcao} onChange={v => set("funcao", v)} />
              <FormField label="Equipe" value={form.equipe} onChange={v => set("equipe", v)} />
              <FormSelect label="Nível" value={form.nivel} onChange={v => set("nivel", v)} options={NIVEL_OPTS} />
              <FormSelect label="Líder Direto" value={form.liderDireto} onChange={v => set("liderDireto", v)}
                options={["Selecionar", "Mariana Lopes", "Rafael Souza", "Patrícia Lima", "Bruno Carvalho"]} />
              <FormField label="Contrato" value={form.contrato} onChange={v => set("contrato", v)} />
            </div>
          </section>

          {/* Unidades */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <MapPin className="size-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Unidades e Atuação</span>
            </div>
            <FormSelect label="Unidade Principal" value={form.unidadePrincipal} onChange={v => set("unidadePrincipal", v)} options={UNIDADES_LISTA} />
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">Todas as Unidades (multisseleção)</div>
              <div className="border border-border rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                {UNIDADES_LISTA.map(u => (
                  <label key={u} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 cursor-pointer border-b border-border last:border-0">
                    <input type="checkbox" checked={form.unidadesExtra.includes(u)}
                      onChange={() => toggleUnidade(u)}
                      className="size-4 accent-primary rounded" />
                    <span className="text-sm font-medium">{u}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Ciclo de Vida */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <CalendarDays className="size-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Ciclo de Vida e Datas</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormSelect label="Status Atual" value={form.statusEmprego} onChange={v => set("statusEmprego", v)} options={STATUS_EMPREGO_OPTS} />
              <FormField label="Admissão" value={form.dataAdmissao} onChange={v => set("dataAdmissao", v)} placeholder="dd/mm/aaaa" type="text" />
              <FormField label="Desligamento" value={form.dataDesligamento} onChange={v => set("dataDesligamento", v)} placeholder="dd/mm/aaaa" type="text" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary/60 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}

function LancarOcorrenciaModal({ opName, onClose }: { opName: string; onClose: () => void }) {
  const [tipo, setTipo] = useState(TIPO_OCORRENCIA[0]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [obs, setObs] = useState("");

  const handleSave = () => {
    if (!inicio) { toast.error("Informe a data de início."); return; }
    toast.success(`Ocorrência "${tipo}" lançada para ${opName}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-warning/15 text-warning-foreground grid place-items-center"><AlertTriangle className="size-4" /></div>
            <div>
              <h3 className="font-semibold text-base">Lançar Ocorrência</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{opName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Tipo de Ocorrência</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-card text-sm font-medium focus:border-primary outline-none">
              {TIPO_OCORRENCIA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Data Início</label>
              <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-card text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Data Fim <span className="text-[10px] normal-case font-normal">(opcional)</span></label>
              <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-card text-sm focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Observação</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3} placeholder="Detalhes adicionais sobre a ocorrência..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:border-primary outline-none resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-secondary/60">Cancelar</button>
          <button onClick={handleSave} className="h-10 px-6 rounded-xl bg-warning text-warning-foreground text-sm font-semibold hover:opacity-90">Registrar Ocorrência</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:border-primary focus:bg-card outline-none transition-colors" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:border-primary outline-none">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: any) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-danger/10 text-danger",
    accent: "bg-accent/15 text-accent",
  }[tone as string];
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className={`size-10 rounded-xl grid place-items-center ${toneCls}`}><Icon className="size-5" /></div>
      <div className="text-xs text-muted-foreground font-medium mt-4">{label}</div>
      <div className="text-xl lg:text-2xl font-bold mt-1 font-display tabular-nums truncate">{value}</div>
    </div>
  );
}

function GuiaStatusPill({ status }: { status: StatusGuia }) {
  const map: Record<StatusGuia, string> = {
    "Confirmado": "bg-success/10 text-success",
    "Cancelado": "bg-danger/10 text-danger",
    "Reagendado": "bg-warning/15 text-warning-foreground",
    "Em análise": "bg-primary/10 text-primary",
    "No-show": "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status]}`}>{status}</span>;
}

// ============== Tab: Extrato Completo ==============
function ExtratoCompletoPanel({ vendas, filter, setFilter }: any) {
  // Converte dd/mm/aaaa → Date para comparação
  function parseDate(str: string): Date | null {
    if (!str) return null;
    const [d, m, y] = str.split("/");
    if (!d || !m || !y) return null;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  function parseInput(str: string): Date | null {
    if (!str) return null;
    const [y, m, d] = str.split("-");
    if (!d || !m || !y) return null;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const filtradas = vendas.filter((v: any) => {
    const matchQ = !filter.q || v.paciente.toLowerCase().includes(filter.q.toLowerCase()) || v.codigoPaciente.includes(filter.q) || v.guia.toLowerCase().includes(filter.q.toLowerCase()) || v.categoria.toLowerCase().includes(filter.q.toLowerCase());
    const matchS = filter.status === "Todos" || v.status === filter.status;
    const matchCat = filter.categoria === "Todas" || v.categoria.toUpperCase().includes(filter.categoria.replace(" (ECG)", ""));
    const vDate = parseDate(v.data);
    const dInicio = parseInput(filter.dataInicio);
    const dFim = parseInput(filter.dataFim);
    const matchDI = !dInicio || (vDate && vDate >= dInicio);
    const matchDF = !dFim || (vDate && vDate <= dFim);
    return matchQ && matchS && matchCat && matchDI && matchDF;
  });

  const totalFiltrado = filtradas.reduce((s: number, v: any) => s + v.valor, 0);
  const hasDateFilter = filter.dataInicio || filter.dataFim;

  const clearDate = () => setFilter({ ...filter, dataInicio: "", dataFim: "" });

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-secondary/10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-lg">Extrato de Guias D-1</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Guias e status do dia anterior. Dados atualizados diariamente.</p>
          </div>
          {/* Resumo rápido */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground font-medium">
              {filtradas.length} registro{filtradas.length !== 1 ? "s" : ""}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-success/10 text-success font-semibold tabular-nums">
              {fmtBRL(totalFiltrado)}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Busca */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={filter.q}
              onChange={e => setFilter({ ...filter, q: e.target.value })}
              placeholder="Buscar paciente, guia..."
              className="h-9 pl-9 pr-3 w-full rounded-lg bg-card border border-border focus:border-primary outline-none text-sm"
            />
          </div>

          {/* Categoria */}
          <select
            value={filter.categoria}
            onChange={e => setFilter({ ...filter, categoria: e.target.value })}
            className="h-9 px-3 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm font-medium w-full sm:w-[150px]"
          >
            <option value="Todas">Todas Categorias</option>
            <option value="DR. CENTRAL">DR. CENTRAL</option>
            <option value="BABYCLICK">BABYCLICK</option>
            <option value="CHECKUP">CHECKUP</option>
            <option value="EXAMES (ECG)">EXAMES (ECG)</option>
            <option value="ODONTO">ODONTO</option>
            <option value="ORÇAMENTOS">ORÇAMENTOS</option>
          </select>

          {/* Status */}
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="h-9 px-3 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm font-medium"
          >
            {["Todos", "Confirmado", "Cancelado", "Reagendado", "Em análise", "No-show"].map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Período */}
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={filter.dataInicio}
              onChange={e => setFilter({ ...filter, dataInicio: e.target.value })}
              className="h-9 px-3 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm"
            />
            <span className="text-xs text-muted-foreground">até</span>
            <input
              type="date"
              value={filter.dataFim}
              onChange={e => setFilter({ ...filter, dataFim: e.target.value })}
              className="h-9 px-3 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm"
            />
            {hasDateFilter && (
              <button
                onClick={clearDate}
                className="h-9 px-2.5 rounded-lg border border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
                title="Limpar período"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left font-semibold py-4 px-6">Data / Horário</th>
              <th className="text-left font-semibold py-4 px-6">Paciente / Guia</th>
              <th className="text-left font-semibold py-4 px-6">Categoria</th>
              <th className="text-right font-semibold py-4 px-6">Valor</th>
              <th className="text-center font-semibold py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtradas.map((v: any) => (
              <tr key={v.guia} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 tabular-nums">
                  <div className="font-medium text-foreground">{v.data}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{v.horario} · {v.unidade}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{v.paciente}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-1">{v.guia} · {v.codigoPaciente}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{v.categoria}</td>
                <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">{fmtBRL(v.valor)}</td>
                <td className="px-6 py-4 text-center"><GuiaStatusPill status={v.status} /></td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma venda encontrada para os filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Tab: Cadastro e Histórico ==============
function CadastroPanel({ profile, eventos }: { profile: NonNullable<ReturnType<typeof getProfile>>, eventos: EventoHistorico[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dados Principais */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><IdCard className="size-5 text-primary" /> Informações Cadastrais</h3>
        <div className="space-y-4">
          <Info icon={Hash} label="Matrícula" value={profile.codigo} />
          <Info icon={IdCard} label="Nome Completo" value={profile.nomeCompleto} />
          <Info icon={Mail} label="E-mail" value={profile.email} />
          <Info icon={FileSignature} label="CPF" value={profile.cpf} />
          <div className="my-4 border-t border-border" />
          <Info icon={Briefcase} label="Cargo / Nível" value={`${profile.cargo} · ${profile.nivel}`} />
          <Info icon={UserCheck} label="Líder Direto" value={profile.liderDireto} />
          <Info icon={MapPin} label="Unidades" value={profile.unidades.join(", ")} />
          <Info icon={CalendarDays} label="Admissão" value={profile.dataAdmissao} />
        </div>
      </div>

      {/* Histórico Simplificado */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Clock className="size-5 text-primary" /> Histórico do Colaborador</h3>
        <ol className="relative border-l border-border ml-3 space-y-6">
          {[...eventos].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5).map(e => {
            const meta = eventoMeta(e.tipo);
            const Icon = meta.icon;
            return (
              <li key={e.id} className="ml-6">
                <span className={`absolute -left-3 grid place-items-center size-6 rounded-full ${meta.cls} ring-4 ring-card`}>
                  <Icon className="size-3.5" />
                </span>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{e.titulo}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{e.data}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{e.descricao}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-secondary/50 grid place-items-center text-muted-foreground shrink-0"><Icon className="size-4" /></div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-right max-w-[200px] truncate">{value}</span>
    </div>
  );
}

function eventoMeta(tipo: EventoHistorico["tipo"]) {
  switch (tipo) {
    case "admissao": return { icon: UserCheck, cls: "bg-success/15 text-success" };
    case "promocao": return { icon: Sparkles, cls: "bg-accent/20 text-accent" };
    case "afastamento": return { icon: Plane, cls: "bg-warning/20 text-warning-foreground" };
    case "advertencia": return { icon: AlertTriangle, cls: "bg-danger/10 text-danger" };
    default: return { icon: CalendarDays, cls: "bg-secondary text-muted-foreground" };
  }
}

// ============== Nota do Colaborador ==============
function NotaColaboradorCard({ seed }: { seed: string }) {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  // NPS: 20-79
  const nps = 20 + (hash * 7 % 60);
  // CSAT: 3.2-5.0
  const csat = 3.2 + ((hash * 11) % 18) / 10;
  // Nota geral combinada (0–5)
  const notaGeral = ((nps / 100) * 5 * 0.4 + csat * 0.6);
  const totalAvaliacoes = 30 + (hash % 70);

  const barColor = notaGeral >= 4.5 ? "bg-success" : notaGeral >= 3.8 ? "bg-warning" : notaGeral >= 3.0 ? "bg-primary" : "bg-danger";
  const noteColor = notaGeral >= 4.5 ? "text-success" : notaGeral >= 3.8 ? "text-warning-foreground" : notaGeral >= 3.0 ? "text-primary" : "text-danger";
  const noteBg = notaGeral >= 4.5 ? "bg-success/10" : notaGeral >= 3.8 ? "bg-warning/10" : notaGeral >= 3.0 ? "bg-primary/10" : "bg-danger/10";
  const noteLabel = notaGeral >= 4.5 ? "Excelente" : notaGeral >= 3.8 ? "Bom" : notaGeral >= 3.0 ? "Regular" : "Crítico";

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
      <div className="flex items-center gap-2 shrink-0 w-40">
        <Star className="size-4 text-warning-foreground shrink-0" />
        <div>
          <div className="text-sm font-semibold">CSAT / NPS</div>
          <div className="text-[11px] text-muted-foreground">{totalAvaliacoes} avaliações</div>
        </div>
      </div>

      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${(notaGeral / 5) * 100}%` }} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xl font-bold sora ${noteColor}`}>{notaGeral.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/ 5</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${noteBg} ${noteColor}`}>{noteLabel}</span>
      </div>
    </div>
  );
}

// ============== Produção por Dia (Barras Diárias) ==============
function ProducaoPorDia({ vendas, metaDiaria }: { vendas: VendaGuia[]; metaDiaria: number }) {
  // Group sales by day
  const porDia = useMemo(() => {
    const map: Record<string, { dia: number; produzido: number; perdido: number; total: number }> = {};
    vendas.forEach(v => {
      const diaNum = parseInt(v.data.split("/")[0], 10);
      const key = String(diaNum);
      if (!map[key]) map[key] = { dia: diaNum, produzido: 0, perdido: 0, total: 0 };
      if (v.status === "Confirmado" || v.status === "Reagendado") {
        map[key].produzido += v.valor;
      } else if (v.status === "Cancelado" || v.status === "No-show") {
        map[key].perdido += v.valor;
      }
      map[key].total += v.valor;
    });
    return Object.values(map).sort((a, b) => a.dia - b.dia);
  }, [vendas]);

  const maxVal = Math.max(...porDia.map(d => Math.max(d.produzido + d.perdido, metaDiaria)), metaDiaria);

  if (porDia.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart2 className="size-4 text-primary" />
          <h3 className="font-semibold text-lg">Produção por Dia</h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-success inline-block" /> Produzido</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger inline-block" /> Perdido</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-4 h-px border-t-2 border-dashed border-muted-foreground inline-block" /> Meta</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: 160 }}>
        {porDia.map(d => {
          const prodH = maxVal > 0 ? (d.produzido / maxVal) * 140 : 0;
          const perdH = maxVal > 0 ? (d.perdido / maxVal) * 140 : 0;
          const metaH = maxVal > 0 ? (metaDiaria / maxVal) * 140 : 0;
          const atingiu = d.produzido >= metaDiaria;
          return (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-0 group relative" title={`Dia ${d.dia} — Prod: R$${d.produzido.toLocaleString()} | Perdido: R$${d.perdido.toLocaleString()}`}>
              {/* Stacked bars */}
              <div className="w-full flex flex-col items-center justify-end" style={{ height: 140 }}>
                {/* Lost (top of stack) */}
                {d.perdido > 0 && (
                  <div className="w-full max-w-[28px] bg-danger/70 rounded-t-sm transition-all group-hover:bg-danger" style={{ height: `${perdH}px` }} />
                )}
                {/* Produced (bottom of stack) */}
                <div className={`w-full max-w-[28px] ${atingiu ? "bg-success" : "bg-success/60"} ${d.perdido > 0 ? "" : "rounded-t-sm"} rounded-b-none transition-all group-hover:brightness-110`} style={{ height: `${Math.max(prodH, 2)}px` }} />
              </div>
              {/* Meta line indicator */}
              <div className="absolute w-full" style={{ bottom: `${metaH + 20}px` }}>
                <div className="w-full border-t border-dashed border-muted-foreground/40" />
              </div>
              {/* Day label */}
              <span className="text-[10px] text-muted-foreground mt-1 font-semibold">{String(d.dia).padStart(2, "0")}</span>

              {/* Tooltip */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none z-20 bg-card border border-border rounded-lg px-3 py-2 text-[11px] shadow-lg whitespace-nowrap transition-opacity">
                <div className="font-semibold mb-1">Dia {String(d.dia).padStart(2, "0")}</div>
                <div className="text-success">Produzido: R${d.produzido.toLocaleString()}</div>
                {d.perdido > 0 && <div className="text-danger">Perdido: R${d.perdido.toLocaleString()}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-6 text-xs">
        <div>
          <span className="text-muted-foreground">Total Produzido: </span>
          <span className="font-bold text-success">
            R${porDia.reduce((s, d) => s + d.produzido, 0).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Total Perdido: </span>
          <span className="font-bold text-danger">
            R${porDia.reduce((s, d) => s + d.perdido, 0).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Dias acima da meta: </span>
          <span className="font-bold text-foreground">
            {porDia.filter(d => d.produzido >= metaDiaria).length} de {porDia.length}
          </span>
        </div>
      </div>
    </div>
  );
}

