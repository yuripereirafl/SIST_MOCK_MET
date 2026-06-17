import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { AppShell, usePortalContext } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { operators as seedOperators, fmtBRL, teams, evolucaoDiaria } from "@/lib/mock-data";
import { getVendasOntem, type StatusGuia } from "@/lib/mock-colaboradores";
import {
  Target, Wallet, Flame, TrendingUp, Search, User, Users as UsersIcon, FileSpreadsheet,
  Activity, TrendingDown, Download, Trophy, CheckCircle2, AlertCircle, LineChart, Building2, AlertTriangle, ChevronDown, PieChart, ArrowUpRight, ArrowDownRight
} from "lucide-react";

export const Route = createFileRoute("/")(({
  head: () => ({ meta: [{ title: "Painel da Liderança — Portal de Metas" }] }),
  component: Dashboard,
} as any));

function Dashboard() {
  const [tab, setTab] = useState<"visao" | "mix" | "vendas" | "grafico" | "gargalos">("visao");
  const { contexto } = usePortalContext();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [extratoFilter, setExtratoFilter] = useState<{ status: "Todos" | StatusGuia; q: string }>({ status: "Todos", q: "" });
  const [searchColaborador, setSearchColaborador] = useState("");

  const toggleTeam = (nome: string) => {
    setSelectedTeams(prev =>
      prev.includes(nome) ? prev.filter(t => t !== nome) : [...prev, nome]
    );
  };

  const activeTeams = contexto !== "Visão Global"
    ? [contexto]
    : selectedTeams.length > 0 ? selectedTeams : null;

  const filtered = activeTeams
    ? seedOperators.filter(o => activeTeams.includes(o.team))
    : seedOperators;

  const ranking = [...filtered].sort((a, b) => (b.produzido / b.metaMensal) - (a.produzido / a.metaMensal)).slice(0, 10);

  // Consolidado do Mês
  const metaEquipe = filtered.reduce((acc, op) => acc + op.metaMensal, 0);
  const produzidoEquipe = filtered.reduce((acc, op) => acc + op.produzido, 0);
  const gapEquipe = Math.max(0, metaEquipe - produzidoEquipe);
  const pctEquipe = metaEquipe > 0 ? (produzidoEquipe / metaEquipe) * 100 : 0;
  const comissaoEquipe = filtered.reduce((acc, op) => acc + op.comissao, 0);
  const projecaoEquipe = produzidoEquipe * 1.35; // Mock

  // Meta Hoje (Mock simple)
  const metaHoje = Math.round(metaEquipe / 22);
  const realizadoHoje = filtered.reduce((acc, op) => acc + op.produzidoHoje, 0);

  // Diário de Vendas
  const todasVendas = useMemo(() => {
    return filtered.flatMap(op => {
      const vendas = getVendasOntem(op.id);
      return vendas.map(v => ({ ...v, operadorName: op.name, operadorInitials: op.initials }));
    }).sort((a, b) => b.horario.localeCompare(a.horario));
  }, [filtered]);

  const vendasFiltradas = todasVendas.filter(v => {
    const matchQ = !extratoFilter.q || v.paciente.toLowerCase().includes(extratoFilter.q.toLowerCase()) || v.guia.toLowerCase().includes(extratoFilter.q.toLowerCase()) || v.operadorName.toLowerCase().includes(extratoFilter.q.toLowerCase());
    const matchS = extratoFilter.status === "Todos" || v.status === extratoFilter.status;
    return matchQ && matchS;
  });

  // Gargalos da Operação
  const vendasPerdidas = todasVendas.filter(v => v.status === "Cancelado" || v.status === "No-show");
  const valorPerdido = vendasPerdidas.reduce((acc, v) => acc + v.valor, 0);
  const totalValorAgendado = todasVendas.reduce((acc, v) => acc + v.valor, 0);
  const taxaConversaoFinanceira = totalValorAgendado > 0 ? ((totalValorAgendado - valorPerdido) / totalValorAgendado) * 100 : 0;

  const gargalosPorColaborador = Object.values(
    vendasPerdidas.reduce((acc: any, v) => {
      if (!acc[v.operadorName]) acc[v.operadorName] = { nome: v.operadorName, iniciais: v.operadorInitials, valor: 0, cancelados: 0, noShows: 0 };
      acc[v.operadorName].valor += v.valor;
      if (v.status === "Cancelado") acc[v.operadorName].cancelados++;
      if (v.status === "No-show") acc[v.operadorName].noShows++;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.valor - a.valor).slice(0, 5) as any[];

  const gargalosPorCategoria = Object.values(
    vendasPerdidas.reduce((acc: any, v) => {
      if (!acc[v.categoria]) acc[v.categoria] = { categoria: v.categoria, valor: 0, qtd: 0 };
      acc[v.categoria].valor += v.valor;
      acc[v.categoria].qtd++;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.valor - a.valor).slice(0, 5) as any[];

  // Mix de Vendas (Performance por Categoria)
  const vendasConfirmadas = todasVendas.filter(v => v.status === "Confirmado" || v.status === "Reagendado");
  const performancePorCategoria = Object.values(
    vendasConfirmadas.reduce((acc: any, v) => {
      if (!acc[v.categoria]) acc[v.categoria] = { categoria: v.categoria, valor: 0, qtd: 0 };
      acc[v.categoria].valor += v.valor;
      acc[v.categoria].qtd++;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.valor - a.valor) as any[];

  // --- Alertas Inteligentes ---
  const colabsAbaixoProjecao = filtered.filter(op => {
    const projetado = (op.produzido / 15) * 22; // 15 dias passados, 22 totais
    return op.metaMensal > 0 && (projetado / op.metaMensal) < 0.8;
  }).length;

  const alertas = [];
  if (colabsAbaixoProjecao > 0) {
    alertas.push({
      type: "danger",
      msg: `${colabsAbaixoProjecao} colaborador${colabsAbaixoProjecao > 1 ? "es estão" : " está"} com projeção de fechamento abaixo de 80% — ação necessária.`,
      icon: AlertCircle,
      tone: "bg-danger/10 text-danger border-danger/20"
    });
  }
  if (taxaConversaoFinanceira < 85) {
    alertas.push({
      type: "warning",
      msg: `Taxa de conversão financeira está em ${taxaConversaoFinanceira.toFixed(1)}% (abaixo do ideal) — Impacto de ${fmtBRL(valorPerdido)} em perdas.`,
      icon: AlertTriangle,
      tone: "bg-warning/15 text-warning-foreground border-warning/30"
    });
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px]">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 fade-up relative z-50">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">Painel da Liderança</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visão consolidada da operação e gestão de equipe.</p>
          </div>
          <div className="flex gap-2 items-center">

            {/* Custom Multi-select Dropdown for Unidades */}
            {contexto === "Visão Global" && (
              <div className="relative">
                <button
                  onClick={() => setIsUnitsOpen(!isUnitsOpen)}
                  className="h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary/60 flex items-center gap-2 transition-colors min-w-[160px] justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedTeams.length === 0 ? "Todas Unidades" : `${selectedTeams.length} Unidade(s)`}
                    </span>
                  </div>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isUnitsOpen ? "rotate-180" : ""}`} />
                </button>

                {isUnitsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUnitsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden fade-in">
                      <div className="p-2 border-b border-border flex justify-between items-center bg-secondary/30">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Filtrar Unidades</span>
                        {selectedTeams.length > 0 && (
                          <button onClick={() => setSelectedTeams([])} className="text-[10px] text-primary hover:underline">Limpar</button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1">
                        {teams.map(team => {
                          const isSelected = selectedTeams.includes(team.nome);
                          return (
                            <button
                              key={team.id}
                              onClick={() => toggleTeam(team.nome)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary/60 rounded-lg transition-colors text-left"
                            >
                              <div className={`size-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-card"
                                }`}>
                                {isSelected && <svg viewBox="0 0 10 8" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              </div>
                              <span className={`truncate flex-1 ${isSelected ? "font-medium text-foreground" : "text-muted-foreground"}`}>{team.nome}</span>
                              <span className="text-[10px] text-muted-foreground">{((team.produzido / team.meta) * 100).toFixed(0)}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="h-9 px-3 w-[130px] rounded-lg border border-border bg-card text-sm font-medium focus:border-primary outline-none transition-colors text-foreground cursor-pointer hover:bg-secondary/60"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="h-9 px-3 w-[130px] rounded-lg border border-border bg-card text-sm font-medium focus:border-primary outline-none transition-colors text-foreground cursor-pointer hover:bg-secondary/60"
              />
            </div>
            <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary/60 flex items-center gap-2 transition-colors">
              <Download className="size-4" /> Exportar Relatório
            </button>
          </div>
        </div>

        {/* Alertas Inteligentes */}
        {alertas.length > 0 && (
          <div className="flex flex-col gap-2 fade-in">
            {alertas.map((al, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${al.tone}`}>
                <al.icon className="size-5 shrink-0" />
                <span className="text-sm font-medium">{al.msg}</span>
              </div>
            ))}
          </div>
        )}


        {/* Ritmo do Dia */}
        <DailyRhythmBanner metaHoje={metaHoje} realizadoHoje={realizadoHoje} />

        {/* Consolidado do Período */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1">
          <KPICard icon={Target} label="Meta do Período" value={fmtBRL(metaEquipe)} progress={100} status="reference" />
          <KPICard icon={Wallet} label="Realizado no Período" value={fmtBRL(produzidoEquipe)} sub={`${pctEquipe.toFixed(1)}% atingido`} progress={pctEquipe} status={pctEquipe >= 100 ? "success" : "warning"} />
          <KPICard icon={Flame} label="Faltante (Gap)" value={fmtBRL(gapEquipe)} progress={100} status="danger" />
          <KPICard icon={Activity} label="Projeção do Período" value={fmtBRL(projecaoEquipe)} sub={`${((projecaoEquipe / metaEquipe) * 100).toFixed(1)}% da meta`} progress={(projecaoEquipe / metaEquipe) * 100} status="reference" trend={{ value: "+2.1%", dir: "up" }} />
        </div>


        {/* Tabs nav */}
        <div className="flex gap-1 border-b border-border overflow-x-auto fade-up-2 mt-8">
          {[
            { id: "visao", label: "Quadro de Colaboradores", icon: UsersIcon },
            { id: "mix", label: "Mix de Vendas", icon: PieChart },
            { id: "vendas", label: "Diário de Vendas", icon: FileSpreadsheet },
            { id: "gargalos", label: "Análise de Gargalos", icon: AlertTriangle },
            { id: "grafico", label: "Evolução e Ranking", icon: LineChart },
          ].map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`inline-flex items-center gap-2 px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "visao" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden fade-in">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-wrap gap-4 bg-secondary/10">
              <div>
                <h3 className="font-semibold text-lg">Quadro da Operação</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Acompanhamento da equipe e status das metas individuais.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={searchColaborador}
                  onChange={e => setSearchColaborador(e.target.value)}
                  placeholder="Buscar colaborador..."
                  className="h-10 pl-9 pr-3 w-full md:w-64 rounded-xl bg-card border border-border focus:border-primary outline-none text-sm shadow-sm transition-colors"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-medium py-4 px-6">Colaborador</th>
                    <th className="text-right font-medium py-4 px-6">Meta Mensal</th>
                    <th className="text-right font-medium py-4 px-6">Realizado</th>
                    <th className="text-left font-medium py-4 px-6 w-44">Atingimento</th>
                    <th className="text-left font-medium py-4 px-6">Status da Meta</th>
                    <th className="text-right font-medium py-4 px-6">Previsão</th>
                    <th className="text-right font-medium py-4 px-6">Ritmo Necessário</th>
                    <th className="text-right font-medium py-4 px-6">vs. Mês Ant.</th>
                    <th className="text-right font-medium py-4 px-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered
                    .filter(op => op.name.toLowerCase().includes(searchColaborador.toLowerCase()) || op.team.toLowerCase().includes(searchColaborador.toLowerCase()))
                    .map(op => {
                      const pctMes = (op.produzido / op.metaMensal) * 100;
                      const dentroDaMeta = pctMes >= 80;
                      // Projeção: baseada no ritmo atual (15 dias passados de 22)
                      const diasPassados = 15;
                      const diasTotais = 22;
                      const diasRestantes = diasTotais - diasPassados;
                      const projetado = (op.produzido / diasPassados) * diasTotais;
                      const previsaoPct = op.metaMensal > 0 ? (projetado / op.metaMensal) * 100 : 0;
                      const previsaoColor = previsaoPct >= 100 ? "text-success" : previsaoPct >= 80 ? "text-warning-foreground" : "text-danger";
                      const previsaoBg = previsaoPct >= 100 ? "bg-success/10" : previsaoPct >= 80 ? "bg-warning/15" : "bg-danger/10";
                      // Ritmo Necessário (Pace)
                      const faltante = Math.max(0, op.metaMensal - op.produzido);
                      const ritmoDiarioNecessario = diasRestantes > 0 ? faltante / diasRestantes : 0;
                      const ritmoDiarioAtual = op.produzido / diasPassados;
                      const paceOk = ritmoDiarioNecessario <= ritmoDiarioAtual;
                      // Comparativo Mês a Mês
                      const deltaMoM = op.produzidoMesAnterior > 0
                        ? ((op.produzido - op.produzidoMesAnterior) / op.produzidoMesAnterior) * 100
                        : 0;
                      const momPositivo = deltaMoM >= 0;
                      return (
                        <tr key={op.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-gradient-to-br from-accent to-chart-5 text-accent-foreground grid place-items-center text-sm font-bold shadow-sm shrink-0">{op.initials}</div>
                              <div>
                                <div className="font-semibold text-foreground">{op.name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{op.team} · Cód: {op.matricula}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">{fmtBRL(op.metaMensal)}</td>
                          <td className="px-6 py-4 text-right tabular-nums font-semibold">{fmtBRL(op.produzido)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <ProgressBar value={pctMes} status={op.status} className="flex-1" />
                              <span className="text-xs font-bold tabular-nums w-10 text-right">{pctMes.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {dentroDaMeta ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-success/15 text-success uppercase tracking-wider">No Ritmo</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-danger/15 text-danger uppercase tracking-wider">Abaixo da Meta</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={`text-sm font-bold tabular-nums ${previsaoColor}`}>{previsaoPct.toFixed(0)}%</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${previsaoBg} ${previsaoColor}`}>{fmtBRL(projetado)}</span>
                            </div>
                          </td>
                          {/* Ritmo Necessário (Pace) */}
                          <td className="px-6 py-4 text-right">
                            {faltante <= 0 ? (
                              <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-1 rounded-md">Meta atingida!</span>
                            ) : (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className={`text-sm font-bold tabular-nums ${paceOk ? "text-success" : "text-danger"}`}>
                                  {fmtBRL(ritmoDiarioNecessario)}/dia
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {diasRestantes} dias restantes
                                </span>
                              </div>
                            )}
                          </td>
                          {/* vs. Mês Anterior */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <div className={`flex items-center gap-1 text-sm font-bold tabular-nums ${momPositivo ? "text-success" : "text-danger"}`}>
                                {momPositivo
                                  ? <ArrowUpRight className="size-4" />
                                  : <ArrowDownRight className="size-4" />
                                }
                                {Math.abs(deltaMoM).toFixed(1)}%
                              </div>
                              <span className="text-[10px] text-muted-foreground">{fmtBRL(op.produzidoMesAnterior)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to="/colaborador/$id" params={{ id: op.id }}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-colors">
                              <User className="size-3.5" /> Detalhes
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "vendas" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden fade-in">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-wrap gap-4 bg-secondary/10">
              <div>
                <h3 className="font-semibold text-lg">Diário de Vendas</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Visão consolidada de todas as vendas da equipe.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input value={extratoFilter.q} onChange={e => setExtratoFilter({ ...extratoFilter, q: e.target.value })} placeholder="Buscar paciente, guia..."
                    className="h-10 pl-9 pr-3 w-full md:w-64 rounded-xl bg-card border border-border focus:border-primary outline-none text-sm shadow-sm" />
                </div>
                <select value={extratoFilter.status} onChange={e => setExtratoFilter({ ...extratoFilter, status: e.target.value as StatusGuia | "Todos" })}
                  className="h-10 px-3 rounded-xl bg-card border border-border focus:border-primary outline-none text-sm shadow-sm font-medium">
                  {["Todos", "Confirmado", "Cancelado", "Reagendado", "Em análise", "No-show"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-semibold py-4 px-6">Colaborador</th>
                    <th className="text-left font-semibold py-4 px-6">Paciente</th>
                    <th className="text-left font-semibold py-4 px-6">Guia</th>
                    <th className="text-left font-semibold py-4 px-6">Categoria</th>
                    <th className="text-right font-semibold py-4 px-6">Valor</th>
                    <th className="text-center font-semibold py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendasFiltradas.map((v: any, i) => (
                    <tr key={v.guia + i} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md bg-secondary text-[10px] font-bold grid place-items-center shrink-0">{v.operadorInitials}</div>
                          <span className="font-medium text-muted-foreground">{v.operadorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{v.paciente}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-muted-foreground">{v.guia}</div>
                        <div className="text-[10px] text-muted-foreground/70">{v.horario}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{v.categoria} <span className="text-[10px] ml-1">({v.unidade})</span></td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">{fmtBRL(v.valor)}</td>
                      <td className="px-6 py-4 text-center"><GuiaStatusPill status={v.status} /></td>
                    </tr>
                  ))}
                  {vendasFiltradas.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma venda encontrada para os filtros aplicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "grafico" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 fade-in">
            {/* Chart */}
            <div className="bg-card border border-border rounded-xl p-5 chart-wrap shadow-sm">
              <div className="mb-4">
                <h3 className="font-medium text-base">Evolução do Mês</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Meta vs Realizado (Visão Geral)</p>
              </div>
              <div className="flex items-center gap-5 text-[11px] text-muted-foreground mb-3">
                <Legend color="#9CA3AF" label="Meta" dashed />
                <Legend color="var(--color-success)" label="Realizado" />
                <Legend color="#60A5FA" label="Projeção" dotted />
                <Legend color="var(--color-danger)" label="Cancelado" />
              </div>
              <ChartSVG />
            </div>

            {/* Ranking */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-warning-foreground" />
                  <h3 className="font-semibold">Top Colaboradores</h3>
                </div>
              </div>

              {/* Pódio Visual */}
              {ranking.length >= 3 && (
                <div className="flex items-end justify-center gap-4 pt-4 pb-6 border-b border-border">
                  {/* Segundo Lugar */}
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="size-10 rounded-full bg-secondary text-muted-foreground grid place-items-center text-xs font-bold border-2 border-border shadow-sm">{ranking[1].initials}</div>
                    <div className="w-16 h-16 bg-gradient-to-t from-secondary to-secondary/30 rounded-t-lg flex items-center justify-center relative">
                      <span className="font-sora font-bold text-xl text-muted-foreground/50">2</span>
                    </div>
                    <div className="text-[10px] font-semibold text-center w-16 truncate">{ranking[1].name}</div>
                  </div>

                  {/* Primeiro Lugar */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
                    <div className="size-12 rounded-full bg-warning/20 text-warning-foreground grid place-items-center text-sm font-bold border-2 border-warning/50 shadow-md ring-2 ring-warning/20 ring-offset-1 ring-offset-card">{ranking[0].initials}</div>
                    <div className="w-20 h-24 bg-gradient-to-t from-warning/20 to-warning/5 rounded-t-lg flex items-center justify-center relative shadow-sm border border-warning/10 border-b-0">
                      <span className="font-sora font-bold text-3xl text-warning/40">1</span>
                    </div>
                    <div className="text-xs font-bold text-center w-20 truncate">{ranking[0].name}</div>
                  </div>

                  {/* Terceiro Lugar */}
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="size-10 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-bold border-2 border-accent/30 shadow-sm">{ranking[2].initials}</div>
                    <div className="w-16 h-12 bg-gradient-to-t from-accent/15 to-accent/5 rounded-t-lg flex items-center justify-center relative border border-accent/10 border-b-0">
                      <span className="font-sora font-bold text-lg text-accent/40">3</span>
                    </div>
                    <div className="text-[10px] font-semibold text-center w-16 truncate">{ranking[2].name}</div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2 mt-2">
                {ranking.slice(ranking.length >= 3 ? 3 : 0, 10).map((op, i) => {
                  const realIndex = ranking.length >= 3 ? i + 3 : i;
                  const pct = (op.produzido / op.metaMensal) * 100;
                  return (
                    <div key={op.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/40 transition-colors">
                      <div className="size-7 grid place-items-center rounded-md text-xs font-bold sora shrink-0 bg-secondary text-muted-foreground">{realIndex + 1}</div>
                      <div className="size-8 rounded-full bg-gradient-to-br from-accent to-chart-5 text-accent-foreground grid place-items-center text-[10px] font-semibold shrink-0">{op.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{op.name}</div>
                        <div className="text-[11px] text-muted-foreground font-medium truncate">{op.team}</div>
                      </div>
                      <div className="text-sm font-bold sora w-12 text-right shrink-0">{pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "gargalos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
            {/* Resumo de Gargalos */}
            <div className="col-span-1 lg:col-span-2 flex flex-wrap gap-4">
              <div className="flex-1 bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Taxa de Conversão</div>
                <div className="text-[26px] font-medium leading-none tracking-tight sora flex items-center gap-2">
                  {taxaConversaoFinanceira.toFixed(1)}%
                  <span className={`text-xs px-2 py-0.5 rounded-full ${taxaConversaoFinanceira >= 85 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {taxaConversaoFinanceira >= 85 ? "Saudável" : "Crítico"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Valor retido vs Agendado ({fmtBRL(totalValorAgendado)})</div>
              </div>
              <div className="flex-1 bg-danger/5 border border-danger/20 rounded-xl p-5 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-danger mb-1 flex items-center gap-1.5"><AlertCircle className="size-3.5" /> Receita Perdida (Cancelados / No-show)</div>
                <div className="text-[26px] font-medium leading-none tracking-tight sora text-danger">{fmtBRL(valorPerdido)}</div>
                <div className="text-xs text-danger/80 mt-2">{vendasPerdidas.length} agendamentos não realizados</div>
              </div>
            </div>

            {/* Top Ofensores - Colaboradores */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-danger" />
                  <h3 className="font-semibold">Maiores Ofensores (Colaboradores)</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
                {gargalosPorColaborador.length > 0 ? gargalosPorColaborador.map((g, i) => (
                  <div key={g.nome} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-secondary/20 border border-border">
                    <div className="size-8 rounded-md bg-secondary text-muted-foreground grid place-items-center text-xs font-bold shrink-0">{g.iniciais}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-foreground">{g.nome}</div>
                      <div className="text-[11px] text-muted-foreground flex gap-2">
                        <span>{g.cancelados} Canc.</span>
                        <span>{g.noShows} No-show</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold sora text-danger shrink-0">{fmtBRL(g.valor)}</div>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground text-center py-6">Nenhum gargalo registrado.</div>
                )}
              </div>
            </div>

            {/* Gargalos por Procedimento */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-warning-foreground" />
                  <h3 className="font-semibold">Perda por Categoria/Procedimento</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
                {gargalosPorCategoria.length > 0 ? gargalosPorCategoria.map((g, i) => {
                  const pctRelativo = (g.valor / valorPerdido) * 100;
                  return (
                    <div key={g.categoria} className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg bg-secondary/20 border border-border">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-foreground">{g.categoria}</div>
                        <div className="text-sm font-bold sora text-danger">{fmtBRL(g.valor)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-danger rounded-full" style={{ width: `${pctRelativo}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-12 text-right">{pctRelativo.toFixed(1)}%</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{g.qtd} agendamentos perdidos</div>
                    </div>
                  );
                }) : (
                  <div className="text-sm text-muted-foreground text-center py-6">Nenhuma perda registrada.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "mix" && (
          <div className="space-y-6 fade-in">
            {/* Valores por Especialidade */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="font-semibold text-base">Valores por Especialidade (R$)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {performancePorCategoria.map((cat, i) => (
                  <div key={cat.categoria} className="bg-card border border-border rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <div className={`size-6 rounded-md grid place-items-center bg-primary/10 text-primary`}>
                        <PieChart className="size-3.5" />
                      </div>
                      {cat.categoria}
                    </div>
                    <div className="text-2xl font-semibold tracking-tight sora text-foreground">{fmtBRL(cat.valor)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendas por Categoria */}
            <div>
              <div className="flex items-center gap-2 mb-4 mt-8">
                <Target className="size-4 text-primary" />
                <h3 className="font-semibold text-base">Vendas por Categoria (Quantidade)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {performancePorCategoria.map((cat, i) => (
                  <div key={cat.categoria} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{cat.categoria}</div>
                    <div className="text-[28px] font-bold sora text-foreground">{cat.qtd}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

/* ─────────────────────────────────────── Components ─── */

function KPICard({ icon: Icon, label, value, sub, progress, status, trend }: any) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const barColor: Record<string, string> = { reference: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" };

  return (
    <div className={`bg-card border rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-primary/30 kpi-vol ${status === "danger" ? "border-danger/25 animate-pulse-border" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div className="size-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground"><Icon className="size-4" /></div>
        {trend && (
          <span className={`text-[11px] font-semibold flex items-center gap-0.5 sora ${trend.dir === "up" ? "text-success" : "text-danger"}`}>
            {trend.dir === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
        <div className="text-[26px] font-medium leading-none tracking-tight sora">{value}</div>
        <div className="h-1 rounded-full bg-secondary/60 mt-2.5 overflow-hidden">
          <div className={`h-full rounded-full ${barColor[status]} transition-all duration-500 ease-out`} style={{ width: mounted ? `${Math.min(progress, 100)}%` : "0%" }} />
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
      </div>
    </div>
  );
}

function DailyRhythmBanner({ metaHoje, realizadoHoje }: { metaHoje: number, realizadoHoje: number }) {
  const falta = Math.max(0, metaHoje - realizadoHoje);
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-6 justify-between fade-up-1">
      <div className="flex items-center gap-8 flex-wrap">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Meta Diária <span className="bg-secondary px-1 py-0.5 rounded text-[9px] font-bold">D-1</span></div>
          <div className="text-lg font-medium mt-0.5 sora">{fmtBRL(metaHoje)}</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Realizado <span className="bg-secondary px-1 py-0.5 rounded text-[9px] font-bold">D-1</span></div>
          <div className="text-lg font-medium mt-0.5 text-success sora">{fmtBRL(realizadoHoje)}</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            {falta > 0 ? "Faltou (Gap)" : "Superávit"} <span className="bg-secondary px-1 py-0.5 rounded text-[9px] font-bold">D-1</span>
          </div>
          <div className={`text-lg font-medium mt-0.5 sora ${falta > 0 ? "text-danger" : "text-success"}`}>
            {fmtBRL(Math.abs(metaHoje - realizadoHoje))}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-right leading-relaxed">
        <span className="font-medium text-foreground">Dia 15</span> de 22 úteis
        <br />68% do ciclo decorrido
      </div>
    </div>
  );
}

function GuiaStatusPill({ status }: { status: StatusGuia }) {
  const map: Record<StatusGuia, string> = {
    "Confirmado": "bg-success/10 text-success", "Cancelado": "bg-danger/10 text-danger", "Reagendado": "bg-warning/15 text-warning-foreground", "Em análise": "bg-primary/10 text-primary", "No-show": "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status]}`}>{status}</span>;
}

function Legend({ color, label, dashed, dotted }: { color: string; label: string; dashed?: boolean; dotted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="18" height="2"><line x1="0" y1="1" x2="18" y2="1" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4 3" : dotted ? "1 3" : undefined} /></svg>
      {label}
    </span>
  );
}

function ChartSVG() {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 700, H = 220, PL = 52, PR = 20, PT = 10, PB = 28;
  const data = evolucaoDiaria;
  const todayIdx = 14;

  const allVals = data.flatMap(d => [d.meta, d.real, d.cancelado]);
  const minV = Math.max(0, Math.floor(Math.min(...allVals) * 0.92 / 5000) * 5000);
  const maxV = Math.ceil(Math.max(...allVals) * 1.08 / 5000) * 5000;

  const xOf = (i: number) => PL + (i / (data.length - 1)) * (W - PL - PR);
  const yOf = (v: number) => PT + (1 - (v - minV) / (maxV - minV)) * (H - PT - PB);

  const realPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d.real).toFixed(1)}`).join(" ");
  const metaPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d.meta).toFixed(1)}`).join(" ");
  const canceladoPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d.cancelado).toFixed(1)}`).join(" ");
  const areaPath = realPath + ` L${xOf(data.length - 1)},${H - PB} L${xOf(0)},${H - PB} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => minV + (i / 4) * (maxV - minV));
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
  const todayX = xOf(todayIdx);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke="var(--color-border)" />
            <text x={PL - 6} y={yOf(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--color-muted-foreground)" className="sora font-semibold">{fmt(v)}</text>
          </g>
        ))}
        {data.filter((_, i) => i % 3 === 0 || i === todayIdx).map((d, _, arr) => {
          const origIdx = data.indexOf(d);
          return <text key={origIdx} x={xOf(origIdx)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)" className="sora font-semibold">{d.dia}</text>;
        })}
        <line x1={todayX} x2={todayX} y1={PT} y2={H - PB} stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
        <text x={todayX + 4} y={PT + 10} fontSize="9" fill="var(--color-primary)" fontWeight="600">HOJE</text>
        <path d={areaPath} fill="url(#areaFill)" />
        <path d={metaPath} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
        <path d={canceladoPath} stroke="var(--color-danger)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d={realPath} stroke="var(--color-success)" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {(() => {
          const proj = data.slice(todayIdx).map((d, i) => `${i === 0 ? "M" : "L"}${xOf(todayIdx + i).toFixed(1)},${yOf(d.meta * 0.97).toFixed(1)}`).join(" ");
          return <path d={proj} stroke="#60A5FA" strokeWidth="2" strokeDasharray="2 4" fill="none" />;
        })()}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xOf(i)} cy={yOf(d.real)} r={hovered === i ? 5 : 3.5} fill="var(--color-card)" stroke="var(--color-success)" strokeWidth="2" style={{ cursor: "crosshair" }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            <circle cx={xOf(i)} cy={yOf(d.cancelado)} r={hovered === i ? 3 : 2} fill="var(--color-danger)" />
          </g>
        ))}
      </svg>
      {hovered !== null && (() => {
        const d = data[hovered];
        const gap = d.real - d.meta;
        const x = (hovered / (data.length - 1)) * 100;
        return (
          <div className="absolute top-2 pointer-events-none z-10 bg-card border border-border rounded-lg px-3 py-2.5 text-xs shadow-lg fade-in" style={{ left: `${Math.min(Math.max(x, 5), 75)}%`, transform: "translateX(-50%)" }}>
            <div className="font-semibold mb-1 text-[11px]">Dia {d.dia}</div>
            <div className="text-muted-foreground">Realizado: <span className="text-success font-medium sora">{fmtBRL(d.real)}</span></div>
            <div className="text-muted-foreground">Meta: <span className="font-medium text-foreground sora">{fmtBRL(d.meta)}</span></div>
            <div className="text-muted-foreground">Cancelado: <span className="text-danger font-medium sora">{fmtBRL(d.cancelado)}</span></div>
            <div className="text-muted-foreground">Gap: <span className={`font-medium sora ${gap >= 0 ? "text-success" : "text-danger"}`}>{gap >= 0 ? "+" : ""}{fmtBRL(Math.abs(gap))}</span></div>
          </div>
        );
      })()}
    </div>
  );
}

function UnitBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(Math.min(value, 100)), 80); }, [value]);
  return <div className={`h-full rounded-full ${color} transition-all duration-700 ease-out`} style={{ width: `${w}%` }} />;
}
