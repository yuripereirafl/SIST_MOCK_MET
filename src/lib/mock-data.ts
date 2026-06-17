export type Status = "green" | "yellow" | "red";

export interface VendasCategorias {
  drCentral: number;
  babyclick: number;
  checkup: number;
  exames: number;
  odonto: number;
  orcamentos: number;
}

export interface ComissaoBreakdown {
  producao: number;
  campanhas: number;
  drCentral: number;
}

export interface Operator {
  id: string;
  name: string;
  initials: string;
  matricula: string;
  team: string;
  metaDiaria: number;
  metaMensal: number;
  produzido: number;
  produzidoHoje: number;
  produzidoMesAnterior: number;
  vendas: VendasCategorias;
  vendasHoje: VendasCategorias;
  comissao: number;
  comissaoBreakdown: ComissaoBreakdown;
  comissaoHojeBreakdown: ComissaoBreakdown;
  forecast: number;
  status: Status;
  extrato: {
    agendamentos: number;
    cancelamentos: number;
    conversoes: number;
    movimentacoes: number;
    parcial: number;
  };
}

export interface Team {
  id: string;
  nome: string;
  lider: string;
  meta: number;
  produzido: number;
  membros: number;
  status: Status;
}

export const metaTotal = 500000;
export const realizadoTotal = 327450;
export const projecaoTotal = 482300;

export const teams: Team[] = [
  { id: "t1", nome: "Dr. Flores", lider: "Mariana Lopes", meta: 140000, produzido: 102800, membros: 8, status: "green" },
  { id: "t2", nome: "Gravataí", lider: "Rafael Souza", meta: 130000, produzido: 78200, membros: 7, status: "yellow" },
  { id: "t3", nome: "Canoas", lider: "Patrícia Lima", meta: 120000, produzido: 95600, membros: 7, status: "green" },
  { id: "t4", nome: "Cachoeirinha", lider: "Bruno Carvalho", meta: 110000, produzido: 50850, membros: 6, status: "red" },
];

const nomes = [
  "Ana Beatriz Ramos", "Carlos Henrique", "Daniela Pires", "Eduardo Martins", "Fernanda Souza",
  "Gabriel Almeida", "Helena Cardoso", "Igor Tavares", "Juliana Freitas", "Kauê Mendes",
  "Larissa Nogueira", "Marcos Pereira", "Natália Vidal", "Otávio Ribeiro", "Paula Castro",
  "Renata Silva", "Sérgio Andrade", "Tatiana Borges", "Ulisses Cruz", "Vanessa Duarte",
];

function statusFromPct(p: number): Status {
  if (p >= 0.95) return "green";
  if (p >= 0.7) return "yellow";
  return "red";
}

// Distribution weights for sales categories — sum = 1
const VENDAS_WEIGHTS = {
  drCentral: 0.22,
  babyclick: 0.12,
  checkup: 0.24,
  exames: 0.18,
  odonto: 0.14,
  orcamentos: 0.10,
};

function splitVendas(total: number, seed: number): VendasCategorias {
  // small per-operator jitter so cards aren't identical
  const j = (k: number) => 1 + ((Math.sin(seed * 7.3 + k) + 1) / 2) * 0.4 - 0.2;
  const raw = {
    drCentral: VENDAS_WEIGHTS.drCentral * j(1),
    babyclick: VENDAS_WEIGHTS.babyclick * j(2),
    checkup: VENDAS_WEIGHTS.checkup * j(3),
    exames: VENDAS_WEIGHTS.exames * j(4),
    odonto: VENDAS_WEIGHTS.odonto * j(5),
    orcamentos: VENDAS_WEIGHTS.orcamentos * j(6),
  };
  const s = Object.values(raw).reduce((a, b) => a + b, 0);
  return {
    drCentral: Math.round((raw.drCentral / s) * total),
    babyclick: Math.round((raw.babyclick / s) * total),
    checkup: Math.round((raw.checkup / s) * total),
    exames: Math.round((raw.exames / s) * total),
    odonto: Math.round((raw.odonto / s) * total),
    orcamentos: Math.round((raw.orcamentos / s) * total),
  };
}

function splitComissao(total: number, seed: number): ComissaoBreakdown {
  const j = (k: number) => 1 + ((Math.cos(seed * 5.1 + k) + 1) / 2) * 0.3 - 0.15;
  const raw = {
    producao: 0.65 * j(1),
    campanhas: 0.20 * j(2),
    drCentral: 0.15 * j(3),
  };
  const s = raw.producao + raw.campanhas + raw.drCentral;
  return {
    producao: Math.round((raw.producao / s) * total),
    campanhas: Math.round((raw.campanhas / s) * total),
    drCentral: Math.round((raw.drCentral / s) * total),
  };
}

export const operators: Operator[] = nomes.map((nome, i) => {
  const team = teams[i % teams.length];
  const metaMensal = 18000 + (i % 5) * 1500;
  const metaDiaria = Math.round(metaMensal / 22);
  const factor = [1.12, 0.85, 0.62, 1.05, 0.95, 1.2, 0.7, 0.9, 1.3, 0.55,
    1.0, 0.8, 1.15, 0.65, 0.92, 1.08, 0.78, 1.22, 0.88, 0.97][i];
  const produzido = Math.round(metaMensal * factor * 0.7);
  const produzidoHoje = Math.round(metaDiaria * factor * 0.9);
  const pctMes = produzido / metaMensal;
  const comissao = Math.round(produzido * 0.07);
  const comissaoHoje = Math.round(produzidoHoje * 0.07);
  const mesAnteriorFactor = [0.98, 0.92, 0.70, 1.10, 0.88, 1.05, 0.75, 0.95, 1.15, 0.60,
    1.02, 0.85, 1.08, 0.72, 0.99, 1.12, 0.80, 1.18, 0.90, 1.00][i];
  const produzidoMesAnterior = Math.round(metaMensal * mesAnteriorFactor * 0.7);
  return {
    id: `op${i + 1}`,
    name: nome,
    initials: nome.split(" ").map(n => n[0]).slice(0, 2).join(""),
    matricula: `CC-${1000 + i}`,
    team: team.nome,
    metaDiaria,
    metaMensal,
    produzido,
    produzidoHoje,
    produzidoMesAnterior,
    vendas: splitVendas(produzido, i + 1),
    vendasHoje: splitVendas(produzidoHoje, i + 11),
    comissao,
    comissaoBreakdown: splitComissao(comissao, i + 1),
    comissaoHojeBreakdown: splitComissao(comissaoHoje, i + 21),
    forecast: Math.round(produzidoHoje * 1.15),
    status: statusFromPct(pctMes),
    extrato: {
      agendamentos: 8 + (i % 7),
      cancelamentos: 1 + (i % 3),
      conversoes: 3 + (i % 5),
      movimentacoes: 2 + (i % 4),
      parcial: produzidoHoje,
    },
  };
});

export const evolucaoDiaria = [
  { dia: "01", meta: 22700, real: 24100, cancelado: 3200 },
  { dia: "02", meta: 22700, real: 21300, cancelado: 4100 },
  { dia: "03", meta: 22700, real: 25800, cancelado: 2800 },
  { dia: "04", meta: 22700, real: 23200, cancelado: 1500 },
  { dia: "05", meta: 22700, real: 19400, cancelado: 5600 },
  { dia: "06", meta: 22700, real: 26100, cancelado: 2100 },
  { dia: "07", meta: 22700, real: 22800, cancelado: 3400 },
  { dia: "08", meta: 22700, real: 24300, cancelado: 2900 },
  { dia: "09", meta: 22700, real: 20500, cancelado: 4800 },
  { dia: "10", meta: 22700, real: 27200, cancelado: 1200 },
  { dia: "11", meta: 22700, real: 25600, cancelado: 2400 },
  { dia: "12", meta: 22700, real: 23900, cancelado: 3800 },
  { dia: "13", meta: 22700, real: 21100, cancelado: 4500 },
  { dia: "14", meta: 22700, real: 24700, cancelado: 1900 },
  { dia: "15", meta: 22700, real: 22450, cancelado: 2700 },
];

export const alertas = [
  { tipo: "danger" as const, titulo: "Meta em risco", msg: "Cachoeirinha projeta 46% do mês com 12 dias restantes." },
  { tipo: "warning" as const, titulo: "Equipe abaixo da média", msg: "Gravataí 12% abaixo do ritmo necessário." },
  { tipo: "success" as const, titulo: "Alta performance", msg: "Juliana Freitas superou 130% da meta diária 3 dias seguidos." },
];

// Categoria de venda → label + cor (para UI)
export const VENDAS_CATS: { key: keyof VendasCategorias; label: string; color: string }[] = [
  { key: "drCentral", label: "DR Central", color: "var(--color-success)" },
  { key: "babyclick", label: "BabyClick", color: "var(--color-chart-5)" },
  { key: "checkup", label: "Check-up", color: "var(--color-accent)" },
  { key: "exames", label: "Exames", color: "var(--color-primary)" },
  { key: "odonto", label: "Odonto", color: "var(--color-chart-3)" },
  { key: "orcamentos", label: "Orçamentos", color: "var(--color-warning)" },
];

export const COMISSAO_CATS: { key: keyof ComissaoBreakdown; label: string; color: string }[] = [
  { key: "producao", label: "Produção", color: "var(--color-success)" },
  { key: "campanhas", label: "Campanhas", color: "var(--color-warning)" },
  { key: "drCentral", label: "DR Central", color: "var(--color-accent)" },
];

export function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// ----- Usuários (mock) -----
export type UserRole = "Admin" | "Diretor" | "Líder" | "Operador";
export type UserStatus = "Ativo" | "Inativo" | "Convite Pendente";

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  equipe: string | null;
  status: UserStatus;
  ultimoAcesso: string;
  initials: string;
}

const userSeeds: Array<Omit<AppUser, "initials" | "id"> & { id?: string }> = [
  { nome: "Mariana Rocha", email: "mariana.rocha@callcenter.com", role: "Diretor", equipe: null, status: "Ativo", ultimoAcesso: "Há 2 min" },
  { nome: "Mariana Lopes", email: "mariana.lopes@callcenter.com", role: "Líder", equipe: "Dr. Flores", status: "Ativo", ultimoAcesso: "Há 12 min" },
  { nome: "Rafael Souza", email: "rafael.souza@callcenter.com", role: "Líder", equipe: "Gravataí", status: "Ativo", ultimoAcesso: "Há 1 h" },
  { nome: "Patrícia Lima", email: "patricia.lima@callcenter.com", role: "Líder", equipe: "Canoas", status: "Ativo", ultimoAcesso: "Há 38 min" },
  { nome: "Bruno Carvalho", email: "bruno.carvalho@callcenter.com", role: "Líder", equipe: "Cachoeirinha", status: "Inativo", ultimoAcesso: "Há 3 dias" },
  { nome: "Helena Cardoso", email: "helena.cardoso@callcenter.com", role: "Admin", equipe: null, status: "Ativo", ultimoAcesso: "Há 5 h" },
  { nome: "Igor Tavares", email: "igor.tavares@callcenter.com", role: "Operador", equipe: "Dr. Flores", status: "Ativo", ultimoAcesso: "Há 4 min" },
  { nome: "Juliana Freitas", email: "juliana.freitas@callcenter.com", role: "Operador", equipe: "Gravataí", status: "Ativo", ultimoAcesso: "Há 22 min" },
  { nome: "Kauê Mendes", email: "kaue.mendes@callcenter.com", role: "Operador", equipe: "Canoas", status: "Convite Pendente", ultimoAcesso: "—" },
  { nome: "Larissa Nogueira", email: "larissa.nogueira@callcenter.com", role: "Operador", equipe: "Cachoeirinha", status: "Ativo", ultimoAcesso: "Há 1 dia" },
  { nome: "Marcos Pereira", email: "marcos.pereira@callcenter.com", role: "Operador", equipe: "Dr. Flores", status: "Ativo", ultimoAcesso: "Há 9 min" },
  { nome: "Natália Vidal", email: "natalia.vidal@callcenter.com", role: "Operador", equipe: "Gravataí", status: "Inativo", ultimoAcesso: "Há 7 dias" },
];

export const users: AppUser[] = userSeeds.map((u, i) => ({
  id: `u${i + 1}`,
  ...u,
  initials: u.nome.split(" ").map(n => n[0]).slice(0, 2).join(""),
}));
