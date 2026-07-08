import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu, X, Phone, Mail, Globe, MapPin, Calendar, Clock, Award, Shield, Check,
  ArrowRight, Activity, Video, Heart, Sparkles, Smile, ShieldCheck, HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Central de Consultas | Consultas e Exames Rápidos" },
      { name: "description", content: "Agendamento rápido de consultas e exames em Porto Alegre, Canoas, Gravataí, Cachoeirinha e Alvorada. Telemedicina 24h, sem carência e preços acessíveis." }
    ]
  }),
  component: LandingPage,
} as any));

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [activeTabUnit, setActiveTabUnit] = useState<"todos" | "poa" | "regiao">("todos");
  
  // Custom booking logic
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialty || !selectedUnit) return;
    
    const message = encodeURIComponent(
      `Olá! Gostaria de agendar uma consulta de ${selectedSpecialty} para a unidade de ${selectedUnit}.`
    );
    window.open(`https://wa.me/555132271515?text=${message}`, "_blank");
  };

  const specialtiesList = [
    "Clínica Médica", "Pediatria", "Ginecologia", "Cardiologia", 
    "Dermatologia", "Oftalmologia", "Ortopedia", "Odontologia",
    "Nutrição", "Psicologia", "Endocrinologia", "Neurologia"
  ];

  const services = [
    {
      title: "Consultas Presenciais",
      desc: "Mais de 25 especialidades médicas com atendimento humanizado em consultórios modernos e confortáveis.",
      highlight: "+25 Especialidades",
      icon: Heart,
      color: "bg-blue-50 text-[#1a56a8]"
    },
    {
      title: "Exames e Ecografias",
      desc: "Diagnósticos precisos com equipamentos de alta tecnologia: ecografias, raio-x, exames laboratoriais e mais.",
      highlight: "Resultados Rápidos",
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Telemedicina 24h",
      desc: "Pronto atendimento online imediato ou consultas agendadas por videochamada, no conforto da sua casa.",
      highlight: "Atendimento Online 24h/7",
      icon: Video,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Odontologia",
      desc: "Tratamentos clínicos, estéticos, preventivos e ortodontia para cuidar da saúde do seu sorriso.",
      highlight: "Cuidado Completo",
      icon: Smile,
      color: "bg-teal-50 text-teal-600"
    },
    {
      title: "Check-ups e Procedimentos",
      desc: "Avaliações preventivas completas e pequenos procedimentos cirúrgicos realizados com total segurança.",
      highlight: "Prevenção Integrada",
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Consulta para Emagrecimento",
      desc: "Acompanhamento multidisciplinar focado em saúde, bem-estar e perda de peso saudável de forma sustentável.",
      highlight: "Foco em Resultados",
      icon: Sparkles,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  const units = [
    { name: "Porto Alegre — Assis Brasil 3044", type: "poa", address: "Av. Assis Brasil, 3044 - Porto Alegre/RS" },
    { name: "Porto Alegre — Assis Brasil 3224", type: "poa", address: "Av. Assis Brasil, 3224 - Porto Alegre/RS" },
    { name: "Porto Alegre — Azenha", type: "poa", address: "Av. Azenha, 900 - Porto Alegre/RS" },
    { name: "Porto Alegre — Dr. Flores 47", type: "poa", address: "Rua Dr. Flores, 47 - Centro Histórico, Porto Alegre/RS" },
    { name: "Alvorada", type: "regiao", address: "Av. Presidente Getúlio Vargas - Alvorada/RS" },
    { name: "Canoas", type: "regiao", address: "Av. Getúlio Vargas - Centro, Canoas/RS" },
    { name: "Cachoeirinha", type: "regiao", address: "Av. General Flores da Cunha - Cachoeirinha/RS" },
    { name: "Gravataí", type: "regiao", address: "Av. José Loureiro da Silva - Centro, Gravataí/RS" },
  ];

  const filteredUnits = units.filter(u => {
    if (activeTabUnit === "todos") return true;
    return u.type === activeTabUnit;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#1a56a8]/20 selection:text-[#1a56a8]">
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#1a56a8] to-blue-500 shadow-md shadow-[#1a56a8]/20 flex items-center justify-center text-white font-bold text-lg">
              CC
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl leading-none tracking-tight text-[#1a56a8] group-hover:text-blue-700 transition-colors text-left">
                Central de Consultas
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 text-left">
                Saúde ao seu alcance
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#servicos" className="text-sm font-semibold text-slate-600 hover:text-[#1a56a8] transition-colors">Serviços</a>
            <a href="#unidades" className="text-sm font-semibold text-slate-600 hover:text-[#1a56a8] transition-colors">Unidades</a>
            <a href="#sobre" className="text-sm font-semibold text-slate-600 hover:text-[#1a56a8] transition-colors">Sobre</a>
            <a href="#contato" className="text-sm font-semibold text-slate-600 hover:text-[#1a56a8] transition-colors">Contato</a>
          </nav>

          {/* Agendar Button (Desktop) */}
          <div className="hidden md:flex items-center">
            <a 
              href="#agendar"
              className="bg-[#1a56a8] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-200"
            >
              Agendar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#1a56a8] focus:outline-none"
            aria-label="Menu principal"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-white z-40 flex flex-col px-6 py-8 md:hidden fade-in">
          <nav className="flex flex-col gap-6 text-lg font-bold text-slate-800 text-left">
            <a 
              href="#servicos" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-[#1a56a8]"
            >
              Serviços
            </a>
            <a 
              href="#unidades" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-[#1a56a8]"
            >
              Unidades
            </a>
            <a 
              href="#sobre" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-[#1a56a8]"
            >
              Sobre
            </a>
            <a 
              href="#contato" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-[#1a56a8]"
            >
              Contato
            </a>
          </nav>
          
          <div className="mt-auto pb-12">
            <a 
              href="https://wa.me/555132271515"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#1a56a8] hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all"
            >
              <Phone className="size-5" /> Agendar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-40 -z-10 translate-x-1/2"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-50 rounded-full filter blur-2xl opacity-50 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1a56a8] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="size-4" /> Atendimento Sem Carência
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Consultas e exames com <span className="text-[#1a56a8] bg-gradient-to-r from-[#1a56a8] to-blue-600 bg-clip-text text-transparent">agendamento rápido</span> em Porto Alegre e região
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Atendimento médico de qualidade ao seu alcance nas cidades de <strong>Alvorada, Cachoeirinha, Canoas, Gravataí e Porto Alegre</strong>. Oferecemos consultas e exames com valores acessíveis, sem carência e serviço de <strong>Telemedicina 24h</strong> para seu conforto e segurança.
            </p>

            {/* Quick Benefits Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a56a8]">
                  <Check className="size-4 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Preços Acessíveis</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Check className="size-4 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Sem Carência</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="size-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Check className="size-4 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Telemedicina 24h</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#agendar" 
                className="bg-[#1a56a8] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-center shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                Agendar consulta <ArrowRight className="size-4" />
              </a>
              <a 
                href="#servicos" 
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-xl font-bold text-center transition-all shadow-sm"
              >
                Ver serviços
              </a>
            </div>

          </div>

          {/* Quick Scheduler Form Container (Visual Hook) */}
          <div className="lg:col-span-5" id="agendar">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative">
              
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Clock className="size-3.5" /> Agende Agora
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2 text-left">Simulador de Agendamento</h3>
              <p className="text-xs text-slate-500 mb-6 text-left">Escolha a especialidade e a unidade mais próxima para agendar pelo WhatsApp.</p>

              <form onSubmit={handleBooking} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-left">Especialidade desejada</label>
                  <select 
                    required
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1a56a8] text-sm"
                  >
                    <option value="">Selecione uma especialidade...</option>
                    {specialtiesList.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-left">Unidade mais próxima</label>
                  <select 
                    required
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1a56a8] text-sm"
                  >
                    <option value="">Selecione a unidade...</option>
                    <option value="Porto Alegre - Dr. Flores 47">Porto Alegre (Dr. Flores 47)</option>
                    <option value="Porto Alegre - Azenha">Porto Alegre (Azenha)</option>
                    <option value="Porto Alegre - Assis Brasil 3044">Porto Alegre (Assis Brasil 3044)</option>
                    <option value="Porto Alegre - Assis Brasil 3224">Porto Alegre (Assis Brasil 3224)</option>
                    <option value="Alvorada">Alvorada</option>
                    <option value="Canoas">Canoas</option>
                    <option value="Cachoeirinha">Cachoeirinha</option>
                    <option value="Gravataí">Gravataí</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-[#1a56a8] hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="size-4" /> Confirmar por WhatsApp
                  </button>
                </div>
                
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Atendimento de segunda a sexta das 7h às 19h. Sábado das 7h às 13h.
                </p>
              </form>

            </div>
          </div>

        </div>
      </section>

      {/* Highlights / Stats Numbers Section */}
      <section className="py-12 bg-[#1a56a8] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-blue-400/30">
            
            <div className="py-6 md:py-0 md:px-6">
              <div className="text-4xl lg:text-5xl font-black tracking-tight">+1 Milhão</div>
              <div className="text-blue-100 text-sm font-semibold mt-2 uppercase tracking-widest">Pacientes Atendidos</div>
            </div>

            <div className="py-6 md:py-0 md:px-6">
              <div className="text-4xl lg:text-5xl font-black tracking-tight">+500</div>
              <div className="text-blue-100 text-sm font-semibold mt-2 uppercase tracking-widest">Profissionais de Saúde</div>
            </div>

            <div className="py-6 md:py-0 md:px-6">
              <div className="text-4xl lg:text-5xl font-black tracking-tight">+25</div>
              <div className="text-blue-100 text-sm font-semibold mt-2 uppercase tracking-widest">Especialidades Médicas</div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#1a56a8] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Nossas Soluções</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tudo o que você precisa para cuidar da sua saúde
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Oferecemos atendimento integrado e multidisciplinar para garantir que você e sua família tenham assistência médica completa sempre que precisarem.
            </p>
          </div>

          {/* Grid of Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div 
                  key={idx}
                  className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-[#1a56a8]/20 transition-all duration-300 group text-left flex flex-col h-full"
                >
                  <div className={`size-12 rounded-2xl ${s.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                    <IconComp className="size-6 stroke-[2px]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-950 mb-3">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">{s.desc}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-[#1a56a8] bg-blue-50 px-2.5 py-1 rounded-md">
                      {s.highlight}
                    </span>
                    <a 
                      href="#agendar"
                      className="text-xs font-bold text-slate-400 group-hover:text-[#1a56a8] transition-colors flex items-center gap-1"
                    >
                      Agendar <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Units Section */}
      <section id="unidades" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left max-w-2xl">
              <span className="text-[#1a56a8] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Próximo a Você</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                Unidades modernas em Porto Alegre e Região Metropolitana
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Clínicas em localizações estratégicas e de fácil acesso para que você realize suas consultas e exames sem complicações.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start md:self-end">
              <button 
                onClick={() => setActiveTabUnit("todos")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTabUnit === "todos" ? "bg-white text-[#1a56a8] shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todas
              </button>
              <button 
                onClick={() => setActiveTabUnit("poa")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTabUnit === "poa" ? "bg-white text-[#1a56a8] shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Porto Alegre
              </button>
              <button 
                onClick={() => setActiveTabUnit("regiao")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTabUnit === "regiao" ? "bg-white text-[#1a56a8] shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Metropolitana
              </button>
            </div>
          </div>

          {/* Grid of Unit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredUnits.map((u, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 text-left flex flex-col group"
              >
                <div className="size-10 rounded-xl bg-blue-50 text-[#1a56a8] flex items-center justify-center mb-4 group-hover:bg-[#1a56a8] group-hover:text-white transition-colors">
                  <MapPin className="size-5" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{u.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">{u.address}</p>
                
                <a 
                  href={`https://wa.me/555132271515?text=${encodeURIComponent(`Olá! Gostaria de atendimento para a unidade: ${u.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1a56a8] hover:text-blue-700 flex items-center gap-1.5 mt-auto group-hover:underline"
                >
                  Agendar nesta unidade <ArrowRight className="size-3.5" />
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image / Graphic placeholder with generated visual feel */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#1a56a8]/10 to-blue-600/5 border border-blue-100 flex items-center justify-center p-8 overflow-hidden shadow-inner">
                <div className="text-center space-y-4">
                  <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[#1a56a8] text-white shadow-lg">
                    <Award className="size-8" />
                  </div>
                  <div className="font-extrabold text-2xl text-slate-800">Rede Central de Consultas</div>
                  <div className="text-slate-500 text-xs max-w-xs leading-relaxed">
                    Referência em saúde acessível e de qualidade em Porto Alegre e região metropolitana.
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <span className="size-2 rounded-full bg-[#1a56a8]"></span>
                    <span className="size-2 rounded-full bg-[#1a56a8]/60"></span>
                    <span className="size-2 rounded-full bg-[#1a56a8]/30"></span>
                  </div>
                </div>
              </div>
              
              {/* Extra details card overlay */}
              <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-5 rounded-2xl shadow-xl max-w-xs text-left hidden sm:block border border-slate-800">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#1a56a8] mb-1">Aviso Importante</div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Não realizamos pronto atendimento de urgência e emergência. Consultas e exames são 100% programados.
                </p>
              </div>
            </div>

            {/* About Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              <span className="text-[#1a56a8] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Nossa História</span>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Comprometidos em levar saúde acessível e agendamento rápido
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                A <strong>Central de Consultas</strong> é uma rede de clínicas de saúde estruturada para oferecer exames e consultas médicas de forma rápida, desburocratizada e segura. Nosso compromisso é com o bem-estar social, oferecendo alternativas acessíveis aos pacientes da região metropolitana.
              </p>

              {/* Technical compliance details (Google Ads OAuth context) */}
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Shield className="size-4 text-[#1a56a8]" /> Transparência e Tecnologia
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para atrair pacientes de Porto Alegre e região, anunciamos na rede do Google Ads. Visando mensurar o desempenho das nossas campanhas publicitárias com precisão, nossa equipe interna de tecnologia utiliza a <strong>API do Google Ads</strong> exclusivamente para importar conversões offline (agendamentos de consultas confirmados no nosso CRM) de volta para a nossa conta de anúncios. Esta integração tecnológica é de uso estritamente corporativo e interno, operada de forma segura e confidencial por nossa própria equipe administrativa, sem qualquer tipo de comercialização ou compartilhamento de dados com terceiros.
                </p>
              </div>

              {/* Responsáveis Técnicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Responsável Clínico</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Dr. Luiz Osório Aguiar</div>
                  <div className="text-xs text-[#1a56a8] font-semibold mt-0.5">CREMERS 16.496</div>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Responsável Odontológico</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Dra. Ana Paula Rodrigues</div>
                  <div className="text-xs text-[#1a56a8] font-semibold mt-0.5">CRORS 19.550 / EPAO 4324</div>
                </div>
              </div>

              <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 pt-2">
                <span className="size-1.5 rounded-full bg-rose-600 animate-ping"></span>
                Nota: Não atendemos urgências e emergências médicas.
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Info Column */}
            <div className="lg:col-span-5 text-left space-y-6">
              
              <span className="text-[#1a56a8] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Fale Conosco</span>
              
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Estamos prontos para atender você
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Tem alguma dúvida sobre especialidades, exames, convênios ou procedimentos? Entre em contato por um dos nossos canais de atendimento ou agende direto no WhatsApp.
              </p>

              <div className="space-y-4 pt-4">
                
                <a 
                  href="https://wa.me/555132271515"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp Central</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5 group-hover:text-emerald-600 transition-colors">(51) 3227-1515</div>
                  </div>
                </a>

                <a 
                  href="mailto:sistemas@centraldeconsultas.med.br"
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="size-12 rounded-xl bg-blue-50 text-[#1a56a8] flex items-center justify-center group-hover:bg-[#1a56a8] group-hover:text-white transition-colors shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail de Suporte</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5 truncate group-hover:text-[#1a56a8] transition-colors">sistemas@centraldeconsultas.med.br</div>
                  </div>
                </a>

                <a 
                  href="https://www.centraldeconsultas.med.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#1a56a8] hover:shadow-md transition-all group"
                >
                  <div className="size-12 rounded-xl bg-blue-50 text-[#1a56a8] flex items-center justify-center group-hover:bg-[#1a56a8] group-hover:text-white transition-colors shrink-0">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Website Oficial</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5 group-hover:text-[#1a56a8] transition-colors">www.centraldeconsultas.med.br</div>
                  </div>
                </a>

              </div>

            </div>

            {/* Visual FAQ / Assist Column */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-md">
              <h3 className="text-xl font-extrabold text-slate-900 text-left mb-6 flex items-center gap-2">
                <HelpCircle className="size-5 text-[#1a56a8]" /> Dúvidas Frequentes
              </h3>
              
              <div className="space-y-4 text-left divide-y divide-slate-100">
                
                <div className="pt-4 first:pt-0">
                  <h4 className="font-bold text-slate-900 text-sm">Preciso de encaminhamento médico para agendar?</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Não. Você pode agendar qualquer consulta com especialista ou exame diretamente, sem necessidade de encaminhamento prévio.
                  </p>
                </div>

                <div className="pt-4">
                  <h4 className="font-bold text-slate-900 text-sm">Como funciona o atendimento de Telemedicina 24h?</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Basta clicar em agendar pelo WhatsApp. Nosso pronto atendimento online conecta você a um médico em minutos, por videochamada pelo celular, a qualquer hora do dia ou da noite.
                  </p>
                </div>

                <div className="pt-4">
                  <h4 className="font-bold text-slate-900 text-sm">Quais são as formas de pagamento aceitas?</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Aceitamos PIX, cartões de crédito (com possibilidade de parcelamento) e dinheiro direto nas unidades. Não trabalhamos com planos de saúde tradicionais, o que nos permite oferecer tarifas muito mais acessíveis.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LGPD Consent Popup (Static UI banner for compliance and visual detail) */}
      <div className="bg-slate-900 text-slate-400 py-3 border-t border-slate-800 text-center text-xs px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            🍪 Utilizamos cookies e tratamos dados pessoais conforme a <strong>LGPD (Lei 13.709/2018)</strong> para melhorar sua experiência.
          </span>
          <button 
            onClick={() => alert("Preferências de privacidade salvas!")}
            className="text-[10px] uppercase font-extrabold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded transition-colors"
          >
            Aceitar e continuar
          </button>
        </div>
      </div>

      {/* Footer (Dark) */}
      <footer className="bg-slate-950 text-slate-400 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Branding Column */}
            <div className="md:col-span-5 space-y-4 text-left">
              <a href="#" className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-[#1a56a8] flex items-center justify-center text-white font-bold text-base">
                  CC
                </div>
                <span className="font-extrabold text-lg text-white leading-none tracking-tight">
                  Central de Consultas
                </span>
              </a>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Promovendo saúde integrada com agilidade, acolhimento e preços acessíveis para a população do Rio Grande do Sul.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3 text-left">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navegação</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#servicos" className="hover:text-white transition-colors">Serviços e Especialidades</a></li>
                <li><a href="#unidades" className="hover:text-white transition-colors">Nossas Unidades</a></li>
                <li><a href="#sobre" className="hover:text-white transition-colors">Quem Somos</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Fale Conosco</a></li>
              </ul>
            </div>

            {/* Units Column */}
            <div className="md:col-span-4 text-left">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Unidades</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>• Porto Alegre — Assis Brasil 3044</li>
                <li>• Porto Alegre — Assis Brasil 3224</li>
                <li>• Porto Alegre — Azenha</li>
                <li>• Porto Alegre — Dr. Flores 47</li>
                <li>• Canoas / Gravataí / Cachoeirinha / Alvorada</li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider */}
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Tratamos dados pessoais conforme a LGPD (Lei 13.709/2018). Todos os direitos reservados.
              <br />
              © 2026 Central de Consultas — Porto Alegre/RS.
            </div>
            <div className="text-[11px] text-slate-600">
              Desenvolvido de forma ética e transparente.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
