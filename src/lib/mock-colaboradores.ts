import { operators, type Operator } from "./mock-data";

export type StatusEmprego = "Ativo" | "Inativo" | "Afastado";
export type TipoContrato = "CLT" | "PJ" | "Estágio" | "Temporário";
export type Nivel = "Júnior" | "Pleno" | "Sênior" | "Especialista";

export interface Afastamento {
  id: string;
  inicio: string;       // dd/mm/aaaa
  fim: string | null;   // dd/mm/aaaa | null = em andamento
  motivo: string;
  observacao?: string;
}

export interface EventoHistorico {
  id: string;
  data: string;         // dd/mm/aaaa
  tipo: "admissao" | "promocao" | "transferencia" | "afastamento" | "retorno" | "meta" | "treinamento" | "advertencia" | "desligamento";
  titulo: string;
  descricao: string;
}

export interface ColaboradorProfile {
  codigo: string;       // matrícula
  nomeCompleto: string;
  email: string;
  cpf: string;
  nivel: Nivel;
  equipe: string;
  cargo: string;
  liderDireto: string;
  tipoContrato: TipoContrato;
  unidades: string[];
  statusEmprego: StatusEmprego;
  dataAdmissao: string;
  dataDesligamento: string | null;
  motivoDesligamento?: string;
  afastamentos: Afastamento[];
  historico: EventoHistorico[];
}

const CARGOS = ["Operador Vendas", "Consultor Sênior", "Operador Vendas", "Líder Operacional", "Consultor Pleno"];
const NIVEIS: Nivel[] = ["Júnior", "Pleno", "Sênior", "Especialista"];
const CONTRATOS: TipoContrato[] = ["CLT", "CLT", "CLT", "PJ", "Estágio"];
const UNIDADES_POOL = ["Unidade Paulista", "Unidade Berrini", "Unidade Itaim", "Unidade Centro", "Unidade Tatuapé", "Unidade Morumbi"];
const LIDERES = ["Mariana Lopes", "Rafael Souza", "Patrícia Lima", "Bruno Carvalho"];
const MOTIVOS_AFASTAMENTO = [
  "Atestado médico",
  "Licença maternidade",
  "Licença paternidade",
  "Acidente de trabalho",
  "Auxílio-doença INSS",
  "Férias",
];

function fakeCpf(seed: number) {
  const n = String(10000000000 + ((seed * 9301 + 49297) % 89999999999)).padStart(11, "0").slice(0, 11);
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9, 11)}`;
}

function fakeDate(year: number, month: number, day: number) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

const profiles: Record<string, ColaboradorProfile> = {};

operators.forEach((op, i) => {
  const teamIdx = ["Equipe Alpha", "Equipe Beta", "Equipe Gamma", "Equipe Delta"].indexOf(op.team);
  const isAfastado = i === 7; // mock 1 afastado
  const isInativo = false;
  const unidades = [UNIDADES_POOL[i % UNIDADES_POOL.length], UNIDADES_POOL[(i + 2) % UNIDADES_POOL.length]];
  const admYear = 2020 + (i % 5);
  const admMonth = 1 + (i % 12);
  const admDay = 1 + (i % 27);
  const profile: ColaboradorProfile = {
    codigo: `CC-${String(1000 + i).padStart(4, "0")}`,
    nomeCompleto: op.name,
    email: `${op.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@callcenter.com`,
    cpf: fakeCpf(i + 17),
    nivel: NIVEIS[i % NIVEIS.length],
    equipe: op.team,
    cargo: CARGOS[i % CARGOS.length],
    liderDireto: LIDERES[teamIdx >= 0 ? teamIdx : 0],
    tipoContrato: CONTRATOS[i % CONTRATOS.length],
    unidades,
    statusEmprego: isAfastado ? "Afastado" : isInativo ? "Inativo" : "Ativo",
    dataAdmissao: fakeDate(admYear, admMonth, admDay),
    dataDesligamento: null,
    afastamentos: isAfastado ? [{
      id: "af1",
      inicio: fakeDate(2025, 10, 28),
      fim: null,
      motivo: MOTIVOS_AFASTAMENTO[i % MOTIVOS_AFASTAMENTO.length],
      observacao: "Previsão de retorno em 15 dias",
    }] : i % 6 === 0 ? [{
      id: "af-old",
      inicio: fakeDate(2024, 6, 10),
      fim: fakeDate(2024, 6, 25),
      motivo: "Atestado médico",
    }] : [],
    historico: [
      { id: "h1", data: fakeDate(admYear, admMonth, admDay), tipo: "admissao", titulo: "Admissão", descricao: `Iniciou como ${CARGOS[i % CARGOS.length]} na ${op.team}.` },
      { id: "h2", data: fakeDate(admYear + 1, 3, 12), tipo: "treinamento", titulo: "Treinamento Check-up", descricao: "Concluiu certificação interna de Planos Check-up." },
      { id: "h3", data: fakeDate(2024, 2, 18), tipo: "promocao", titulo: `Promoção para ${NIVEIS[i % NIVEIS.length]}`, descricao: "Reconhecimento por performance consistente acima da meta." },
      { id: "h4", data: fakeDate(2024, 8, 5), tipo: "meta", titulo: "Bateu 130% da meta", descricao: "Mês de agosto/2024 com performance destaque." },
      ...(i % 4 === 0 ? [{ id: "h5", data: fakeDate(2025, 4, 22), tipo: "advertencia" as const, titulo: "Advertência verbal", descricao: "Atrasos recorrentes em abril/2025." }] : []),
      ...(isAfastado ? [{ id: "h6", data: fakeDate(2025, 10, 28), tipo: "afastamento" as const, titulo: "Início de afastamento", descricao: MOTIVOS_AFASTAMENTO[i % MOTIVOS_AFASTAMENTO.length] }] : []),
      { id: "h7", data: fakeDate(2025, 11, 1), tipo: "meta", titulo: "Início do ciclo Nov/2025", descricao: `Meta mensal definida em ${op.metaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}.` },
    ],
  };
  profiles[op.id] = profile;
});

export function getProfile(operatorId: string): ColaboradorProfile | undefined {
  return profiles[operatorId];
}

// --------- Vendas do dia anterior (D-1) por GUIA ---------
export type StatusGuia = "Confirmado" | "Cancelado" | "Reagendado" | "Em análise" | "No-show";

export interface VendaGuia {
  guia: string;
  codigoPaciente: string;
  paciente: string;
  categoria: string;
  valor: number;
  data: string;           // dd/mm/aaaa
  horario: string;        // HH:mm
  unidade: string;
  status: StatusGuia;
  observacao?: string;
}

const PACIENTES = [
  "Marina S. Oliveira", "João P. Castro", "Beatriz N. Almeida", "Rodrigo F. Lima",
  "Camila T. Souza", "Fernando A. Reis", "Isabela M. Cunha", "Pedro H. Vargas",
  "Larissa C. Mota", "Tiago R. Barros", "Aline G. Pinto", "Gustavo L. Faria",
  "Patrícia R. Mendes", "Bruno F. Tavares", "Renata K. Lacerda",
];

const CATS_LABEL = ["DR Central", "BabyClick", "Check-up", "Exames", "Odonto", "Orçamentos"];
const STATUS_POOL: StatusGuia[] = ["Confirmado", "Confirmado", "Confirmado", "Confirmado", "Reagendado", "Cancelado", "Em análise", "No-show", "Confirmado"];

export function getVendasOntem(operatorId: string): VendaGuia[] {
  const op = operators.find(o => o.id === operatorId);
  if (!op) return [];
  const seed = op.id.length + op.name.length;
  const qtd = 10 + (seed % 6);
  return Array.from({ length: qtd }).map((_, i) => {
    const idx = (seed + i) % PACIENTES.length;
    const cat = CATS_LABEL[(seed + i * 3) % CATS_LABEL.length];
    const status = STATUS_POOL[(seed + i * 5) % STATUS_POOL.length];
    const valor = 180 + ((seed * 13 + i * 47) % 1400);
    const h = 8 + (i % 10);
    const m = (i * 17) % 60;
    const dia = 1 + ((seed * 3 + i * 7) % 15); // dias 1-15 do mês
    const codigo = String(100000 + ((seed * 211 + i * 991) % 899999));
    return {
      guia: `G-${String(2025000 + seed * 7 + i * 11).padStart(7, "0")}`,
      codigoPaciente: codigo,
      paciente: PACIENTES[idx],
      categoria: cat,
      valor,
      data: `${String(dia).padStart(2, "0")}/11/2025`,
      horario: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      unidade: UNIDADES_POOL[(seed + i) % UNIDADES_POOL.length],
      status,
      observacao: status === "Cancelado" ? "Paciente cancelou por telefone." :
        status === "Reagendado" ? "Remarcado para próxima semana." :
          status === "No-show" ? "Paciente não compareceu." :
            undefined,
    };
  });
}

// --------- Impacto da saída do colaborador na equipe ---------
export interface ImpactoSaida {
  operador: Operator;
  equipe: string;
  outrosOperadores: Operator[];
  metaEquipe: number;
  produzidoEquipe: number;
  gapEquipe: number;
  metaPerdida: number;          // meta mensal do operador
  produzidoPerdido: number;     // o que ele já entregou
  faltaRealizar: number;        // gap do operador (que não vai mais entregar)
  redistribuicaoPorPessoa: number; // quanto cada um precisa fazer a mais
  redistribuicaoDiariaPorPessoa: number; // por dia útil restante
  diasUteisRestantes: number;
}

export function calcularImpactoSaida(operatorId: string, all: Operator[]): ImpactoSaida | null {
  const op = all.find(o => o.id === operatorId);
  if (!op) return null;
  const outros = all.filter(o => o.team === op.team && o.id !== op.id);
  const metaEquipe = all.filter(o => o.team === op.team).reduce((s, o) => s + o.metaMensal, 0);
  const produzidoEquipe = all.filter(o => o.team === op.team).reduce((s, o) => s + o.produzido, 0);
  const gapEquipe = Math.max(0, metaEquipe - produzidoEquipe);
  const faltaRealizar = Math.max(0, op.metaMensal - op.produzido);
  const redistribuicaoPorPessoa = outros.length > 0 ? Math.round(faltaRealizar / outros.length) : faltaRealizar;
  const diasUteisRestantes = 7; // mock: ciclo Nov/2025 dia 15 de 22
  const redistribuicaoDiariaPorPessoa = Math.round(redistribuicaoPorPessoa / Math.max(1, diasUteisRestantes));
  return {
    operador: op,
    equipe: op.team,
    outrosOperadores: outros,
    metaEquipe,
    produzidoEquipe,
    gapEquipe,
    metaPerdida: op.metaMensal,
    produzidoPerdido: op.produzido,
    faltaRealizar,
    redistribuicaoPorPessoa,
    redistribuicaoDiariaPorPessoa,
    diasUteisRestantes,
  };
}
