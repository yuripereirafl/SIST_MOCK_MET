import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import {
  History, ArrowRightLeft, Settings2, Target, UserMinus, UserPlus, FileEdit, AlertCircle, FileX,
  Table as TableIcon, List, Calendar as CalendarIcon, Search, Download, Filter, Building2
} from "lucide-react";

export const Route = createFileRoute("/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria — Portal de Metas" }] }),
  component: AuditoriaPage,
});

type EventoAuditoria = {
  id: string;
  data: string;
  hora: string;
  autor: { nome: string; role: string };
  acao: string;
  detalhe: string;
  tipo: "transferencia" | "meta" | "sistema" | "alerta" | "estorno";
  unidade: string;
};

const logs: EventoAuditoria[] = [
  {
    id: "log1",
    data: "15/11",
    hora: "14:22",
    autor: { nome: "Mariana Rocha", role: "Diretor" },
    acao: "Reatribuição de Guia (Cancelamento)",
    detalhe: "Guia G-20250007 cancelada para 'Carlos Silva' e reemitida para 'Amanda Lima' na unidade Gravataí. Valor: R$ 1.250,00.",
    tipo: "transferencia",
    unidade: "Gravataí",
  },
  {
    id: "log2",
    data: "15/11",
    hora: "09:15",
    autor: { nome: "Mariana Rocha", role: "Diretor" },
    acao: "Alteração de Meta",
    detalhe: "Ajustou a meta da unidade Gravataí de R$ 130.000 para R$ 140.000.",
    tipo: "meta",
    unidade: "Gravataí",
  },
  {
    id: "log3",
    data: "14/11",
    hora: "18:40",
    autor: { nome: "Sistema", role: "Automação" },
    acao: "Fechamento Diário",
    detalhe: "Sincronização do D-1 concluída. 148 guias processadas com sucesso.",
    tipo: "sistema",
    unidade: "Global",
  },
  {
    id: "log4",
    data: "14/11",
    hora: "16:10",
    autor: { nome: "Rafael Souza", role: "Líder" },
    acao: "Estorno de Venda",
    detalhe: "Estorno manual da venda de Check-up (R$ 850,00) de 'Juliana Freitas' por duplicidade no sistema.",
    tipo: "estorno",
    unidade: "Dr. Flores",
  },
  {
    id: "log5",
    data: "13/11",
    hora: "11:05",
    autor: { nome: "Helena Cardoso", role: "Admin" },
    acao: "Desativação de Usuário",
    detalhe: "Usuário 'Bruno Carvalho' inativado por afastamento médico prolongado.",
    tipo: "alerta",
    unidade: "Canoas",
  },
  {
    id: "log6",
    data: "13/11",
    hora: "10:15",
    autor: { nome: "Mariana Rocha", role: "Diretor" },
    acao: "Reatribuição de Guia (Falta)",
    detalhe: "Guia G-20250012 reatribuída para 'Roberto Dias'. Operadora original ausente. Valor: R$ 2.100,00.",
    tipo: "transferencia",
    unidade: "Cachoeirinha",
  },
];

const UNIDADES = ["Todas", "Dr. Flores", "Gravataí", "Canoas", "Cachoeirinha", "Global"];

function getIconProps(tipo: EventoAuditoria["tipo"]) {
  const isTransfer = tipo === "transferencia";
  const isMeta = tipo === "meta";
  const isEstorno = tipo === "estorno";
  const isAlerta = tipo === "alerta";

  let Icon = Settings2;
  let iconColor = "text-muted-foreground";
  let bgColor = "bg-secondary";
  let borderColor = "border-border";

  if (isTransfer) {
    Icon = ArrowRightLeft;
    iconColor = "text-accent";
    bgColor = "bg-accent/10";
    borderColor = "border-accent/20";
  } else if (isMeta) {
    Icon = Target;
    iconColor = "text-primary";
    bgColor = "bg-primary/10";
    borderColor = "border-primary/20";
  } else if (isEstorno) {
    Icon = FileX;
    iconColor = "text-danger";
    bgColor = "bg-danger/10";
    borderColor = "border-danger/20";
  } else if (isAlerta) {
    Icon = AlertCircle;
    iconColor = "text-warning-foreground";
    bgColor = "bg-warning/10";
    borderColor = "border-warning/20";
  }
  return { Icon, iconColor, bgColor, borderColor };
}

function AuditoriaPage() {
  const [tab, setTab] = useState<"table" | "timeline">("table");
  const [q, setQ] = useState("");
  const [unidadeFiltro, setUnidadeFiltro] = useState("Todas");
  const [periodoFiltro, setPeriodoFiltro] = useState("Últimos 7 dias");

  const filtrados = logs.filter(l => {
    const matchUnidade = unidadeFiltro === "Todas" || l.unidade === unidadeFiltro || l.unidade === "Global";
    const matchQ = q === "" ||
      l.acao.toLowerCase().includes(q.toLowerCase()) ||
      l.detalhe.toLowerCase().includes(q.toLowerCase()) ||
      l.autor.nome.toLowerCase().includes(q.toLowerCase());
    return matchUnidade && matchQ;
  });

  return (
    <AppShell>
      <div className="space-y-7 max-w-[1400px] mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4 fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Segurança e Controle
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rastreabilidade completa de alterações em metas, guias e usuários no sistema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="size-4" />
              Exportar Log
            </button>
          </div>
        </div>

        {/* ── Filters and View Toggle ── */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm fade-up-1">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por usuário, ação ou detalhe..."
                className="h-9 w-full pl-9 pr-3 rounded-lg bg-secondary/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-40">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <select
                  value={unidadeFiltro}
                  onChange={e => setUnidadeFiltro(e.target.value)}
                  className="h-9 w-full pl-9 pr-8 rounded-lg bg-secondary/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm appearance-none"
                >
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="relative w-full md:w-40">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <select
                  value={periodoFiltro}
                  onChange={e => setPeriodoFiltro(e.target.value)}
                  className="h-9 w-full pl-9 pr-8 rounded-lg bg-secondary/50 border border-transparent focus:bg-card focus:border-ring outline-none text-sm appearance-none"
                >
                  <option>Hoje</option>
                  <option>Últimos 7 dias</option>
                  <option>Neste mês</option>
                  <option>Mês passado</option>
                  <option>Personalizado...</option>
                </select>
              </div>
            </div>

          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-secondary/60 border border-border rounded-lg shrink-0">
            <button
              onClick={() => setTab("table")}
              className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${tab === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <TableIcon className="size-3.5" /> Tabelão
            </button>
            <button
              onClick={() => setTab("timeline")}
              className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${tab === "timeline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="size-3.5" /> Linha do Tempo
            </button>
          </div>
        </div>

        {/* ── Table View ── */}
        {tab === "table" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden fade-up-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-semibold py-3 px-6 w-32">Data/Hora</th>
                    <th className="text-left font-semibold py-3 px-6 w-48">Autor</th>
                    <th className="text-left font-semibold py-3 px-6 w-40">Unidade</th>
                    <th className="text-left font-semibold py-3 px-6 w-56">Ação</th>
                    <th className="text-left font-semibold py-3 px-6">Detalhamento</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((log) => {
                    const { Icon, iconColor, bgColor, borderColor } = getIconProps(log.tipo);
                    return (
                      <tr key={log.id} className="border-t border-border hover:bg-secondary/25 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{log.data}</div>
                          <div className="text-xs text-muted-foreground sora mt-0.5">{log.hora}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                              {log.autor.nome.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-xs leading-none">{log.autor.nome}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{log.autor.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                            {log.unidade}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`size-5 rounded border flex items-center justify-center shrink-0 ${bgColor} ${borderColor}`}>
                              <Icon className={`size-3 ${iconColor}`} />
                            </div>
                            <span className="font-semibold text-xs">{log.acao}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                            {log.detalhe}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Nenhum evento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>Exibindo <strong>{filtrados.length}</strong> eventos de log.</span>
            </div>
          </div>
        )}

        {/* ── Timeline View ── */}
        {tab === "timeline" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm fade-up-2">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[37px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {filtrados.map((log) => {
                const { Icon, iconColor, bgColor, borderColor } = getIconProps(log.tipo);
                return (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center size-10 rounded-full border-[3px] border-card bg-card shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-transform duration-300 group-hover:scale-110">
                      <div className={`size-full flex items-center justify-center rounded-full border ${borderColor} ${bgColor}`}>
                        <Icon className={`size-4 ${iconColor}`} />
                      </div>
                    </div>
                    {/* Content Box */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pipe-card">
                      <div className="bg-secondary/20 border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{log.acao}</span>
                          </div>
                          <div className="text-[10px] font-semibold text-muted-foreground sora tracking-wider uppercase">
                            {log.data} • {log.hora}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {log.detalhe}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                              {log.autor.nome.charAt(0)}
                            </div>
                            <span className="text-[11px] font-medium text-foreground">{log.autor.nome}</span>
                            <span className="text-[10px] text-muted-foreground">({log.autor.role})</span>
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 bg-secondary rounded border border-border">
                            {log.unidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtrados.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground relative z-10 bg-card">
                  Nenhum evento encontrado para os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
