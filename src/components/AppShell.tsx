import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, UserRound, LineChart, Bell, Search, ChevronDown, Settings, PieChart, Moon, Sun, PanelLeftClose, PanelLeftOpen, History, Building2, Target } from "lucide-react";
import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { toast } from "sonner";

export const PortalContext = createContext<{ contexto: string, activeProfileId: string }>({ contexto: "Visão Global", activeProfileId: "admin" });

export function usePortalContext() {
  return useContext(PortalContext);
}

const PROFILES = {
  admin: { id: "admin", name: "Mariana Rocha", role: "Diretora / Admin", initials: "MR", contextLocked: null, allowedContexts: ["Visão Global", "Dr. Flores", "Gravataí", "Canoas", "Cachoeirinha"] },
  gerente: { id: "gerente", name: "Rafael Souza", role: "Gerente de Unidade", initials: "RS", contextLocked: "Gravataí", allowedContexts: ["Gravataí"] },
  lider: { id: "lider", name: "Patrícia Lima", role: "Líder de Equipe", initials: "PL", contextLocked: "Canoas", allowedContexts: ["Canoas"] },
  colaborador: { id: "colaborador", name: "Juliana Freitas", role: "Atendente Comercial", initials: "JF", contextLocked: "Gravataí", allowedContexts: ["Gravataí"] },
};

const navItems = [
  { to: "/", label: "Painel da Liderança", icon: LayoutDashboard, roles: ["admin", "gerente", "lider", "colaborador"] },
  { to: "/usuarios", label: "Gestão de Usuários", icon: Settings, roles: ["admin"] },
  { to: "/auditoria", label: "Auditoria", icon: History, roles: ["admin"] },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<keyof typeof PROFILES>("admin");
  const profile = PROFILES[activeProfileId];

  const [contexto, setContexto] = useState(profile.allowedContexts[0]);
  const [profileMenuAberto, setProfileMenuAberto] = useState(false);

  const nav = navItems.filter(i => i.roles.includes(profile.id));

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <PortalContext.Provider value={{ contexto, activeProfileId }}>
      <div className="min-h-screen flex">
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative border-r border-border z-20 select-none`}>
          <div className={`h-16 flex items-center border-b border-sidebar-border transition-colors duration-300 ${isCollapsed ? 'justify-center' : 'px-6 justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden select-none group cursor-pointer">
                <div className="size-9 shrink-0 rounded-[10px] bg-gradient-to-br from-primary to-accent shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                  <Target className="size-5 text-white drop-shadow-md" strokeWidth={2.5} />
                </div>
                <div className="whitespace-nowrap flex flex-col justify-center">
                  <div className="font-display font-bold leading-none text-[15px] tracking-tight text-sidebar-foreground">Portal de Metas</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="size-1.5 rounded-full bg-success animate-pulse shrink-0"></span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/50 font-bold leading-none">Call Center BI</span>
                  </div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="size-9 shrink-0 rounded-[10px] bg-gradient-to-br from-primary to-accent shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center relative overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                <Target className="size-5 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-5 size-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm z-30 transition-transform hover:scale-105"
          >
            {isCollapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          </button>



          <nav className={`py-4 space-y-1 flex-1 overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {nav.map(({ to, label, icon: Icon }) => {
              const active = path === to;
              return (
                <Link key={to} to={to} title={isCollapsed ? label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors select-none ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    }`}>
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                  {active && !isCollapsed && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                </Link>
              );
            })}
            {profile.id === "colaborador" && (
              <Link
                to="/colaborador/$id"
                params={{ id: "op1" }}
                title={isCollapsed ? "Meu Painel" : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors select-none ${isCollapsed ? 'justify-center px-0 mt-4' : 'px-3 mt-4'} ${path.startsWith("/colaborador")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  }`}
              >
                <UserRound className="size-4 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Meu Painel</span>}
                {path.startsWith("/colaborador") && !isCollapsed && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary shrink-0" />}
              </Link>
            )}
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t border-sidebar-border transition-colors duration-300">
              <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/80">
                <div className="font-medium text-sidebar-foreground mb-1">Ciclo Atual</div>
                Novembro 2025 · Dia 15 de 22
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0 flex flex-col relative transition-all duration-300">
          <header className="h-16 px-6 lg:px-8 sticky top-0 z-10 bg-card/80 backdrop-blur-2xl flex items-center justify-between gap-4 border-b border-border shadow-sm transition-colors duration-300">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Buscar colaborador..."
                className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary/50 border border-transparent focus:border-ring outline-none text-sm transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    toast.success(`Buscando por: ${(e.target as HTMLInputElement).value}`);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              <button onClick={toggleTheme} title="Alternar Tema" className="relative size-9 grid place-items-center rounded-md hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground">
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button onClick={() => toast.info("Você não tem novas notificações.")} className="relative size-9 grid place-items-center rounded-md hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground">
                <Bell className="size-4" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-danger" />
              </button>
              <div className="relative">
                <div
                  onClick={() => setProfileMenuAberto(!profileMenuAberto)}
                  className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center font-medium text-xs shadow-sm">
                    {profile.initials}
                  </div>
                  <div className="text-sm hidden md:block">
                    <div className="font-medium leading-none">{profile.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{profile.role}</div>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground hidden sm:block" />
                </div>

                {profileMenuAberto && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden fade-up-1">
                    <div className="px-4 py-2 border-b border-border bg-secondary/30">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Simular Acesso Como:</div>
                    </div>
                    {Object.entries(PROFILES).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveProfileId(key as any);
                          setContexto(p.allowedContexts[0]);
                          setProfileMenuAberto(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex flex-col gap-0.5 border-b border-border last:border-0"
                      >
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children ?? <Outlet />}</main>
        </div>
      </div>
    </PortalContext.Provider>
  );
}
