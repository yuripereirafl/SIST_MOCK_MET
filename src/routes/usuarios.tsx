import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { users as seedUsers, teams, type AppUser, type UserRole, type UserStatus } from "@/lib/mock-data";
import { Search, UserPlus, ShieldCheck, Crown, Headphones, Star, MoreHorizontal, Mail, Trash2, Pencil, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [{ title: "Gestão de Usuários — Portal de Metas" }] }),
  component: UsuariosPage,
});

const ROLE_ICON: Record<UserRole, any> = {
  Admin: ShieldCheck,
  Diretor: Crown,
  Líder: Star,
  Operador: Headphones,
};

const ROLE_STYLE: Record<UserRole, string> = {
  Admin:    "bg-danger/10 text-danger border-danger/20",
  Diretor:  "bg-primary/10 text-primary border-primary/20",
  Líder:    "bg-accent/15 text-accent border-accent/30",
  Operador: "bg-secondary text-foreground/70 border-border",
};

const STATUS_STYLE: Record<UserStatus, string> = {
  "Ativo":            "bg-success/10 text-success",
  "Inativo":          "bg-muted text-muted-foreground",
  "Convite Pendente": "bg-warning/15 text-warning-foreground",
};

function UsuariosPage() {
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Todos" | UserRole>("Todos");
  const [statusFilter, setStatusFilter] = useState<"Todos" | UserStatus>("Todos");
  const [openInvite, setOpenInvite] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const filtered = useMemo(() => users.filter(u => {
    const matchQ = !q || u.nome.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const matchR = roleFilter === "Todos" || u.role === roleFilter;
    const matchS = statusFilter === "Todos" || u.status === statusFilter;
    return matchQ && matchR && matchS;
  }), [users, q, roleFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: users.length,
    ativos: users.filter(u => u.status === "Ativo").length,
    pendentes: users.filter(u => u.status === "Convite Pendente").length,
    admins: users.filter(u => u.role === "Admin" || u.role === "Diretor").length,
  }), [users]);

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" } : u));
  }
  function removeUser(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }
  function addUser(data: { nome: string; email: string; role: UserRole; equipe: string | null }) {
    const id = `u${Date.now()}`;
    setUsers(prev => [{
      id, ...data, status: "Convite Pendente", ultimoAcesso: "—",
      initials: data.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(),
    }, ...prev]);
    setOpenInvite(false);
  }
  function editUser(id: string, data: { nome: string; email: string; role: UserRole; equipe: string | null; status: UserStatus }) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data, initials: data.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() } : u));
    setEditingUser(null);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3 fade-up">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Configurações</div>
            <h1 className="text-3xl font-bold mt-1">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">Controle acessos, papéis e convites do portal.</p>
          </div>
          <button onClick={() => setOpenInvite(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 select-none shadow-sm transition-all">
            <UserPlus className="size-4" /> Convidar usuário
          </button>
        </div>

        {/* KPI mini */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up-1">
          <MiniKpi label="Total de usuários"   value={counts.total}     tone="primary" />
          <MiniKpi label="Ativos"              value={counts.ativos}    tone="success" />
          <MiniKpi label="Convites pendentes"  value={counts.pendentes} tone="warning" />
          <MiniKpi label="Admin & Diretores"   value={counts.admins}    tone="danger" />
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center fade-up-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/60 border border-transparent focus:border-ring focus:bg-card outline-none text-sm" />
          </div>
          <Select value={roleFilter} onChange={v => setRoleFilter(v as any)}
            options={["Todos", "Admin", "Diretor", "Líder", "Operador"]} label="Papel" />
          <Select value={statusFilter} onChange={v => setStatusFilter(v as any)}
            options={["Todos", "Ativo", "Inativo", "Convite Pendente"]} label="Status" />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden fade-up-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Usuário</th>
                  <th className="text-left font-medium py-3 px-4">Papel</th>
                  <th className="text-left font-medium py-3 px-4">Equipe</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                  <th className="text-left font-medium py-3 px-4">Último acesso</th>
                  <th className="text-right font-medium py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const RoleIcon = ROLE_ICON[u.role];
                  return (
                    <tr key={u.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center text-xs font-semibold">{u.initials}</div>
                          <div>
                            <div className="font-semibold text-foreground">{u.nome}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_STYLE[u.role]}`}>
                          <RoleIcon className="size-3.5" /> {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{u.equipe ?? <span className="italic">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[u.status]}`}>
                          {u.status === "Ativo" ? <CheckCircle2 className="size-3.5" /> :
                           u.status === "Inativo" ? <XCircle className="size-3.5" /> :
                           <Clock className="size-3.5" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground sora">{u.ultimoAcesso}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <IconBtn title="Reenviar e-mail" onClick={() => {}}><Mail className="size-4" /></IconBtn>
                          <IconBtn title={u.status === "Ativo" ? "Desativar" : "Ativar"} onClick={() => toggleStatus(u.id)}>
                            {u.status === "Ativo" ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                          </IconBtn>
                          <IconBtn title="Editar" onClick={() => setEditingUser(u)}><Pencil className="size-4" /></IconBtn>
                          <IconBtn title="Remover" tone="danger" onClick={() => removeUser(u.id)}><Trash2 className="size-4" /></IconBtn>
                          <IconBtn title="Mais"><MoreHorizontal className="size-4" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles legend */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm fade-up-4">
          <h3 className="font-semibold mb-3">Permissões por papel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <RoleCard role="Admin"    desc="Controle total: usuários, metas, integrações e auditoria." />
            <RoleCard role="Diretor"  desc="Visão executiva, simulador, relatórios e aprovação de metas." />
            <RoleCard role="Líder"    desc="Gerencia sua equipe, ajusta metas individuais e acompanha extratos." />
            <RoleCard role="Operador" desc="Acompanha sua produção, comissão e meta diária." />
          </div>
        </div>
      </div>

      {openInvite && <InviteDialog onClose={() => setOpenInvite(false)} onSubmit={addUser} />}
      {editingUser && <EditDialog user={editingUser} onClose={() => setEditingUser(null)} onSubmit={(data) => editUser(editingUser.id, data)} />}
    </AppShell>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: number; tone: "primary" | "success" | "warning" | "danger" }) {
  const cls = { primary: "text-primary", success: "text-success", warning: "text-warning-foreground", danger: "text-danger" }[tone];
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm kpi-vol">
      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-bold sora mt-2 ${cls}`}>{value}</div>
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      {label}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm text-foreground">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function IconBtn({ children, onClick, title, tone }: { children: React.ReactNode; onClick?: () => void; title?: string; tone?: "danger" }) {
  const cls = tone === "danger" ? "hover:bg-danger/10 hover:text-danger" : "hover:bg-secondary";
  return (
    <button onClick={onClick} title={title} className={`size-8 grid place-items-center rounded-md text-muted-foreground transition-colors ${cls} select-none`}>
      {children}
    </button>
  );
}

function RoleCard({ role, desc }: { role: UserRole; desc: string }) {
  const Icon = ROLE_ICON[role];
  return (
    <div className="border border-border rounded-xl p-4 pipe-card">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_STYLE[role]}`}>
        <Icon className="size-3.5" /> {role}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}

function InviteDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (d: { nome: string; email: string; role: UserRole; equipe: string | null }) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Operador");
  const [equipe, setEquipe] = useState<string>("Equipe Alpha");
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl fade-in">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Convidar usuário</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-5" /></button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (!nome || !email) return; onSubmit({ nome, email, role, equipe: role === "Operador" || role === "Líder" ? equipe : null }); }}>
          <Field label="Nome completo">
            <input value={nome} onChange={e => setNome(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring focus:bg-card outline-none text-sm" placeholder="Ex: João da Silva" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring focus:bg-card outline-none text-sm" placeholder="joao@empresa.com" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Papel">
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm">
                {(["Admin","Diretor","Líder","Operador"] as UserRole[]).map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Equipe">
              <select value={equipe} onChange={e => setEquipe(e.target.value)} disabled={role === "Admin" || role === "Diretor"}
                className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm disabled:opacity-50">
                {teams.map(t => <option key={t.id}>{t.nome}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary/60 select-none">Cancelar</button>
            <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 select-none shadow-sm">
              <Mail className="size-4" /> Enviar convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function EditDialog({ user, onClose, onSubmit }: { user: AppUser; onClose: () => void; onSubmit: (d: { nome: string; email: string; role: UserRole; equipe: string | null; status: UserStatus }) => void }) {
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [equipe, setEquipe] = useState<string>(user.equipe ?? "Equipe Alpha");
  const [status, setStatus] = useState<UserStatus>(user.status);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl fade-in">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Editar usuário</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-5" /></button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (!nome || !email) return; onSubmit({ nome, email, role, status, equipe: role === "Operador" || role === "Líder" ? equipe : null }); }}>
          <Field label="Nome completo">
            <input value={nome} onChange={e => setNome(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring focus:bg-card outline-none text-sm" placeholder="Ex: João da Silva" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring focus:bg-card outline-none text-sm" placeholder="joao@empresa.com" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Papel">
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm">
                {(["Admin","Diretor","Líder","Operador"] as UserRole[]).map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Equipe">
              <select value={equipe} onChange={e => setEquipe(e.target.value)} disabled={role === "Admin" || role === "Diretor"}
                className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm disabled:opacity-50">
                {teams.map(t => <option key={t.id}>{t.nome}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as UserStatus)} className="w-full h-10 px-3 rounded-lg bg-secondary/60 border border-transparent focus:border-ring outline-none text-sm">
              {(["Ativo","Inativo","Convite Pendente"] as UserStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary/60 select-none">Cancelar</button>
            <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 select-none shadow-sm">
              <CheckCircle2 className="size-4" /> Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
