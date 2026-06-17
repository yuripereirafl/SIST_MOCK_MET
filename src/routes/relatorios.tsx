import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Download, Trophy, Users,
  CalendarDays, BarChart3, Clock,
  TrendingUp, FileText,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Portal de Metas" }] }),
  component: RelatoriosPage,
});


function RelatoriosPage() {
  return (
    <AppShell>
      <div className="space-y-7 max-w-[1400px]">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4 fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Exportações e Dados
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gere e baixe relatórios detalhados em formato Excel (.xlsx)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
            <Clock className="size-3.5" />
            Última geração: hoje às 14:30
          </div>
        </div>


        {/* ── Report cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 fade-up-2">
          <ReportCard
            title="Vendas por Dia"
            description="Volume de vendas, receita e leads por dia."
            icon={CalendarDays}
            accentColor="bg-blue-500/10 text-blue-500"
            filters={<DateRangeFilter />}
            filename="vendas_por_dia.xlsx"
          />
          <ReportCard
            title="Ranking de Vendedores"
            description="Top vendedores filtrados por período."
            icon={Trophy}
            accentColor="bg-yellow-500/10 text-yellow-500"
            filters={
              <SelectFilter
                label="Período"
                options={["Hoje", "Esta Semana", "Este Mês", "Mês Anterior"]}
              />
            }
            filename="top_vendedores.xlsx"
          />
          <ReportCard
            title="Comparativo por Equipe"
            description="Colaborador vs média da equipe, lado a lado."
            icon={Users}
            accentColor="bg-violet-500/10 text-violet-500"
            filters={
              <div className="space-y-2.5">
                <SelectFilter
                  label="Equipe"
                  options={["Equipe Alpha", "Equipe Beta", "Equipe Gamma", "Equipe Delta"]}
                />
                <SelectFilter
                  label="Colaborador"
                  options={["Todos", "Carlos Silva", "Amanda Lima", "Roberto Dias"]}
                />
              </div>
            }
            filename="comparativo_desempenho.xlsx"
          />
          <ReportCard
            title="Atingimento de Metas"
            description="Meta, realizado e % de atingimento por equipe."
            icon={BarChart3}
            accentColor="bg-emerald-500/10 text-emerald-500"
            filters={
              <SelectFilter
                label="Visão"
                options={["Por Equipe", "Por Colaborador", "Consolidado"]}
              />
            }
            filename="atingimento_metas.xlsx"
          />
        </div>


      </div>
    </AppShell>
  );
}

/* ──────────────────────── Sub-components ────────────────────────── */

function ReportCard({
  title, description, icon: Icon, accentColor, filters, filename,
}: {
  title: string; description: string; icon: any;
  accentColor: string; filters: React.ReactNode; filename: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    toast.info(`Preparando ${filename}…`, { description: "Extraindo dados do sistema." });
    setTimeout(() => {
      setLoading(false);
      toast.success("Download Concluído", {
        description: `${filename} salvo com sucesso.`,
      });
    }, 1600);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-accent/30 transition-colors pipe-card">
      <div className="flex items-center gap-3">
        <div className={`size-9 shrink-0 rounded-lg flex items-center justify-center ${accentColor}`}>
          <Icon className="size-4.5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm leading-snug">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex-1 bg-secondary/30 rounded-lg p-3.5 border border-border/60">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Filtros
        </div>
        {filters}
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 select-none shadow-sm"
      >
        {loading ? (
          <span className="animate-pulse">Gerando Excel…</span>
        ) : (
          <>
            <Download className="size-3.5" />
            Baixar Excel
          </>
        )}
      </button>
    </div>
  );
}

function DateRangeFilter() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span className="text-[10px] text-muted-foreground block mb-1.5 font-semibold">Data Inicial</span>
        <input type="date" className="w-full h-8 px-2 rounded-md text-xs bg-card border border-border text-foreground" />
      </label>
      <label className="block">
        <span className="text-[10px] text-muted-foreground block mb-1.5 font-semibold">Data Final</span>
        <input type="date" className="w-full h-8 px-2 rounded-md text-xs bg-card border border-border text-foreground" />
      </label>
    </div>
  );
}

function SelectFilter({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[10px] text-muted-foreground block mb-1.5 font-semibold">{label}</span>
      <select className="w-full h-8 px-2 rounded-md text-xs bg-card border border-border text-foreground">
        {options.map((opt) => <option key={opt}>{opt}</option>)}
      </select>
    </label>
  );
}
