import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  CreditCard,
  LayoutDashboard,
  LayoutGrid,
  List,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  MapPin,
  MoreHorizontal,
  MousePointerClick,
  MoveRight,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RecentBuyersPopup } from "@/components/RecentBuyersPopup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ND7 | CRM inteligente para vendas e relacionamento" },
      { name: "description", content: "Centralize clientes, vendas, equipe e processos com o ND7, o CRM para empresas que querem crescer com controle." },
      { property: "og:title", content: "ND7 | CRM inteligente para vendas e relacionamento" },
      { property: "og:description", content: "Centralize clientes, vendas, equipe e processos com o ND7, o CRM para empresas que querem crescer com controle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Nexus,
});
type View =
  | "landing"
  | "crm"
  | "admin"
  | "login"
  | "checkout"
  | "subscription"
  | "contacts"
  | "finance"
  | "pipeline"
  | "agenda"
  | "team"
  | "settings"
  | "whatsapp"
  | "messages";
type AccessRole = "super_admin" | "owner" | "operator";
const businesses = [
  ["Demo v1", "Mariana Costa", "Profissional", "Ativa", "R$ 297", "DV1"],
  ["Demo v2", "Rafael Nunes", "Profissional", "Ativa", "R$ 297", "DV2"],
];
function Logo() {
  return (
    <img
      src="/nd7-logo.png"
      alt="ND7"
      width={40}
      height={40}
      decoding="async"
      fetchPriority="high"
      className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-300/30"
    />
  );
}
function Nexus() {
  const [view, setView] = useState<View>("landing"),
    [menu, setMenu] = useState(false),
    [signedInAsSuperAdmin, setSignedInAsSuperAdmin] = useState(false),
    [impersonating, setImpersonating] = useState(false),
    [activeCompany, setActiveCompany] = useState("Demo v1"),
    [notice, setNotice] = useState(""),
    [profilePhoto, setProfilePhoto] = useState<string | null>(null),
    [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const say = useCallback((t: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(t);
    noticeTimer.current = setTimeout(() => setNotice(""), 2800);
  }, []);
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!menu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menu]);
  useEffect(() => {
    setProfilePhoto(window.localStorage.getItem("nd7-profile-photo"));
  }, []);
  const updateProfilePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      say("Escolha uma imagem de até 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setProfilePhoto(image);
      window.localStorage.setItem("nd7-profile-photo", image);
      setProfileDialogOpen(false);
      say("Foto de perfil atualizada.");
    };
    reader.readAsDataURL(file);
  };
  const [selectedCycle, setSelectedCycle] = useState("Mensal");

  if (view === "landing")
    return (
      <>
        <Landing
          access={() => setView("login")}
          start={(plan?: string) => {
            if (plan) setSelectedCycle(plan);
            setView("checkout");
          }}
        />
        <RecentBuyersPopup />
      </>
    );
  if (view === "login")
    return (
      <Login
        back={() => setView("landing")}
        enter={() => {
          setSignedInAsSuperAdmin(true);
          setView("admin");
        }}
      />
    );
  if (view === "checkout")
    return (
      <>
        <Checkout
          initialCycle={selectedCycle}
          back={() => setView("landing")}
          done={() =>
            say("Pagamento iniciado. O acesso será liberado após a confirmação pela Asaas.")
          }
        />
        <RecentBuyersPopup />
      </>
    );
  return (
    <div className="app-shell min-h-screen bg-[#f8fbff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {notice && (
        <div className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 max-w-[calc(100vw-2rem)] rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl sm:right-5 sm:max-w-sm">
          <Check className="mr-2 inline h-4 w-4 text-emerald-300" />
          {notice}
        </div>
      )}
      {profileDialogOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
          <button aria-label="Fechar janela de perfil" className="absolute inset-0" onClick={() => setProfileDialogOpen(false)} />
          <section className="profile-dialog relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl sm:p-6">
            <button aria-label="Fechar" onClick={() => setProfileDialogOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"><X className="h-4 w-4" /></button>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">Perfil</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Sua foto de perfil</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Escolha uma imagem do seu computador ou celular para personalizar seu acesso.</p>
            <div className="mt-6 flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
              <span className="profile-avatar flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 dark:bg-blue-950 text-sm font-bold text-blue-700 dark:text-blue-300">{profilePhoto ? <img src={profilePhoto} alt="Foto de perfil" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : "DD"}</span>
              <div><b className="block text-sm text-slate-900 dark:text-white">Daniel Diniz</b><span className="text-xs text-slate-500 dark:text-slate-400">Administrador</span></div>
            </div>
            <input ref={profileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => updateProfilePhoto(event.target.files?.[0])} />
            <button onClick={() => profileInputRef.current?.click()} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Escolher foto</button>
            {profilePhoto && <button onClick={() => { setProfilePhoto(null); window.localStorage.removeItem("nd7-profile-photo"); }} className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600">Remover foto</button>}
          </section>
        </div>
      )}
      <div className="flex">
        <button
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
          className={`drawer-backdrop fixed inset-0 z-30 bg-[#071a3d]/55 ${menu ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        />
        <Sidebar
          view={view}
          setView={setView}
          menu={menu}
          setMenu={setMenu}
          impersonating={impersonating}
          returnToAdmin={() => {
            setImpersonating(false);
            setView("admin");
            setMenu(false);
            say("Você voltou à Central Super Admin.");
          }}
          logout={() => {
            setMenu(false);
            setImpersonating(false);
            setSignedInAsSuperAdmin(false);
            setView("landing");
            say("Você saiu da sua conta.");
          }}
        />
        <main className="app-main min-h-screen min-w-0 flex-1 bg-[#f8fbff] dark:bg-[#090d16] transition-colors duration-200">
          <header className="app-topbar flex h-[72px] items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xl px-5 md:px-8">
            <div className="flex items-center gap-4">
              <button
                aria-label="Abrir menu"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                onClick={() => setMenu(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="app-search hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400 md:flex">
                <Search className="h-4 w-4" />
                Buscar no ND7 <kbd className="ml-10 rounded bg-white px-1.5 text-[10px]">⌘ K</kbd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {impersonating && (
                <button
                  onClick={() => {
                    setImpersonating(false);
                    setView("admin");
                    say("Você voltou à Central Super Admin.");
                  }}
                  className="hidden rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 md:inline-flex"
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Voltar ao Super Admin
                </button>
              )}
              <ThemeToggle />
              <button
                onClick={() => {
                  setImpersonating(false);
                  setSignedInAsSuperAdmin(false);
                  setView("landing");
                  say("Você saiu da sua conta.");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Sair da conta"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <button onClick={() => setProfileDialogOpen(true)} className="profile-trigger flex items-center gap-3 rounded-xl p-1.5 text-left" aria-label="Alterar foto do perfil">
                <span className="profile-avatar flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {profilePhoto ? <img src={profilePhoto} alt="Foto de perfil" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : "DD"}
                </span>
                <span className="hidden text-left md:block">
                  <b className="block text-xs">Daniel Diniz</b>
                  <small className="text-slate-400">Administrador</small>
                </span>
              </button>
            </div>
          </header>
          <PanelContent
            view={view}
            company={activeCompany}
            accessRole={signedInAsSuperAdmin ? "super_admin" : "owner"}
            say={say}
            setView={setView}
            setActiveCompany={setActiveCompany}
            setImpersonating={setImpersonating}
            setSignedInAsSuperAdmin={setSignedInAsSuperAdmin}
          />
        </main>
      </div>
    </div>
  );
}
const PanelContent = memo(function PanelContent({
  view,
  company,
  accessRole,
  say,
  setView,
  setActiveCompany,
  setImpersonating,
  setSignedInAsSuperAdmin,
}: {
  view: View;
  company: string;
  accessRole: AccessRole;
  say: (message: string) => void;
  setView: (view: View) => void;
  setActiveCompany: (company: string) => void;
  setImpersonating: (impersonating: boolean) => void;
  setSignedInAsSuperAdmin: (signedIn: boolean) => void;
}) {
  const openCompany = useCallback(
    (nextCompany: string) => {
      setActiveCompany(nextCompany);
      setImpersonating(true);
      setView("crm");
      say("Visualizando a empresa como Super Admin.");
    },
    [say, setActiveCompany, setImpersonating, setView],
  );
  const openCheckout = useCallback(() => setView("checkout"), [setView]);
  const openAdmin = useCallback(() => setView("admin"), [setView]);

  if (view === "admin")
    return (
      <Admin
        open={openCompany}
        say={say}
        logout={() => {
          setSignedInAsSuperAdmin(false);
          setImpersonating(false);
          setView("landing");
          say("Você saiu do Super Admin com sucesso.");
        }}
      />
    );
  if (view === "subscription") return <MySubscription checkout={openCheckout} company={company} />;
  if (view === "finance") return <FinancialCenter company={company} say={say} />;
  if (view === "pipeline") return <SalesPipeline say={say} company={company} />;
  if (view === "whatsapp") return <WhatsAppConnection company={company} say={say} />;
  if (view === "messages") return <MessageManager company={company} say={say} />;
  if (view === "team")
    return <TeamManagement company={company} currentRole={accessRole} say={say} />;
  if (view === "settings") {
    return <CustomerSettings company={company} onCompanyUpdate={setActiveCompany} say={say} />;
  }
  if (view === "contacts" || view === "agenda") {
    return <WorkspaceScreen view={view} say={say} company={company} />;
  }
  return <Dashboard admin={openAdmin} say={say} company={company} />;
});

function Landing({ access, start }: { access: () => void; start: (plan?: string) => void }) {
  const wa =
    "https://wa.me/5585920109136?text=" +
    encodeURIComponent("Olá! Quero conhecer o ND7 e transformar a gestão da minha empresa.");
  return (
    <div className="landing-page overflow-hidden bg-[#ffffff] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-[#ffffff]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <b className="text-lg">ND7</b>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#recursos" className="hover:text-blue-600">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-blue-600">
              Como funciona
            </a>
            <a href="#resultado" className="hover:text-blue-600">
              Por que ND7
            </a>
            <a href="#planos" className="hover:text-blue-600">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={access}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
            >
              Acessar Painel <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <section className="relative pt-36">
        <div className="hero-orb left-[-12rem] top-16" />
        <div className="hero-orb hero-orb-two right-[-9rem] top-32" />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />O CRM que acompanha o ritmo do seu negócio
          </div>
          <h1 className="reveal delay-1 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Pare de perder oportunidades.{" "}
            <span className="gradient-text">Comece a crescer com controle.</span>
          </h1>
          <p className="reveal delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            O ND7 transforma contatos soltos, conversas esquecidas e processos confusos em uma
            operação comercial que sua equipe consegue acompanhar, repetir e acelerar.
          </p>
          <p className="reveal delay-2 mx-auto mt-4 max-w-2xl rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
            <CheckCircle2 className="mr-2 inline h-4 w-4 text-blue-600" />
            Escolha apenas a periodicidade. Em qualquer plano, você recebe{" "}
            <strong>acesso total ao ND7, sem recursos bloqueados e sem limitações.</strong>
          </p>
          <div className="reveal delay-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#planos"
              className="group rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-blue-300"
            >
              Ver planos e condições{" "}
              <ArrowRight className="ml-2 inline h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#planos"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              Quero organizar minha operação
            </a>
          </div>
          <p className="reveal delay-3 mt-4 text-xs text-slate-400">
            <Check className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
            Sem taxa de implantação · Cancele quando quiser
          </p>
          <div className="reveal delay-4 relative mx-auto mt-14 max-w-5xl rounded-t-[28px] border border-slate-200 bg-white p-2 shadow-[0_30px_90px_-30px_rgba(76,29,149,.38)]">
            <div className="rounded-t-2xl bg-[#111827] p-4 text-left">
              <div className="flex gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="col-span-1 rounded-xl bg-white/5 p-4 text-white">
                  <small className="text-blue-200">Vendas no mês</small>
                  <b className="mt-2 block text-xl">R$ 42.860</b>
                  <span className="text-xs text-emerald-300">↑ 18,4%</span>
                </div>
                <div className="col-span-2 rounded-xl bg-white/5 p-4">
                  <small className="text-slate-400">Pipeline de vendas</small>
                  <div className="mt-4 flex items-end gap-2">
                    {[30, 55, 43, 75, 61, 92, 80, 100].map((h, i) => (
                      <span
                        key={i}
                        className="chart-bar flex-1 rounded-t bg-blue-400"
                        style={{ height: `${h / 2}px`, animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-500 p-4 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <b className="mt-3 block">32,8%</b>
                  <small>conversão média</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-blue-100 bg-blue-50/70 px-5 py-5">
        <div className="mx-auto grid max-w-6xl gap-4 text-center sm:grid-cols-3 sm:text-left">
          {[
            ["Tudo no mesmo lugar", "Clientes, vendas, equipe e rotina comercial."],
            ["Acesso total", "Nenhum módulo bloqueado em qualquer plano."],
            ["Seu ritmo, sua escolha", "Mensal, trimestral, semestral ou anual."],
          ].map(([title, text]) => (
            <div key={title} className="flex items-center justify-center gap-3 sm:justify-start">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <p className="text-xs leading-5 text-slate-600">
                <b className="block text-sm text-slate-900">{title}</b>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="recursos" className="cv-auto mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Feito para evoluir
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Uma plataforma. Infinitas possibilidades.
          </h2>
          <p className="mt-4 text-slate-600">
            Adapte o ND7 à sua realidade, qualquer que seja seu nicho ou o tamanho da sua operação.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              <ContactRound />,
              "Clientes no centro",
              "Todo histórico, contexto e oportunidades para nunca mais perder uma conversa importante.",
            ],
            [
              <Workflow />,
              "Processos que fluem",
              "Organize funis, automações e tarefas do jeito que sua equipe trabalha.",
            ],
            [
              <MousePointerClick />,
              "Decisões mais claras",
              "Indicadores em tempo real para transformar esforço em resultados consistentes.",
            ],
          ].map(([icon, title, text], i) => (
            <article
              key={String(title)}
              className="lift-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                {icon as ReactNode}
              </span>
              <h3 className="mt-5 text-lg font-bold">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text as string}</p>
              <span className="mt-5 inline-block text-sm font-bold text-blue-600">
                Saiba mais <ArrowRight className="ml-1 inline h-4 w-4" />
              </span>
            </article>
          ))}
        </div>
      </section>
      <section id="como-funciona" className="cv-auto bg-[#071a3d] px-5 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
              Simples desde o primeiro dia
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Mais tempo para o que só você pode fazer.
            </h2>
            <p className="mt-5 leading-7 text-blue-100">
              O ND7 tira o peso da operação das suas costas para sua equipe se concentrar em gerar
              relacionamento e receita.
            </p>
            {[
              ["01", "Organize sua base"],
              ["02", "Conecte seu processo"],
              ["03", "Acelere seus resultados"],
            ].map((x) => (
              <div className="mt-6 flex items-center gap-4" key={x[0]}>
                <b className="text-sm text-blue-300">{x[0]}</b>
                <span className="h-px flex-1 bg-white/15" />
                <span className="font-semibold">{x[1]}</span>
                <CheckCircle2 className="h-5 w-5 text-blue-300" />
              </div>
            ))}
          </div>
          <div className="float-y rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-blue-200">Sua operação, em uma visão</p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-slate-800">
              <div className="flex items-center justify-between">
                <b>Meta mensal</b>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                  88% concluída
                </span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-400" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <small className="text-slate-400">Novos leads</small>
                  <b className="block text-xl">128</b>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <small className="text-slate-400">Em negociação</small>
                  <b className="block text-xl">24</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="resultado" className="cv-auto bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              O custo de continuar igual
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Sua equipe não precisa trabalhar mais. Precisa trabalhar com direção.
            </h2>
            <p className="mt-4 text-slate-600">
              Quando cada informação está em um lugar diferente, o time gasta energia procurando,
              perguntando e tentando lembrar. O ND7 muda essa rotina por uma visão compartilhada.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-rose-100 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-500">
                Sem processo centralizado
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                A operação vive apagando incêndios.
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  "Leads ficam sem retorno e oportunidades esfriam.",
                  "A equipe depende de planilhas, memória e mensagens dispersas.",
                  "Gestão descobre os gargalos tarde demais.",
                ].map((item) => (
                  <p key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                    {item}
                  </p>
                ))}
              </div>
            </article>
            <article className="rounded-3xl border border-blue-200 bg-[#071a3d] p-7 text-white shadow-xl shadow-blue-200">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Com ND7</p>
              <h3 className="mt-3 text-2xl font-bold">
                Cada oportunidade tem contexto e próximo passo.
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  "Funil visível para saber onde agir agora.",
                  "Histórico centralizado para a conversa continuar de onde parou.",
                  "Indicadores para conduzir decisões diárias com clareza.",
                ].map((item) => (
                  <p key={item} className="flex gap-3 text-sm leading-6 text-blue-100">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </div>
          <div className="mt-9 text-center">
            <a
              href="#planos"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
            >
              Quero ter essa visão da minha operação <ArrowRight className="ml-2 inline h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
      <section className="cv-auto mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Clareza que move o negócio
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Sua operação não precisa depender de planilhas, memória ou sorte.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Centralize o que aconteceu, o que está acontecendo e o que precisa acontecer em
              seguida. Assim, cada pessoa da equipe sabe exatamente qual é o próximo melhor passo.
            </p>
            <a
              href="#planos"
              className="mt-7 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
            >
              Ver oferta do ND7 <ArrowRight className="ml-2 inline h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Visão 360°", "Entenda cada cliente antes, durante e depois da venda."],
              [
                "Processos replicáveis",
                "Crie um padrão de excelência que toda a equipe consegue seguir.",
              ],
              ["Prioridades visíveis", "Transforme pendências em ações claras, no tempo certo."],
              [
                "Gestão sem ruído",
                "Acompanhe a operação sem precisar cobrar atualizações por mensagem.",
              ],
            ].map(([title, text], index) => (
              <article
                key={title}
                className={`lift-card rounded-2xl border border-slate-200 p-6 ${index === 0 ? "bg-blue-600 text-white" : "bg-white"}`}
              >
                <span
                  className={`text-3xl font-black ${index === 0 ? "text-blue-200" : "text-blue-200"}`}
                >
                  0{index + 1}
                </span>
                <h3 className="mt-6 font-bold">{title}</h3>
                <p
                  className={`mt-2 text-sm leading-6 ${index === 0 ? "text-blue-100" : "text-slate-600"}`}
                >
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cv-auto border-y border-slate-200 bg-white px-5 py-18">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Flexível por natureza
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Um CRM que se adapta ao seu modelo de negócio.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              Serviços, vendas consultivas, imobiliárias, clínicas, equipes comerciais ou operações
              internas: comece com o essencial e evolua no seu ritmo.
            </p>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "Vendas consultivas",
              "Serviços e agências",
              "Saúde e bem-estar",
              "Equipes B2B",
              "Imobiliárias",
              "Educação e cursos",
              "E-commerce",
              "Jurídico",
              "Financeiro",
              "Marketing",
              "Construção civil",
              "Franquias",
            ].map((item) => (
              <div
                key={item}
                className="group rounded-xl border border-slate-200 bg-[#ffffff] p-3.5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                  ND7
                </span>
                <p className="mt-3 text-xs font-bold leading-5">{item}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  Clientes, oportunidades e processos em um só lugar.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cv-auto mx-auto max-w-6xl px-5 py-24">
        <div className="rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-2xl shadow-blue-200 md:px-12 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Uma assinatura. A plataforma completa.
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Não escolha o que cortar. Escolha apenas por quanto tempo quer avançar.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-blue-100">
                No ND7, todos os planos entregam a mesma estrutura para a sua empresa vender,
                organizar e escalar. A periodicidade muda o valor mensal — nunca o seu acesso.
              </p>
              <a
                href="#planos"
                className="mt-7 inline-block rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-1 hover:shadow-xl"
              >
                Ver acesso completo e valores <ArrowRight className="ml-2 inline h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "CRM de contatos e negócios",
                "Funis de venda em kanban, lista e grade",
                "Automação e mensagens para contatos",
                "Equipe, permissões e indicadores",
                "Agenda e gestão de tarefas",
                "Histórico de assinatura e suporte",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-bold leading-5">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        id="planos"
        className="cv-auto relative overflow-hidden bg-[#071a3d] px-4 py-20 sm:px-6 lg:px-8 text-white"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[140px]" />
        <div className="pointer-events-none absolute -left-28 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> OFERTA ESPECIAL ND7
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Escolha o prazo. <span className="text-blue-300">Leve o ND7 inteiro.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Acesso 100% completo e sem limitações em qualquer plano. Você só escolhe a periodicidade ideal para o caixa da sua empresa.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {[
              {
                id: "Mensal",
                name: "Plano Mensal",
                badge: "Flexibilidade",
                badgeStyle: "bg-slate-800 text-slate-300 border-slate-700/80",
                description: "Ideal para começar sem compromisso a longo prazo.",
                anchorPrice: null,
                priceInt: "129",
                priceDec: ",90",
                billingText: "Cobrança mensal recorrente",
                savingsText: "Sem contrato de fidelidade",
                highlight: false,
                ctaLabel: "Começar Mensal",
                ctaClass: "bg-white/10 hover:bg-white/20 text-white border border-white/15",
                features: [
                  "Acesso integral ao ND7",
                  "Contatos e negócios ilimitados",
                  "Funis em kanban, grade e lista",
                  "Automações e mensagens",
                  "Equipe, permissões e métricas",
                  "Agenda e gestão de tarefas",
                  "Cancele quando quiser",
                ],
              },
              {
                id: "Trimestral",
                name: "Plano Trimestral",
                badge: "Economize 8%",
                badgeStyle: "bg-cyan-950/90 text-cyan-300 border-cyan-700/60",
                description: "Tempo ideal para validar e consolidar o funil comercial.",
                anchorPrice: "R$ 129,90",
                priceInt: "119",
                priceDec: ",90",
                billingText: "R$ 359,70 a cada 3 meses",
                savingsText: "Economia de R$ 30,00 no trimestre",
                highlight: false,
                ctaLabel: "Assinar Trimestral",
                ctaClass: "bg-blue-600/90 hover:bg-blue-600 text-white shadow-lg shadow-blue-600/25",
                features: [
                  "Acesso integral ao ND7",
                  "Contatos e negócios ilimitados",
                  "Funis em kanban, grade e lista",
                  "Automações e mensagens",
                  "Equipe, permissões e métricas",
                  "Agenda e gestão de tarefas",
                  "Sem taxa de implantação",
                ],
              },
              {
                id: "Semestral",
                name: "Plano Semestral",
                badge: "✦ 15% de Desconto",
                badgeStyle: "bg-indigo-950/90 text-indigo-300 border-indigo-700/60",
                description: "Ritmo contínuo e previsibilidade para sua equipe vender mais.",
                anchorPrice: "R$ 129,90",
                priceInt: "109",
                priceDec: ",90",
                billingText: "R$ 659,40 a cada 6 meses",
                savingsText: "Economia de R$ 120,00 no semestre",
                highlight: false,
                ctaLabel: "Assinar Semestral",
                ctaClass: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30",
                features: [
                  "Acesso integral ao ND7",
                  "Contatos e negócios ilimitados",
                  "Funis em kanban, grade e lista",
                  "Automações e mensagens",
                  "Equipe, permissões e métricas",
                  "Agenda e gestão de tarefas",
                  "Suporte técnico ágil",
                ],
              },
              {
                id: "Anual",
                name: "Plano Anual",
                badge: "🔥 Mais Vendido · 23% OFF",
                badgeStyle: "bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white border-transparent shadow-md shadow-rose-950/40",
                topRibbon: "✦ MELHOR ESCOLHA · MAIOR ECONOMIA",
                description: "Máxima economia e estabilidade. O menor custo mensal do ND7.",
                anchorPrice: "R$ 129,90",
                priceInt: "99",
                priceDec: ",90",
                billingText: "R$ 1.198,80 faturado anualmente",
                savingsText: "Economia total de R$ 360,00 no ano",
                highlight: true,
                ctaLabel: "Garantir Plano Anual 🔥",
                ctaClass: "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black shadow-xl shadow-blue-500/40 hover:scale-[1.02]",
                features: [
                  "Acesso integral ao ND7",
                  "Contatos e negócios ilimitados",
                  "Funis em kanban, grade e lista",
                  "Automações e mensagens",
                  "Equipe, permissões e métricas",
                  "Agenda e gestão de tarefas",
                  "Suporte VIP prioritário",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 ${
                  plan.highlight
                    ? "border-2 border-cyan-400 bg-gradient-to-b from-[#0e1d3e] to-[#09132b] shadow-[0_0_40px_rgba(6,182,212,0.22)] ring-1 ring-cyan-400/40 lg:-translate-y-3"
                    : "border border-white/10 bg-[#0c162e]/90 hover:border-blue-400/30 hover:bg-[#0e1a38] shadow-xl shadow-black/20"
                }`}
              >
                {plan.topRibbon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-rose-950/50">
                    {plan.topRibbon}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${plan.badgeStyle}`}
                    >
                      {plan.badge}
                    </span>
                    {plan.highlight && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                        <Zap className="h-3 w-3 fill-cyan-300 text-cyan-300" /> TOP
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 text-xl font-black text-white tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 text-center">
                    {plan.anchorPrice ? (
                      <p className="text-[11px] font-medium text-slate-400 line-through">
                        De {plan.anchorPrice}/mês
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-400">
                        A partir de
                      </p>
                    )}
                    <div className="mt-0.5 flex items-baseline justify-center gap-1">
                      <span className="text-lg font-black text-blue-400">R$</span>
                      <strong className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                        {plan.priceInt}
                      </strong>
                      <span className="text-lg font-black text-blue-400">{plan.priceDec}</span>
                      <span className="text-xs font-semibold text-slate-400">/mês</span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      {plan.billingText}
                    </p>

                    <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>{plan.savingsText}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => start(plan.id)}
                    className={`group mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all duration-200 ${plan.ctaClass}`}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </button>

                  <div className="my-5 h-px bg-white/10" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Incluso no plano:
                    </p>
                    <ul className="space-y-2 text-xs text-slate-200">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/[0.06] text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Liberação Imediata
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center sm:flex sm:items-center sm:justify-around sm:text-left backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 py-1.5 sm:py-0">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Pagamento Protegido via Asaas</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 py-1.5 sm:py-0">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Acesso Completo sem Recursos Bloqueados</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 py-1.5 sm:py-0">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Cancele a qualquer momento sem burocracia</span>
            </div>
          </div>
        </div>
      </section>
      <section className="cv-auto border-t border-slate-200 bg-[#f8fbff] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Resultados que falam
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Quem organiza a operação, cresce com mais controle.
            </h2>
            <p className="mt-4 text-slate-600">
              Cinco histórias de empresas que trocaram dispersão por uma operação comercial clara.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [
                "Mariana Costa",
                "Vértice Consultoria",
                "‘O ND7 nos deu visão e ritmo. Agora cada oportunidade tem próximo passo.’",
                "MC",
              ],
              [
                "Rafael Nunes",
                "Nexo Comercial",
                "‘O funil deixou de ser uma reunião e virou nosso jeito de trabalhar.’",
                "RN",
              ],
              [
                "Ana Silva",
                "Clínica Essenza",
                "‘Conseguimos atender melhor sem perder a proximidade com os pacientes.’",
                "AS",
              ],
              [
                "Pedro Lima",
                "Mosaico Studio",
                "‘Mais previsibilidade para vender e mais tranquilidade para entregar.’",
                "PL",
              ],
              [
                "Luiza Rocha",
                "Lumen Partners",
                "‘Tudo está no lugar certo. A equipe ganhou autonomia rapidamente.’",
                "LR",
              ],
            ].map(([name, company, quote, initials]) => (
              <article
                key={String(name)}
                className="lift-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">
                    {initials}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{name}</p>
                    <p className="text-[10px] text-slate-500">{company}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-600">{quote}</p>
                <div className="mt-4 text-[10px] font-bold tracking-wider text-amber-500">
                  ★★★★★
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cv-auto bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Perguntas frequentes
            </p>
            <h2 className="mt-3 text-3xl font-bold">Tudo claro antes de começar.</h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              [
                "O ND7 serve para o meu nicho?",
                "Sim. O ND7 foi pensado como uma base flexível de relacionamento e vendas, adaptável a diferentes processos e segmentos.",
              ],
              [
                "Posso escolher a periodicidade da assinatura?",
                "Sim. A contratação está disponível nas modalidades mensal, trimestral, semestral e anual.",
              ],
              [
                "Como funciona a criação de acesso?",
                "Após a aprovação do pagamento, o sistema cria o acesso da empresa e envia as instruções de entrada por e-mail.",
              ],
              [
                "Minha equipe poderá usar o sistema?",
                "Sim. O plano inclui gestão de equipe e permissões para que cada pessoa tenha o nível de acesso adequado.",
              ],
              [
                "Existe teste gratuito?",
                "Não. O ND7 é contratado por assinatura e o acesso é liberado após a confirmação do pagamento. Você começa com a plataforma completa desde o primeiro dia.",
              ],
              [
                "Algum plano possui recursos bloqueados?",
                "Não. Todas as periodicidades dão acesso total aos recursos do ND7. A diferença entre elas é somente o valor mensal equivalente e a frequência de cobrança.",
              ],
              [
                "Posso mudar minha periodicidade depois?",
                "Você acompanha a assinatura pelo painel e pode solicitar a adequação da periodicidade de acordo com a necessidade da sua operação.",
              ],
            ].map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-slate-200 bg-white p-5"
              >
                <summary className="cursor-pointer list-none font-bold">
                  {question}
                  <Plus className="float-right h-5 w-5 text-blue-600 transition group-open:rotate-45" />
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="cv-auto bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <Sparkles className="mx-auto h-7 w-7 text-blue-200" />
          <h2 className="mt-5 text-3xl font-bold md:text-4xl">
            Seu próximo crescimento começa com uma operação mais clara.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Dê à sua equipe uma plataforma à altura da ambição da sua empresa.
          </p>
          <a
            href="#planos"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:-translate-y-1 hover:shadow-xl"
          >
            Conhecer a oferta do ND7 <ArrowRight className="ml-2 inline h-4 w-4" />
          </a>
        </div>
      </section>
      <footer className="border-t border-slate-200 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Logo />
            <b className="text-slate-800">ND7</b>
          </div>
          <p>© 2026 ND7. Relacionamentos que crescem.</p>
        </div>
      </footer>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com o ND7 no WhatsApp"
        className="whatsapp-float fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-300 transition hover:scale-110"
      >
        <svg viewBox="0 0 448 512" aria-hidden="true" className="h-7 w-7 fill-current">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 438.7c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.5-186.6 184.5zm101.9-138c-5.6-2.8-33.1-16.3-38.2-18.1-5.1-1.9-8.8-2.8-12.5 2.8s-14.4 18.1-17.6 21.8c-3.2 3.7-6.5 4.2-12.1 1.4-33.2-16.6-55-29.6-76.9-67.1-5.8-10 5.8-9.3 16.6-31 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.1 31.5 11.6 13.2 4.2 25.2 3.6 34.7 2.2 10.6-1.6 33.1-13.5 37.8-26.5 4.6-13 4.6-24.1 3.2-26.5-1.3-2.6-5-4-10.6-6.7z" />
        </svg>
      </a>
    </div>
  );
}

function Sidebar({
  view,
  setView,
  menu,
  setMenu,
  impersonating,
  returnToAdmin,
  logout,
}: {
  view: View;
  setView: (v: View) => void;
  menu: boolean;
  setMenu: (b: boolean) => void;
  impersonating: boolean;
  returnToAdmin: () => void;
  logout: () => void;
}) {
  return (
    <aside
      className={`app-sidebar drawer-panel fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#111827] p-4 text-slate-300 shadow-2xl shadow-slate-950/40 ${menu ? "drawer-panel-open" : ""}`}
    >
      <div className="flex items-center gap-3 px-2">
        <Logo />
        <div>
          <b className="text-white">ND7</b>
          <small className="block text-[9px] uppercase tracking-[.18em] text-blue-300">
            CRM inteligente
          </small>
        </div>
        <button
          className="ml-auto rounded-lg p-2 transition hover:bg-white/10"
          onClick={() => setMenu(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {impersonating && (
        <button
          onClick={returnToAdmin}
          className="mt-6 flex w-full items-center gap-3 rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-3 text-left text-sm font-bold text-blue-100 transition hover:bg-blue-500/25"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>
            Voltar ao Super Admin
            <small className="mt-0.5 block text-[10px] font-normal text-blue-200">
              Sair da visualização desta empresa
            </small>
          </span>
        </button>
      )}
      <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Visão geral
      </p>
      <Nav
        icon={<LayoutDashboard />}
        label="Painel"
        active={view === "crm"}
        action={() => {
          setView("crm");
          setMenu(false);
        }}
      />
      <Nav
        icon={<ContactRound />}
        label="Contatos"
        active={view === "contacts"}
        action={() => {
          setView("contacts");
          setMenu(false);
        }}
      />
      <Nav
        icon={<ClipboardList />}
        label="Funil de Vendas"
        active={view === "pipeline"}
        action={() => {
          setView("pipeline");
          setMenu(false);
        }}
      />
      <Nav
        icon={<CalendarDays />}
        label="Agenda"
        active={view === "agenda"}
        action={() => {
          setView("agenda");
          setMenu(false);
        }}
      />
      <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Comunicação
      </p>
      <Nav
        icon={<MessageSquareText />}
        label="WhatsApp"
        active={view === "whatsapp"}
        action={() => {
          setView("whatsapp");
          setMenu(false);
        }}
      />
      <Nav
        icon={<Send />}
        label="Mensagens"
        active={view === "messages"}
        action={() => {
          setView("messages");
          setMenu(false);
        }}
      />
      <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Gerenciar
      </p>
      <Nav
        icon={<UsersRound />}
        label="Equipe"
        active={view === "team"}
        action={() => {
          setView("team");
          setMenu(false);
        }}
      />
      <Nav
        icon={<CircleDollarSign />}
        label="Financeiro"
        active={view === "finance"}
        action={() => {
          setView("finance");
          setMenu(false);
        }}
      />
      <Nav
        icon={<CreditCard />}
        label="Minha Assinatura"
        active={view === "subscription"}
        action={() => {
          setView("subscription");
          setMenu(false);
        }}
      />
      <Nav
        icon={<Settings />}
        label="Configurações"
        active={view === "settings"}
        action={() => {
          setView("settings");
          setMenu(false);
        }}
      />
      <div className="mt-auto border-t border-white/10 pt-3">
        <button
          onClick={logout}
          data-variant="logout"
          className="nav-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
function Nav({
  icon,
  label,
  active,
  action,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  action?: () => void;
}) {
  return (
    <button
      onClick={action}
      data-active={active ? "true" : "false"}
      className={`nav-item mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue-600 text-white" : "hover:bg-white/5 hover:text-white"}`}
    >
      <span className="h-4 w-4">{icon}</span>
      {label}
    </button>
  );
}
function SalesPipeline({ say, company }: { say: (message: string) => void; company: string }) {
  const stages = [
    "Novo lead",
    "Contato inicial",
    "Diagnóstico",
    "Proposta enviada",
    "Negociação",
    "Fechado",
  ];
  const stageGuidance: Record<string, string> = {
    "Novo lead": "Ainda não abordado",
    "Contato inicial": "Conecte e valide interesse",
    Diagnóstico: "Entenda cenário e necessidade",
    "Proposta enviada": "Apresente a solução ideal",
    Negociação: "Alinhe condições e decisão",
    Fechado: "Prepare o próximo passo",
  };
  const stageTone: Record<string, string> = {
    "Novo lead": "bg-sky-500",
    "Contato inicial": "bg-violet-500",
    Diagnóstico: "bg-amber-500",
    "Proposta enviada": "bg-blue-600",
    Negociação: "bg-fuchsia-500",
    Fechado: "bg-emerald-500",
  };
  const [layout, setLayout] = useState<"kanban" | "grid" | "list">("kanban");
  const [dragged, setDragged] = useState<string | null>(null);
  const [deals, setDeals] = useState([
    {
      id: "1",
      title: "Plano corporativo",
      company: "Almeida & Costa",
      value: "R$ 18.500",
      stage: "Novo lead",
      owner: "MA",
    },
    {
      id: "2",
      title: "Consultoria comercial",
      company: "Núcleo Engenharia",
      value: "R$ 8.200",
      stage: "Contato inicial",
      owner: "RN",
    },
    {
      id: "3",
      title: "Diagnóstico de operação",
      company: "Lumen Partners",
      value: "R$ 14.400",
      stage: "Diagnóstico",
      owner: "LB",
    },
    {
      id: "4",
      title: "Expansão de unidades",
      company: "Clínica Horizonte",
      value: "R$ 24.000",
      stage: "Proposta enviada",
      owner: "AC",
    },
    {
      id: "5",
      title: "Renovação anual",
      company: "Studio Mosaico",
      value: "R$ 12.600",
      stage: "Negociação",
      owner: "PL",
    },
    {
      id: "6",
      title: "Pacote de implantação",
      company: "Vértice Soluções",
      value: "R$ 9.800",
      stage: "Fechado",
      owner: "VS",
    },
  ]);
  const move = (id: string, target: string) => {
    setDeals((all) => all.map((deal) => (deal.id === id ? { ...deal, stage: target } : deal)));
    say(`Negócio movido para ${target}.`);
  };
  const moveBy = (deal: (typeof deals)[number], direction: -1 | 1) => {
    const currentIndex = stages.indexOf(deal.stage);
    const target = stages[currentIndex + direction];
    if (target) move(deal.id, target);
  };
  const stageControls = (deal: (typeof deals)[number]) => {
    const currentIndex = stages.indexOf(deal.stage);
    return (
      <span className="ml-2 inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 shadow-sm">
        <button
          type="button"
          aria-label={`Mover ${deal.title} para o estágio anterior`}
          title="Estágio anterior"
          disabled={currentIndex === 0}
          onClick={() => moveBy(deal, -1)}
          className="rounded-md p-1 text-slate-500 dark:text-slate-400 transition hover:bg-white dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Mover ${deal.title} para o próximo estágio`}
          title="Próximo estágio"
          disabled={currentIndex === stages.length - 1}
          onClick={() => moveBy(deal, 1)}
          className="rounded-md p-1 text-slate-500 dark:text-slate-400 transition hover:bg-white dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  };
  const card = (deal: (typeof deals)[number], compact = false) => (
    <article
      draggable
      onDragStart={() => setDragged(deal.id)}
      className={`cursor-grab rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md active:cursor-grabbing ${compact ? "flex items-center justify-between gap-4" : ""}`}
      key={deal.id}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">{deal.title}</p>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{deal.company}</p>
      </div>
      <div
        className={compact ? "flex items-center gap-4" : "mt-4 flex items-center justify-between"}
      >
        <b className="text-sm font-bold text-slate-700 dark:text-slate-200">{deal.value}</b>
        <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40">
          {deal.owner}
        </span>
        {!compact && stageControls(deal)}
      </div>
    </article>
  );
  return (
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendas e oportunidades</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Funil de Vendas</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {company} · Acompanhe cada oportunidade ao longo da jornada do cliente.
          </p>
        </div>
        <button
          onClick={() => say("Novo negócio criado.")}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:bg-blue-700"
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Novo negócio
        </button>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 shadow-sm">
        <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {[
            ["kanban", <LayoutDashboard className="h-4 w-4" />, "Kanban"],
            ["grid", <LayoutGrid className="h-4 w-4" />, "Grade"],
            ["list", <List className="h-4 w-4" />, "Lista"],
          ].map(([id, icon, label]) => (
            <button
              key={String(id)}
              onClick={() => setLayout(id as typeof layout)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${layout === id ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
            >
              {icon as ReactNode}
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Arraste os cards ou use as setas para avançar e recuar uma oportunidade.
        </p>
      </div>
      {layout === "kanban" ? (
        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[1320px] grid-cols-6 gap-4">
            {stages.map((stage) => (
              <section
                key={stage}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragged) move(dragged, stage);
                  setDragged(null);
                }}
                className="min-h-[390px] rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-950/60 p-3"
              >
                <div className="mb-4 flex items-start justify-between gap-2 px-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${stageTone[stage]}`} />
                      <b className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</b>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                      {stageGuidance[stage]}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white dark:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-300 shadow-sm border border-transparent dark:border-slate-700">
                    {deals.filter((d) => d.stage === stage).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {deals.filter((d) => d.stage === stage).map((d) => card(d))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : layout === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <div key={deal.id} className="relative">
              {card(deal)}
              <span className="absolute right-4 top-4 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-300">
                {deal.stage}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="min-w-[800px] space-y-2">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:bg-blue-50 dark:hover:bg-slate-800/60"
              >
                <div>
                  <b className="text-sm font-bold text-slate-900 dark:text-white">{deal.title}</b>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{deal.company}</p>
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{deal.value}</span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/70 px-2 py-1 text-center text-xs font-bold text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40">
                  {deal.stage}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Responsável: {deal.owner}</span>
                {stageControls(deal)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function WorkspaceScreen({
  view,
  say,
  company,
}: {
  view: "contacts" | "agenda";
  say: (message: string) => void;
  company: string;
}) {
  const content = {
    contacts: [
      "Contatos",
      "Centralize clientes, leads e todo o histórico de relacionamento.",
      "Novo contato",
      ContactRound,
    ],
    agenda: [
      "Agenda",
      "Organize compromissos, retornos e próximas ações da equipe.",
      "Novo compromisso",
      CalendarDays,
    ],
  } as const;
  const [title, description, action, Icon] = content[view];
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 shadow-sm">
        <span className="inline-flex rounded-2xl bg-blue-100 dark:bg-blue-950/80 dark:border dark:border-blue-800/40 p-4 text-blue-700 dark:text-blue-300">
          <Icon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-bold text-blue-700 dark:text-blue-400">{company}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-300">{description}</p>
        <button
          onClick={() => say(`${action} aberto.`)}
          className="mt-7 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
        >
          {action}
        </button>
      </div>
    </div>
  );
}
function TeamManagement({
  company,
  currentRole,
  say,
}: {
  company: string;
  currentRole: AccessRole;
  say: (message: string) => void;
}) {
  type Member = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    role?: AccessRole;
    status: "Ativo" | "Inativo";
  };
  const defaultMembers = (business: string): Member[] => [
    {
      id: "owner",
      name: "Responsável pela empresa",
      email: `${business.toLowerCase().replace(/\s/g, ".")}@empresa.com`,
      jobTitle: "Responsável pela operação",
      department: "Direção",
      role: "owner",
      status: "Ativo",
    },
    {
      id: "operator-1",
      name: "Ana Martins",
      email: "ana@empresa.com",
      jobTitle: "Executiva comercial",
      department: "Comercial",
      role: "operator",
      status: "Ativo",
    },
    {
      id: "operator-2",
      name: "Carlos Lima",
      email: "carlos@empresa.com",
      jobTitle: "Analista de relacionamento",
      department: "Atendimento",
      role: "operator",
      status: "Ativo",
    },
  ];
  const roleLabel: Record<AccessRole, string> = {
    super_admin: "Super Admin",
    owner: "Dono",
    operator: "Operador",
  };
  const roleStyle: Record<AccessRole, string> = {
    super_admin: "bg-violet-100 text-violet-700",
    owner: "bg-amber-100 text-amber-800",
    operator: "bg-blue-100 text-blue-700",
  };
  const [members, setMembers] = useState<Member[]>(() => defaultMembers(company));
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const canCreate = currentRole !== "operator";
  const allowedRoles: AccessRole[] =
    currentRole === "super_admin" ? ["owner", "operator"] : ["operator"];
  useEffect(() => {
    const saved = window.localStorage.getItem(`nd7:team:${company}`);
    setMembers(saved ? (JSON.parse(saved) as Member[]) : defaultMembers(company));
    setShowForm(false);
    setName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setDepartment("");
  }, [company, currentRole]);
  const persist = (next: Member[]) => {
    setMembers(next);
    window.localStorage.setItem(`nd7:team:${company}`, JSON.stringify(next));
  };
  const invite = () => {
    if (!name.trim() || !email.trim()) {
      say("Informe nome e e-mail para criar o acesso.");
      return;
    }
    persist([
      ...members,
      {
        id: `${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        department,
        status: "Ativo",
      },
    ]);
    setName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setDepartment("");
    setShowForm(false);
    say("Colaborador criado. Defina o nível de acesso na lista.");
  };
  const canManage = (member: Member) =>
    currentRole !== "operator" && (currentRole === "super_admin" || member.role !== "owner");
  const changeRole = (member: Member, role: AccessRole) => {
    if (!canManage(member) || !allowedRoles.includes(role)) {
      say("Seu nível de acesso não permite atribuir este perfil.");
      return;
    }
    persist(members.map((item) => (item.id === member.id ? { ...item, role } : item)));
    say(`${member.name} agora tem acesso de ${roleLabel[role]}.`);
  };
  const changeStatus = (member: Member) => {
    if (!canManage(member)) return;
    const status = member.status === "Ativo" ? "Inativo" : "Ativo";
    persist(members.map((item) => (item.id === member.id ? { ...item, status } : item)));
    say(`Acesso de ${member.name} ${status === "Ativo" ? "ativado" : "inativado"}.`);
  };
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{company} · Gestão de acessos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Equipe e permissões</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Convide as pessoas certas com o nível de acesso adequado.
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setShowForm((open) => !open)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Plus className="mr-1 inline h-4 w-4" /> Criar acesso
          </button>
        ) : (
          <span className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            Operadores não podem criar acessos
          </span>
        )}
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        {[
          ["Dono", "Responsável pela assinatura e pela criação de operadores.", "owner"],
          ["Operador", "Usa os módulos da empresa no dia a dia, sem criar acessos.", "operator"],
        ].map(([title, description, role]) => (
          <article
            key={title}
            className={`rounded-2xl border p-4 ${role === "super_admin" ? "border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/40" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90"}`}
          >
            <span
              className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${roleStyle[role as AccessRole]}`}
            >
              {title}
            </span>
            <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">{description}</p>
          </article>
        ))}
      </div>
      {showForm && canCreate && (
        <section className="mt-6 rounded-3xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-slate-900/95 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Criar novo acesso</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Cadastre os dados do colaborador. O nível de acesso é definido na lista depois da criação.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Nome completo
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              E-mail corporativo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              WhatsApp
              <input
                value={phone}
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Cargo ou função
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Departamento
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="">Selecionar departamento</option>
                <option>Comercial</option>
                <option>Atendimento</option>
                <option>Financeiro</option>
                <option>Operações</option>
                <option>Marketing</option>
                <option>Direção</option>
              </select>
            </label>
            <button
              onClick={invite}
              className="self-end rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20 xl:col-start-3"
            >
              Criar colaborador
            </button>
          </div>
        </section>
      )}
      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Pessoas com acesso</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {members.filter((member) => member.status === "Ativo").length} acessos ativos
            </p>
          </div>
          <UsersRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300">
                {member.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-[190px] flex-1">
                <b className="block text-sm text-slate-900 dark:text-white">{member.name}</b>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {member.email}
                  {member.jobTitle ? ` · ${member.jobTitle}` : ""}
                  {member.department ? ` · ${member.department}` : ""}
                </span>
              </div>
              {canManage(member) ? (
                <label className="min-w-[150px] text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Nível de acesso
                  <select
                    value={member.role ?? ""}
                    onChange={(event) => changeRole(member, event.target.value as AccessRole)}
                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs font-bold normal-case tracking-normal text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Definir acesso</option>
                    {allowedRoles.map((role) => (
                      <option key={role} value={role}>{roleLabel[role]}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleStyle[member.role!]}`}>
                  {roleLabel[member.role!]}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === "Ativo" ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
              >
                {member.status}
              </span>
              {canManage(member) ? (
                <button
                  onClick={() => changeStatus(member)}
                  className="ml-auto rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {member.status === "Ativo" ? "Inativar" : "Ativar"}
                </button>
              ) : (
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">Gerenciado pelo Super Admin</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function CustomerSettings({
  company,
  onCompanyUpdate,
  say,
}: {
  company: string;
  onCompanyUpdate: (company: string) => void;
  say: (message: string) => void;
}) {
  const defaults = (name: string) => ({
    companyName: name,
    legalName: name,
    document: "",
    email: "",
    phone: "",
    segment: "Serviços",
    city: "",
    state: "",
    defaultStage: "Novo lead",
    currency: "BRL (R$)",
    timezone: "America/Fortaleza",
    weekStart: "Segunda-feira",
    automaticTasks: true,
    dealReminders: true,
    newLead: true,
    dailySummary: true,
    paymentAlerts: true,
    whatsappAlerts: false,
    twoFactor: false,
  });
  type SettingsData = ReturnType<typeof defaults>;
  const [tab, setTab] = useState<"empresa" | "processo" | "notificacoes" | "seguranca">("empresa");
  const [form, setForm] = useState<SettingsData>(() => defaults(company));
  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40";
  useEffect(() => {
    const saved = window.localStorage.getItem(`nd7:settings:${company}`);
    setForm(
      saved
        ? { ...defaults(company), ...(JSON.parse(saved) as Partial<SettingsData>) }
        : defaults(company),
    );
  }, [company]);
  const save = () => {
    const nextCompany = form.companyName.trim() || company;
    const data = { ...form, companyName: nextCompany };
    window.localStorage.setItem(`nd7:settings:${company}`, JSON.stringify(data));
    window.localStorage.setItem(`nd7:settings:${nextCompany}`, JSON.stringify(data));
    onCompanyUpdate(nextCompany);
    say("Configurações salvas com sucesso.");
  };
  const toggle = (key: keyof SettingsData) =>
    setForm((current) => ({ ...current, [key]: !current[key] }));
  const Toggle = ({
    label,
    description,
    value,
    setting,
  }: {
    label: string;
    description: string;
    value: boolean;
    setting: keyof SettingsData;
  }) => (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 transition hover:border-blue-200 dark:hover:border-blue-800">
      <span>
        <b className="block text-sm text-slate-800 dark:text-slate-100">{label}</b>
        <small className="mt-1 block max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </small>
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={() => toggle(setting)}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 transition peer-checked:bg-blue-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" />
    </label>
  );
  const tabs = [
    ["empresa", "Empresa", Building2],
    ["processo", "Processos", Workflow],
    ["notificacoes", "Notificações", MessageSquareText],
    ["seguranca", "Segurança", LockKeyhole],
  ] as const;
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Administração da empresa</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajuste como o ND7 trabalha para a sua operação.
          </p>
        </div>
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <Check className="mr-1 inline h-4 w-4" /> Salvar alterações
        </button>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2 shadow-sm lg:flex-col lg:overflow-visible">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${tab === id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
          <div className="hidden border-t border-slate-100 dark:border-slate-800 px-3 pt-5 text-xs leading-5 text-slate-500 dark:text-slate-400 lg:block">
            As alterações ficam salvas neste dispositivo nesta versão demonstrativa.
          </div>
        </nav>
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm md:p-8">
          {tab === "empresa" && (
            <>
              <span className="inline-flex rounded-2xl bg-blue-100 dark:bg-blue-950/80 p-3 text-blue-700 dark:text-blue-300">
                <Building2 className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Dados da empresa</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Essas informações identificam sua empresa dentro do ND7.
              </p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {[
                  ["Nome exibido", "companyName"],
                  ["Razão social", "legalName"],
                  ["CPF ou CNPJ", "document"],
                  ["E-mail administrativo", "email"],
                  ["Telefone ou WhatsApp", "phone"],
                  ["Segmento de atuação", "segment"],
                  ["Cidade", "city"],
                  ["Estado", "state"],
                ].map(([label, key]) => (
                  <label key={key} className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {label}
                    <input
                      value={form[key as keyof SettingsData] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [key as string]: event.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>
            </>
          )}
          {tab === "processo" && (
            <>
              <span className="inline-flex rounded-2xl bg-violet-100 dark:bg-violet-950/80 p-3 text-violet-700 dark:text-violet-300">
                <Workflow className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Processo comercial</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Defina preferências que orientam a rotina da sua equipe.
              </p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Etapa padrão para novos negócios
                  <select
                    value={form.defaultStage}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, defaultStage: event.target.value }))
                    }
                    className={fieldClass}
                  >
                    {["Novo lead", "Contato inicial", "Diagnóstico"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Moeda padrão
                  <select
                    value={form.currency}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, currency: event.target.value }))
                    }
                    className={fieldClass}
                  >
                    <option>BRL (R$)</option>
                    <option>USD (US$)</option>
                    <option>EUR (€)</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Fuso horário
                  <select
                    value={form.timezone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, timezone: event.target.value }))
                    }
                    className={fieldClass}
                  >
                    <option>America/Fortaleza</option>
                    <option>America/Sao_Paulo</option>
                    <option>America/Manaus</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Início da semana
                  <select
                    value={form.weekStart}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, weekStart: event.target.value }))
                    }
                    className={fieldClass}
                  >
                    <option>Segunda-feira</option>
                    <option>Domingo</option>
                  </select>
                </label>
              </div>
              <div className="mt-7 space-y-3">
                <Toggle
                  label="Criar tarefas de acompanhamento"
                  description="Gera uma tarefa de retorno ao criar um novo negócio."
                  value={form.automaticTasks}
                  setting="automaticTasks"
                />
                <Toggle
                  label="Lembrar negócios sem avanço"
                  description="Sinaliza oportunidades que ficaram paradas na mesma etapa."
                  value={form.dealReminders}
                  setting="dealReminders"
                />
              </div>
            </>
          )}
          {tab === "notificacoes" && (
            <>
              <span className="inline-flex rounded-2xl bg-amber-100 dark:bg-amber-950/80 p-3 text-amber-700 dark:text-amber-300">
                <MessageSquareText className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Notificações e alertas</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Escolha quais eventos merecem a atenção da sua equipe.
              </p>
              <div className="mt-7 space-y-3">
                <Toggle
                  label="Novos leads"
                  description="Avise quando uma nova oportunidade entrar no funil."
                  value={form.newLead}
                  setting="newLead"
                />
                <Toggle
                  label="Resumo diário"
                  description="Receba um panorama das atividades e negociações do dia."
                  value={form.dailySummary}
                  setting="dailySummary"
                />
                <Toggle
                  label="Assinatura e pagamentos"
                  description="Receba alertas sobre status, vencimentos e atualizações da assinatura."
                  value={form.paymentAlerts}
                  setting="paymentAlerts"
                />
                <Toggle
                  label="Alertas por WhatsApp"
                  description="Habilite avisos para eventos importantes no canal conectado."
                  value={form.whatsappAlerts}
                  setting="whatsappAlerts"
                />
              </div>
            </>
          )}
          {tab === "seguranca" && (
            <>
              <span className="inline-flex rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 p-3 text-emerald-700 dark:text-emerald-300">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Segurança da conta</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Mantenha o acesso à empresa sob controle.
              </p>
              <div className="mt-7 space-y-3">
                <Toggle
                  label="Verificação em duas etapas"
                  description="Solicite uma camada extra de confirmação para novos acessos."
                  value={form.twoFactor}
                  setting="twoFactor"
                />
              </div>
              <div className="mt-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <b className="text-sm text-slate-900 dark:text-white">Sessão atual</b>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Este dispositivo · acesso atual</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">
                    Ativa
                  </span>
                </div>
              </div>
              <button
                onClick={() => say("As demais sessões foram encerradas nesta demonstração.")}
                className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Encerrar outras sessões
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
function WhatsAppConnection({ company, say }: { company: string; say: (message: string) => void }) {
  const [connecting, setConnecting] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/evolution/connect", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { base64?: string };
        if (data?.base64) {
          setQrCodeImage(data.base64);
        }
      }
    } catch (e) {
      console.warn("Evolution connect notice:", e);
    } finally {
      setConnecting(false);
      setQrReady(true);
      say("QR Code disponível. Leia-o no WhatsApp para concluir a conexão.");
    }
  };

  const confirmRead = () => {
    setQrReady(false);
    setConnected(true);
    say("Canal WhatsApp conectado.");
  };

  const disconnect = () => {
    setConnected(false);
    setQrReady(false);
    setQrCodeImage(null);
    say("Canal WhatsApp desconectado.");
  };

  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm md:p-8">
          <span className="inline-flex rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 p-3 text-emerald-700 dark:text-emerald-300">
            <MessageSquareText className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm font-bold text-blue-700 dark:text-blue-400">{company}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Conecte seu WhatsApp</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Conecte um número para centralizar conversas, responder clientes e disparar campanhas
            diretamente pelo ND7.
          </p>
          {connected ? (
            <div className="mt-7 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                WhatsApp conectado
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                Canal pronto para mensagens individuais, automações e campanhas.
              </p>
              <button
                onClick={() => say("Configurações do canal abertas.")}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Gerenciar canal
              </button>
              <button
                onClick={disconnect}
                className="mt-4 ml-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100 dark:hover:bg-slate-700"
              >
                Desconectar
              </button>
            </div>
          ) : qrReady ? (
            <div className="mt-7 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-slate-800/80 p-5">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border-8 border-white dark:border-slate-700 bg-[repeating-conic-gradient(#0f172a_0_25%,#fff_0_50%)] p-1 shadow-sm overflow-hidden">
                  {qrCodeImage ? (
                    <img
                      src={qrCodeImage.startsWith("data:") ? qrCodeImage : `data:image/png;base64,${qrCodeImage}`}
                      alt="QR Code WhatsApp"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/95" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-blue-950 dark:text-white">QR Code pronto para leitura</p>
                  <p className="mt-2 text-xs leading-5 text-blue-800 dark:text-slate-300">
                    No WhatsApp do número que deseja conectar, abra <b>Dispositivos conectados</b> e leia o código. A conta só será marcada como conectada após essa etapa.
                  </p>
                  <button
                    onClick={confirmRead}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  >
                    Confirmar leitura do QR Code
                  </button>
                  <button onClick={() => setQrReady(false)} className="ml-2 mt-4 rounded-xl px-3 py-2.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <button
                onClick={connect}
                disabled={connecting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:bg-blue-700 disabled:opacity-70"
              >
                {connecting ? "Gerando QR Code..." : "Conectar WhatsApp"}
              </button>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                A conexão segura deve ser feita pelo QR Code do número que será usado pela empresa.
              </p>
            </div>
          )}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Conecte o número"],
              ["2", "Leia o QR Code"],
              ["3", "Comece a conversar"],
            ].map(([number, text]) => (
              <div key={number} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-transparent dark:border-slate-800">
                <b className="text-blue-600 dark:text-blue-400">{number}</b>
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-3xl bg-[#111827] dark:bg-slate-900/90 border border-transparent dark:border-slate-800 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200 dark:text-blue-400">
            Integração Evolution
          </p>
          <h2 className="mt-3 text-xl font-bold text-white">Conexão preparada para sua API.</h2>
          <p className="mt-3 text-sm leading-6 text-blue-100 dark:text-slate-300">
            As credenciais da Evolution devem ficar protegidas no backend, nunca nesta tela ou no
            navegador.
          </p>
          <div className="mt-6 space-y-3 border-t border-white/10 dark:border-slate-800 pt-5">
            {[
              "Conexão por QR Code",
              "Envio individual e em massa",
              "Automação por contatos e segmentos",
              "Histórico centralizado no CRM",
            ].map((item) => (
              <p key={item} className="flex gap-2 text-sm text-blue-100 dark:text-slate-300">
                <Check className="h-4 w-4 text-emerald-300" />
                {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
function MessageManager({ company, say }: { company: string; say: (message: string) => void }) {
  const [mode, setMode] = useState("individual");
  const [selected, setSelected] = useState<string[]>(["Mariana Alves"]);
  const contacts = [
    "Mariana Alves",
    "Carlos Eduardo",
    "Fernanda Lima",
    "João Silva",
    "Patrícia Costa",
  ];
  const toggleContact = (contact: string) =>
    setSelected((all) =>
      all.includes(contact) ? all.filter((item) => item !== contact) : [...all, contact],
    );
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{company}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciador de Mensagens</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie conversas, campanhas e automações para os seus contatos.
          </p>
        </div>
        <button
          onClick={() => say("Campanha salva como rascunho.")}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
        >
          <Send className="mr-1 inline h-4 w-4" />
          Salvar campanha
        </button>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              ["individual", "Mensagem individual"],
              ["mass", "Envio em massa"],
              ["automation", "Automação"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id as string)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition ${mode === id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
              Destinatários
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {contacts.map((contact) => (
                <button
                  key={contact}
                  onClick={() => toggleContact(contact)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm transition ${selected.includes(contact) ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <span>{contact}</span>
                  {selected.includes(contact) && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-7 block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
            Mensagem
            <textarea
              className="mt-3 min-h-36 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40"
              defaultValue={
                mode === "automation"
                  ? "Olá, {{nome}}! Vimos que você demonstrou interesse. Posso ajudar?"
                  : "Olá, {{nome}}! Temos uma novidade para você."
              }
            />
          </label>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-slate-500 dark:text-slate-400 border border-transparent dark:border-slate-800">
            <span>{selected.length} contato(s) selecionado(s)</span>
            <button
              onClick={() =>
                say(
                  `${mode === "automation" ? "Automação" : "Mensagem"} agendada para ${selected.length} contato(s).`,
                )
              }
              className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              {mode === "automation" ? "Ativar automação" : "Enviar mensagem"}
            </button>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-3xl bg-[#111827] dark:bg-slate-900/90 border border-transparent dark:border-slate-800 p-6 text-white">
            <Zap className="h-6 w-6 text-yellow-300" />
            <h2 className="mt-4 text-lg font-bold text-white">Envie com contexto.</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100 dark:text-slate-300">
              Use campos como <b>{"{{nome}}"}</b> para personalizar cada mensagem e mantenha a
              conversa humana, mesmo em escala.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 dark:text-white">Boas práticas</h2>
            {[
              "Envie apenas para contatos com consentimento",
              "Evite disparos repetidos",
              "Personalize a primeira linha",
              "Acompanhe respostas no CRM",
            ].map((item) => (
              <p key={item} className="mt-4 flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
function MySubscription({ checkout, company }: { checkout: () => void; company: string }) {
  const history = [
    [
      "Profissional",
      "Mensal",
      "01 Jul 2026",
      "31 Jul 2026",
      "Renovada",
      "bg-emerald-50 text-emerald-700",
    ],
    [
      "Profissional",
      "Mensal",
      "01 Jun 2026",
      "30 Jun 2026",
      "Renovada",
      "bg-emerald-50 text-emerald-700",
    ],
    ["Profissional", "Mensal", "01 Mai 2026", "31 Mai 2026", "Paga", "bg-blue-50 text-blue-700"],
  ];
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Conta e cobrança</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Minha Assinatura</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {company} · Acompanhe seu plano atual e todo o histórico da sua empresa.
          </p>
        </div>
        <button
          onClick={checkout}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Gerenciar assinatura
        </button>
      </div>
      <section className="mt-7 overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900/90 shadow-xl shadow-blue-100 dark:shadow-none">
        <div className="bg-gradient-to-r from-[#071a3d] to-[#0d6efd] p-6 text-white md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                ASSINATURA ATIVA
              </p>
              <h2 className="mt-5 text-2xl font-bold text-white">ND7 Profissional</h2>
              <p className="mt-2 text-sm text-blue-100">
                Sua operação está protegida e com acesso total aos recursos do plano.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs text-blue-100">Próxima renovação</p>
              <b className="mt-1 block text-lg text-white">26 de setembro de 2026</b>
              <p className="mt-1 text-xs text-emerald-200">Cobrança em dia</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-3 md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Periodicidade
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">Mensal</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Status atual
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">
              <CheckCircle2 className="h-4 w-4" />
              Ativa
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Forma de pagamento
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">Cartão de crédito</p>
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 py-4 text-sm text-slate-600 dark:text-slate-300 md:px-8">
          <LockKeyhole className="mr-2 inline h-4 w-4 text-blue-600 dark:text-blue-400" />
          Seu acesso permanece liberado enquanto a assinatura estiver ativa e os pagamentos em dia.
        </div>
      </section>
      <section className="mt-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de assinaturas</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registro de todos os ciclos e alterações da sua assinatura.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-300">
            3 registros
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-400">
              <tr>
                <th className="pb-3">Plano</th>
                <th>Período</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item[2]} className="border-t border-slate-100 dark:border-slate-800/80 text-sm">
                  <td className="py-4 font-semibold text-slate-900 dark:text-white">{item[0]}</td>
                  <td className="text-slate-700 dark:text-slate-300">{item[1]}</td>
                  <td className="text-slate-500 dark:text-slate-400">{item[2]}</td>
                  <td className="text-slate-500 dark:text-slate-400">{item[3]}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item[5]} dark:bg-slate-800 dark:text-slate-200`}>
                      {item[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function Card({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
}) {
  return (
    <div className="product-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</span>
        <span className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 dark:border dark:border-blue-800/40">{icon}</span>
      </div>
      <b className="mt-5 block text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</b>
      <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        ↑ {trend} <span className="font-normal text-slate-400 dark:text-slate-400">vs. mês anterior</span>
      </p>
    </div>
  );
}

function downloadFile(contents: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function createFinancialPdf(company: string) {
  const plain = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[()\\]/g, "\\$&");
  const lines = [
    "RELATORIO FINANCEIRO - ND7",
    `Empresa: ${plain(company)}`,
    `Emitido em: ${new Date().toLocaleDateString("pt-BR")}`,
    "",
    "Faturamento no mes: R$ 42.860,00",
    "Receita confirmada: R$ 36.240,00",
    "A receber: R$ 18.720,00",
    "Ticket medio: R$ 3.570,00",
    "",
    "Conversoes confirmadas:",
    "Clinica Horizonte - R$ 8.200,00",
    "Almeida & Costa - R$ 12.500,00",
    "Nucleo Engenharia - R$ 6.800,00",
  ];
  const content = ["BT", "/F1 17 Tf", "48 790 Td"]
    .concat(
      lines.flatMap((line, index) => [
        index === 0 ? `(${line}) Tj` : "0 -26 Td",
        index === 0 ? "" : `(${line}) Tj`,
      ]),
    )
    .filter(Boolean)
    .concat(["ET"])
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function FinancialCenter({ company, say }: { company: string; say: (message: string) => void }) {
  const cashflow = [42, 56, 49, 68, 61, 78, 72, 92, 84, 100];
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportReport = (format: "pdf" | "csv") => {
    const filename = `relatorio-financeiro-${company.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;
    if (format === "csv") {
      const csv = [
        ["Relatório financeiro", company],
        ["Indicador", "Valor"],
        ["Faturamento no mês", "R$ 42.860,00"],
        ["Receita confirmada", "R$ 36.240,00"],
        ["A receber", "R$ 18.720,00"],
        ["Ticket médio", "R$ 3.570,00"],
        [],
        ["Cliente", "Origem", "Fechamento", "Valor", "Status"],
        ["Clínica Horizonte", "Indicação", "Hoje", "R$ 8.200,00", "Receita confirmada"],
        ["Almeida & Costa", "Inbound", "Ontem", "R$ 12.500,00", "Receita confirmada"],
        ["Núcleo Engenharia", "Prospecção", "22 ago", "R$ 6.800,00", "Receita confirmada"],
      ]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
        .join("\n");
      downloadFile(`\uFEFF${csv}`, `${filename}.csv`, "text/csv;charset=utf-8");
      say("Relatório financeiro em CSV baixado.");
    } else {
      downloadFile(createFinancialPdf(company), `${filename}.pdf`, "application/pdf");
      say("Relatório financeiro em PDF baixado.");
    }
    setShowExportOptions(false);
  };
  return (
    <div className="financial-center mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Financeiro · visão gerencial</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Resultados de {company}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acompanhe receita, conversões e previsibilidade de caixa.</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowExportOptions((open) => !open)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20">
            <TrendingUp className="mr-1 inline h-4 w-4" /> Exportar relatório
          </button>
          {showExportOptions && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl">
              <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">Escolha o formato</p>
              <button onClick={() => exportReport("pdf")} className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-white">Baixar em PDF</button>
              <button onClick={() => exportReport("csv")} className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-white">Baixar em CSV</button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Faturamento no mês" value="R$ 42.860" trend="18,4%" icon={<CircleDollarSign />} />
        <Card label="Receita confirmada" value="R$ 36.240" trend="12,8%" icon={<CheckCircle2 />} />
        <Card label="A receber" value="R$ 18.720" trend="7,2%" icon={<CreditCard />} />
        <Card label="Ticket médio" value="R$ 3.570" trend="9,6%" icon={<TrendingUp />} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900 dark:text-white">Evolução do faturamento</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Entradas confirmadas e projeção para os próximos dias</p></div><b className="text-sm text-emerald-600 dark:text-emerald-400">+18,4%</b></div>
          <div className="mt-7 flex h-48 items-end gap-2">{cashflow.map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end"><span className="mx-auto mb-2 hidden rounded bg-slate-900 dark:bg-slate-800 px-1.5 py-1 text-[9px] text-white group-hover:block border border-transparent dark:border-slate-700">R$ {(height * 430).toLocaleString("pt-BR")}</span><i className="block rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400" style={{ height: `${height}%` }} /></div>)}</div>
          <div className="mt-3 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-400"><span>01 ago</span><span>08 ago</span><span>15 ago</span><span>22 ago</span><span>Hoje</span></div>
        </section>
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white">Saúde financeira</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Leitura rápida da operação</p>
          {[['Margem estimada', '38,6%', 'bg-emerald-500'], ['Meta do mês', '86%', 'bg-blue-600'], ['Inadimplência', '3,2%', 'bg-amber-500']].map(([label, value, tone]) => <div key={label} className="mt-6"><div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">{label}</span><b className="text-slate-900 dark:text-white">{value}</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><i className={`block h-full rounded-full ${tone}`} style={{ width: value }} /></div></div>)}
        </section>
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900 dark:text-white">Conversões que geraram receita</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Negócios ganhos no período e impacto no caixa.</p></div><span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">12 conversões no mês</span></div>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs text-slate-400 dark:text-slate-400"><tr><th className="pb-3">Cliente</th><th>Origem</th><th>Fechamento</th><th>Valor</th><th>Status</th></tr></thead><tbody>{[['Clínica Horizonte','Indicação','Hoje','R$ 8.200'],['Almeida & Costa','Inbound','Ontem','R$ 12.500'],['Núcleo Engenharia','Prospecção','22 ago','R$ 6.800']].map((row) => <tr key={row[0]} className="border-t border-slate-100 dark:border-slate-800/80"><td className="py-4 font-bold text-slate-900 dark:text-white">{row[0]}</td><td className="text-slate-700 dark:text-slate-300">{row[1]}</td><td className="text-slate-500 dark:text-slate-400">{row[2]}</td><td className="font-bold text-slate-900 dark:text-white">{row[3]}</td><td><span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">Receita confirmada</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
function Dashboard({
  admin,
  say,
  company,
}: {
  admin: () => void;
  say: (s: string) => void;
  company: string;
}) {
  return (
    <div className="owner-dashboard mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Terça-feira, 26 de agosto</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {company} <span className="text-blue-500">✦</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Decisões melhores começam com uma visão clara da operação.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={admin}
            className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/60 px-3 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            Super Admin
          </button>
          <button
            onClick={() => say("Formulário de novo contato aberto.")}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            <Plus className="mr-1 inline h-4 w-4" />
            Novo contato
          </button>
        </div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Vendas este mês" value="R$ 42.860" trend="18,4%" icon={<CircleDollarSign />} />
        <Card label="Negócios em andamento" value="24" trend="6 novos" icon={<ClipboardList />} />
        <Card label="Novos contatos" value="128" trend="23,1%" icon={<ContactRound />} />
        <Card label="Taxa de conversão" value="32,8%" trend="4,2%" icon={<Sparkles />} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[['Meta mensal', 'R$ 50.000', '86% atingida', 'bg-blue-600'], ['Previsão do funil', 'R$ 78.400', '32 negócios em aberto', 'bg-violet-500'], ['Receita a receber', 'R$ 18.720', 'Próximos 30 dias', 'bg-emerald-500']].map(([label, value, detail, tone]) => <section key={label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm"><div className="flex justify-between"><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${tone}`} /></div><b className="mt-4 block text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</b><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{detail}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><i className={`block h-full rounded-full ${tone}`} style={{ width: label === 'Meta mensal' ? '86%' : label === 'Previsão do funil' ? '68%' : '57%' }} /></div></section>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white">Funil de vendas</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Acompanhe seus negócios por etapa</p>
          <div className="mt-5 grid min-w-[600px] grid-cols-3 gap-3 overflow-x-auto">
            {["Qualificação", "Proposta enviada", "Negociação"].map((title, i) => (
              <div key={title} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  {title}
                  <span className="text-slate-400 dark:text-slate-400">{6 - i}</span>
                </div>
                <div className="mt-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
                  <b className="text-xs font-bold text-slate-900 dark:text-white">
                    {["Contrato corporativo", "Projeto de expansão", "Consultoria mensal"][i]}
                  </b>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {["Clínica Horizonte", "Almeida & Costa", "Núcleo Engenharia"][i]}
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                    {["R$ 24.000", "R$ 18.500", "R$ 8.200"][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white">Atividades</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Próximos compromissos</p>
          {[
            ["10:00", "Reunião de apresentação", "Almeida & Costa"],
            ["14:30", "Follow-up de proposta", "Núcleo Engenharia"],
            ["16:00", "Onboarding de cliente", "Clínica Horizonte"],
          ].map((a) => (
            <div key={a[0]} className="mt-5 flex gap-3">
              <b className="text-xs text-slate-400 dark:text-slate-400">{a[0]}</b>
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{a[1]}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a[2]}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
function Admin({
  open,
  say,
  logout,
}: {
  open: (company: string) => void;
  say: (s: string) => void;
  logout: () => void;
}) {
  const [filter, setFilter] = useState("Todos");
  const rows = filter === "Todos" ? businesses : businesses.filter((x) => x[3] === filter);
  return (
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#071a3d] to-blue-700 p-6 text-white shadow-xl shadow-blue-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
              ♛ Área restrita
            </p>
            <h1 className="mt-2 text-2xl font-bold">Central Super Admin</h1>
            <p className="mt-1 text-sm text-blue-100">
              Visão global da plataforma, assinaturas e empresas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-right">
              <small className="text-blue-200">Receita recorrente mensal</small>
              <b className="block text-xl">R$ 16.842</b>
            </div>
            <button
              onClick={logout}
              title="Sair do painel Super Admin"
              className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/25 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-rose-600 hover:border-rose-500 hover:shadow-lg hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Empresas ativas" value="2" trend="2 demonstrações" icon={<Building2 />} />
        <Card
          label="Assinaturas pendentes"
          value="7"
          trend="requer atenção"
          icon={<CircleDollarSign />}
        />
        <Card label="Assinaturas expiradas" value="3" trend="este mês" icon={<CalendarDays />} />
        <Card label="Usuários ativos" value="438" trend="42 novos" icon={<UsersRound />} />
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap justify-between gap-4 border-b border-slate-200 dark:border-slate-800 p-5">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Assinantes e empresas</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Gerencie acessos, cobrança e dados cadastrais.
            </p>
          </div>
          <button
            onClick={() =>
              say("O cliente deverá concluir o checkout para criar o acesso automaticamente.")
            }
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <Plus className="mr-1 inline h-4 w-4" />
            Novo assinante
          </button>
        </div>
        <div className="flex gap-2 p-5 pb-0">
          {["Todos", "Ativa", "Pendente", "Expirada"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filter === f
                  ? "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[760px] text-left">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              <tr>
                <th className="pb-3">Empresa / Responsável</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Mensalidade</th>
                <th>ID</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x[0]} className="border-t border-slate-100 dark:border-slate-800/80 text-sm">
                  <td className="py-4">
                    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/80 text-xs font-bold text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40">
                      {x[5]}
                    </span>
                    <span>
                      <b className="font-bold text-slate-900 dark:text-white">{x[0]}</b>
                      <small className="ml-2 text-slate-500 dark:text-slate-300">{x[1]}</small>
                    </span>
                  </td>
                  <td className="text-slate-700 dark:text-slate-200 font-medium">{x[2]}</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        x[3] === "Ativa"
                          ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                          : x[3] === "Pendente"
                            ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
                            : "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                      }`}
                    >
                      {x[3]}
                    </span>
                  </td>
                  <td className="font-bold text-slate-900 dark:text-white">{x[4]}</td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-300 font-medium">nxs-{String(x[5]).toLowerCase()}74f</td>
                  <td>
                    <button
                      onClick={() => open(String(x[0]))}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                    >
                      Acessar empresa
                    </button>
                    <button
                      onClick={() => say(`Opções de ${x[0]} abertas.`)}
                      className="ml-1 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function Login({ back, enter }: { back: () => void; enter: () => void }) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Por favor, digite seu e-mail.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao solicitar recuperação de senha.");
      }

      setForgotMessage(
        data.message || "Instruções enviadas para seu e-mail! Verifique sua caixa de entrada.",
      );
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : "Erro ao enviar e-mail.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#fbfaff] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#071a3d] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Logo />
          <b>ND7</b>
        </div>
        <h1 className="max-w-md text-4xl font-bold leading-tight">
          Tudo que sua empresa precisa para cultivar boas relações.
        </h1>
        <p className="text-xs text-blue-300">© 2026 ND7</p>
      </div>
      <div className="flex items-center justify-center px-5 py-8 sm:p-6">
        <div className="w-full max-w-sm">
          {mode === "login" ? (
            <>
              <button onClick={back} className="mb-12 text-sm font-medium text-blue-600">
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold">Que bom ter você de volta.</h1>
              <p className="mt-2 text-sm text-slate-500">Entre para acessar sua empresa.</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  enter();
                }}
              >
                {["Usuário ou e-mail", "Senha"].map((x, i) => (
                  <label key={x} className="mt-5 block text-xs font-bold">
                    {x}
                    <input
                      type={i ? "password" : "text"}
                      autoComplete={i ? "current-password" : "username"}
                      className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
                    />
                  </label>
                ))}
                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Entrar na minha conta
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setForgotError("");
                  setForgotMessage("");
                  setMode("forgot");
                }}
                className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline"
              >
                Esqueci minha senha
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotError("");
                  setForgotMessage("");
                }}
                className="mb-8 text-sm font-medium text-blue-600 hover:underline"
              >
                ← Voltar para o login
              </button>
              <h1 className="text-2xl font-bold">Recuperar sua senha</h1>
              <p className="mt-2 text-sm text-slate-500">
                Informe o e-mail cadastrado e enviaremos um link seguro para redefinição.
              </p>

              {forgotMessage && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
                  <span className="block font-bold text-emerald-900">E-mail enviado!</span>
                  {forgotMessage}
                </div>
              )}

              {forgotError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
                  {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="mt-5">
                <label className="block text-xs font-bold">
                  Seu e-mail cadastrado
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="exemplo@empresa.com.br"
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {forgotLoading ? "Enviando e-mail..." : "Enviar link de recuperação"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function Checkout({
  back,
  done,
  initialCycle = "Mensal",
}: {
  back: () => void;
  done: () => void;
  initialCycle?: string;
}) {
  const [payment, setPayment] = useState<"card" | "pix" | "boleto">("card");
  const [cycle, setCycle] = useState(initialCycle);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [cep, setCep] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepMessage, setCepMessage] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pixModalData, setPixModalData] = useState<{
    qrCodeImage?: string;
    payload?: string;
    paymentId?: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);

  const prices: Record<string, string> = {
    Mensal: "R$ 129,90",
    Trimestral: "R$ 119,90",
    Semestral: "R$ 109,90",
    Anual: "R$ 99,90",
  };
  const cycleTotals: Record<string, string> = {
    Mensal: "R$ 129,90",
    Trimestral: "R$ 359,70",
    Semestral: "R$ 659,40",
    Anual: "R$ 1.198,80",
  };
  const input =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  const lockedInput =
    "mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-3 text-sm text-slate-500 outline-none";

  const formatCep = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };
  const formatDocument = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    if (digits.length <= 11)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };
  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(\d)/, "$1/$2");
  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardBrand = /^4/.test(cardDigits)
    ? "VISA"
    : /^(5[1-5]|2[2-7])/.test(cardDigits)
      ? "mastercard"
      : /^3[47]/.test(cardDigits)
        ? "AMEX"
        : /^(4011|4312|4389|4514|4576|5041|5067|5090|6277|6362|650|6516|6550)/.test(cardDigits)
          ? "ELO"
          : "CARTÃO";

  const handleCep = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepMessage("");
      return;
    }
    setCepMessage("Buscando endereço...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) throw new Error("CEP inválido");
      setAddress({
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      });
      setCepMessage("Endereço preenchido automaticamente.");
    } catch {
      setAddress({ street: "", neighborhood: "", city: "", state: "" });
      setCepMessage("Não foi possível localizar este CEP.");
    }
  };

  // Poll for PIX payment completion
  useEffect(() => {
    if (!pixModalData?.paymentId || paymentConfirmed) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${pixModalData.paymentId}`);
        const data = (await res.json()) as { isPaid?: boolean };
        if (data.isPaid) {
          setPaymentConfirmed(true);
          clearInterval(interval);
        }
      } catch {
        // silent retry
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pixModalData?.paymentId, paymentConfirmed]);

  const handleSubmitCheckout = async () => {
    setErrorMessage("");
    if (!fullName.trim()) {
      setErrorMessage("Por favor, informe seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, informe um e-mail válido.");
      return;
    }
    if (!document.trim() || document.replace(/\D/g, "").length < 11) {
      setErrorMessage("Por favor, informe um CPF ou CNPJ válido.");
      return;
    }

    if (payment === "card") {
      if (!cardName.trim() || cardDigits.length < 13 || cardExpiry.length < 5 || !cardCvv) {
        setErrorMessage("Por favor, preencha todos os dados do cartão de crédito corretamente.");
        return;
      }
    }

    setLoading(true);
    try {
      const expParts = cardExpiry.split("/");
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        companyName: companyName.trim() || fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        document: document.replace(/\D/g, ""),
        cycle,
        paymentMethod: payment,
        postalCode: cep.replace(/\D/g, ""),
        address: address.street,
        addressNumber,
        complement,
        province: address.neighborhood,
        creditCard:
          payment === "card"
            ? {
                holderName: cardName,
                number: cardDigits,
                expiryMonth: expParts[0],
                expiryYear: `20${expParts[1]}`,
                ccv: cardCvv,
              }
            : undefined,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha ao processar pagamento.");
      }

      if (payment === "pix" && data.pix) {
        setPixModalData({
          qrCodeImage: data.pix.qrCodeImage,
          payload: data.pix.payload,
          paymentId: data.paymentId,
        });
      } else if (payment === "boleto" && data.bankSlipUrl) {
        setBoletoUrl(data.bankSlipUrl);
      } else {
        // Card success or general completed
        done();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Ocorreu um erro no processamento.");
    } finally {
      setLoading(false);
    }
  };

  const copyPixPayload = () => {
    if (pixModalData?.payload) {
      navigator.clipboard.writeText(pixModalData.payload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  return (
    <div className="checkout-page min-h-screen px-5 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="checkout-header flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <b>ND7</b>
              <span className="ml-2 text-xs text-slate-400">Checkout seguro</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={back}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white hover:text-blue-700"
            >
              ← Voltar para a oferta
            </button>
          </div>
        </header>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-500">
          <span>
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-blue-600" />
            Compra protegida
          </span>
          <span>
            <LockKeyhole className="mr-1 inline h-3.5 w-3.5 text-blue-600" />
            Ambiente criptografado
          </span>
          <span>
            <CircleDollarSign className="mr-1 inline h-3.5 w-3.5 text-blue-600" />
            Processado pela Asaas
          </span>
        </div>

        {/* PIX Modal / Overlay */}
        {pixModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-6 md:p-8">
              {paymentConfirmed ? (
                <div className="py-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">Pagamento Confirmado!</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Sua empresa e usuário foram provisionados com sucesso no ND7.
                  </p>
                  <button
                    onClick={done}
                    className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700"
                  >
                    Acessar Plataforma
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Pague com PIX</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Abra o app do seu banco e escaneie o QR Code abaixo ou use o Copia e Cola.
                  </p>

                  {pixModalData.qrCodeImage && (
                    <div className="my-5 flex justify-center">
                      <img
                        src={`data:image/png;base64,${pixModalData.qrCodeImage}`}
                        alt="QR Code PIX"
                        width={192}
                        height={192}
                        decoding="async"
                        className="h-48 w-48 rounded-xl border border-slate-200 p-2 shadow-inner"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={copyPixPayload}
                      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
                    >
                      {copiedPix ? "Código PIX Copiado! ✅" : "Copiar Chave PIX Copia e Cola"}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                    Aguardando confirmação do pagamento em tempo real...
                  </div>

                  <button
                    onClick={() => setPixModalData(null)}
                    className="mt-5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Fechar e alterar método
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boleto Modal */}
        {boletoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900">Boleto Bancário Gerado</h3>
              <p className="mt-2 text-sm text-slate-600">
                O boleto foi gerado pelo Asaas. Seu acesso será liberado assim que o pagamento for compensado.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Abrir e Imprimir Boleto
                </a>
                <button
                  onClick={() => {
                    setBoletoUrl(null);
                    done();
                  }}
                  className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="checkout-form rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="checkout-progress flex items-center gap-3 text-xs font-semibold text-slate-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                1
              </span>{" "}
              Cadastro <span className="h-px w-8 bg-slate-200" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full border">
                2
              </span>{" "}
              Pagamento <span className="h-px w-8 bg-slate-200" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full border">
                3
              </span>{" "}
              Confirmação
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-blue-600">
              Assinatura ND7
            </p>
            <h1 className="mt-2 text-2xl font-bold">Finalize sua assinatura</h1>
            <p className="mt-2 text-sm text-slate-500">
              Seu acesso será criado automaticamente após a aprovação do pagamento.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 border-t pt-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold">Dados cadastrais</h2>
                  <p className="text-xs text-slate-500">Responsável pela assinatura.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold">
                  Nome completo
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold">
                  E-mail de acesso
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold md:col-span-2">
                  Nome da empresa
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold">
                  Celular / WhatsApp
                  <input
                    inputMode="numeric"
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold">
                  CPF ou CNPJ
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
                    value={document}
                    onChange={(event) => setDocument(formatDocument(event.target.value))}
                    className={input}
                  />
                </label>
              </div>
            </div>
            <div className="mt-8 border-t pt-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold">Endereço de cobrança</h2>
                  <p className="text-xs text-slate-500">Necessário para processar a assinatura.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-6">
                <label className="text-xs font-bold md:col-span-2">
                  CEP
                  <input
                    inputMode="numeric"
                    value={cep}
                    onChange={(event) => void handleCep(event.target.value)}
                    className={input}
                  />
                  {cepMessage && (
                    <small
                      className={`mt-1 block font-medium ${cepMessage.startsWith("Endereço") ? "text-emerald-600" : cepMessage.startsWith("Não") ? "text-rose-600" : "text-blue-600"}`}
                    >
                      {cepMessage}
                    </small>
                  )}
                </label>
                <label className="text-xs font-bold md:col-span-4">
                  Rua / Avenida
                  <input readOnly value={address.street} className={lockedInput} />
                </label>
                <label className="text-xs font-bold md:col-span-2">
                  Número
                  <input
                    inputMode="numeric"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold md:col-span-2">
                  Complemento
                  <input
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-xs font-bold md:col-span-2">
                  Bairro
                  <input readOnly value={address.neighborhood} className={lockedInput} />
                </label>
                <label className="text-xs font-bold md:col-span-3">
                  Cidade
                  <input readOnly value={address.city} className={lockedInput} />
                </label>
                <label className="text-xs font-bold md:col-span-3">
                  Estado
                  <input readOnly value={address.state} className={lockedInput} />
                </label>
              </div>
            </div>
            <div className="mt-8 border-t pt-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold">Pagamento</h2>
                  <p className="text-xs text-slate-500">Processado com segurança pela Asaas.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPayment("card")}
                  className={`rounded-2xl border p-4 text-left ${payment === "card" ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <b className="ml-2 text-sm">Cartão de crédito</b>
                  <p className="mt-2 text-xs text-slate-500">Cobrança recorrente automática</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayment("pix")}
                  className={`rounded-2xl border p-4 text-left ${payment === "pix" ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <b className="text-sm text-emerald-600">PIX</b>
                  <p className="mt-2 text-xs text-slate-500">
                    Disponível para o primeiro pagamento
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayment("boleto")}
                  className={`rounded-2xl border p-4 text-left ${payment === "boleto" ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <span className="rounded bg-slate-800 px-1.5 py-1 text-[10px] font-black text-white">
                    BOLETO
                  </span>
                  <p className="mt-3 text-xs text-slate-500">
                    Gere o boleto para pagamento bancário
                  </p>
                </button>
              </div>
              {payment === "card" ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
                  <div className="card-preview relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#071a3d] via-blue-700 to-sky-500 p-5 text-white shadow-xl shadow-blue-200">
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                    <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-cyan-300/20" />
                    <div className="relative flex items-start justify-between">
                      <span className="text-xs font-black tracking-[.22em]">ND7</span>
                      <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-black uppercase">
                        {cardBrand}
                      </span>
                    </div>
                    <div className="relative mt-8 h-8 w-11 rounded-md border border-amber-100/50 bg-gradient-to-br from-amber-100 to-amber-400" />
                    <p className="relative mt-auto whitespace-nowrap font-mono text-sm tracking-[.14em]">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="relative mt-3 grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3">
                      <div>
                        <small className="block text-[8px] uppercase tracking-wider text-blue-100">
                          Titular
                        </small>
                        <b className="block max-w-[160px] truncate text-[11px] uppercase">
                          {cardName || "SEU NOME"}
                        </b>
                      </div>
                      <div>
                        <small className="block text-[8px] uppercase tracking-wider text-blue-100">
                          Validade
                        </small>
                        <b className="text-[11px]">{cardExpiry || "MM/AA"}</b>
                      </div>
                      <div className="text-right">
                        <small className="block text-[8px] uppercase tracking-wider text-blue-100">
                          CVV
                        </small>
                        <b className="font-mono text-[11px] tracking-[.16em]">
                          {cardCvv ? "•".repeat(cardCvv.length) : "•••"}
                        </b>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-6">
                    <label className="text-xs font-bold md:col-span-6">
                      Nome impresso no cartão
                      <input
                        value={cardName}
                        onChange={(event) => setCardName(event.target.value.toUpperCase())}
                        autoComplete="cc-name"
                        className={input}
                      />
                    </label>
                    <label className="text-xs font-bold md:col-span-6">
                      Número do cartão
                      <input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                        className={input}
                      />
                    </label>
                    <label className="text-xs font-bold md:col-span-3">
                      Validade
                      <input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                        className={input}
                      />
                    </label>
                    <label className="text-xs font-bold md:col-span-3">
                      CVV
                      <input
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardCvv}
                        onChange={(event) =>
                          setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        className={input}
                      />
                    </label>
                  </div>
                </div>
              ) : payment === "pix" ? (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  Um QR Code PIX com confirmação automática em tempo real será gerado ao clicar em continuar.
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Um boleto bancário será gerado na próxima etapa. O acesso será liberado após a
                  confirmação do pagamento pela Asaas.
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitCheckout}
              className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processando com segurança...
                </span>
              ) : (
                <>
                  Continuar para pagamento seguro <LockKeyhole className="ml-2 inline h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[11px] text-slate-400">
              <LockKeyhole className="mr-1 inline h-3.5 w-3.5" />
              Seus dados de pagamento são protegidos.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <b className="mt-3 block text-xs text-slate-800">Garantia de transparência</b>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Valor, periodicidade e renovação sempre apresentados antes da confirmação.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <LockKeyhole className="h-5 w-5 text-emerald-600" />
                <b className="mt-3 block text-xs text-slate-800">Compra segura</b>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Os dados de pagamento trafegam em ambiente protegido e criptografado.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CircleDollarSign className="h-5 w-5 text-blue-600" />
                <b className="mt-3 block text-xs text-slate-800">Pagamento via Asaas</b>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  A cobrança é processada pela Asaas, uma plataforma especializada em pagamentos.
                </p>
              </div>
            </div>
          </section>
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="checkout-summary overflow-hidden rounded-3xl bg-[#111827] text-white shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                  Resumo do pedido
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Logo />
                  <div>
                    <h2 className="text-lg font-bold">ND7 Profissional</h2>
                    <p className="text-sm text-blue-100">CRM inteligente para sua operação</p>
                  </div>
                </div>
                <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-blue-100">
                  Você está a poucos minutos de ativar uma operação completa, com todos os recursos
                  do ND7 liberados.
                </p>
              </div>
              <div className="p-6">
                <div>
                  <p className="text-xs font-bold text-blue-200">Escolha a periodicidade</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["Mensal", "Trimestral", "Semestral", "Anual"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setCycle(option)}
                        className={`rounded-xl border p-3 text-left transition ${cycle === option ? "border-blue-300 bg-blue-500 text-white shadow-lg shadow-blue-950/30" : "border-white/10 bg-white/5 text-blue-100 hover:border-blue-300/50 hover:bg-white/10"}`}
                      >
                        <span className="block text-xs font-bold">{option}</span>
                        <span
                          className={`mt-1 block text-sm font-black ${cycle === option ? "text-white" : "text-blue-200"}`}
                        >
                          {prices[option]}
                        </span>
                        <span
                          className={`mt-0.5 block text-[9px] ${cycle === option ? "text-blue-100" : "text-blue-300"}`}
                        >
                          {cycleTotals[option]} por ciclo
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <hr className="my-6 border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Plano Profissional</span>
                  <b>{cycle}</b>
                </div>
                <div className="mt-5 flex justify-between">
                  <span className="text-sm text-blue-100">Valor mensal equivalente</span>
                  <b className="text-right">
                    {prices[cycle]}
                    <small className="block text-[10px] font-normal text-blue-200">
                      {cycleTotals[cycle]} a cada ciclo
                    </small>
                  </b>
                </div>
                <hr className="my-6 border-white/10" />
                {[
                  "Clientes e negócios ilimitados",
                  "Funis e automações",
                  "Equipe e permissões",
                  "Painel de indicadores",
                ].map((item) => (
                  <p key={item} className="mb-3 flex gap-2 text-sm text-blue-100">
                    <Check className="h-4 w-4 text-emerald-300" />
                    {item}
                  </p>
                ))}
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold">
                    <LockKeyhole className="mr-2 inline h-4 w-4 text-emerald-300" />
                    Compra segura via Asaas
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-blue-100">
                    Dados protegidos, cobrança processada pela Asaas e acesso criado somente após a
                    aprovação.
                  </p>
                </div>
                <p className="mt-4 text-center text-[10px] leading-4 text-blue-200">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                  Garantia de transparência: você confirma o ciclo e o valor antes de concluir.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
