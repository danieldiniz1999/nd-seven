import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  CreditCard,
  LayoutDashboard,
  LayoutGrid,
  List,
  LockKeyhole,
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

export const Route = createFileRoute("/")({ component: Nexus });
type View =
  | "landing"
  | "crm"
  | "admin"
  | "login"
  | "checkout"
  | "subscription"
  | "contacts"
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
      src="/nd7-512.png"
      alt="ND7"
      className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-300/30"
    />
  );
}
function Nexus() {
  const [view, setView] = useState<View>("landing"),
    [menu, setMenu] = useState(false),
    [impersonating, setImpersonating] = useState(false),
    [activeCompany, setActiveCompany] = useState("Demo v1"),
    [notice, setNotice] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  if (view === "landing")
    return <Landing access={() => setView("login")} start={() => setView("checkout")} />;
  if (view === "login")
    return <Login back={() => setView("landing")} enter={() => setView("admin")} />;
  if (view === "checkout")
    return (
      <Checkout
        back={() => setView("landing")}
        done={() =>
          say("Pagamento iniciado. O acesso será liberado após a confirmação pela Asaas.")
        }
      />
    );
  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800">
      {notice && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <Check className="mr-2 inline h-4 w-4 text-emerald-300" />
          {notice}
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
        />
        <main className="min-h-screen min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
            <div className="flex items-center gap-4">
              <button
                aria-label="Abrir menu"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                onClick={() => setMenu(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400 md:flex">
                <Search className="h-4 w-4" />
                Buscar no ND7 <kbd className="ml-10 rounded bg-white px-1.5 text-[10px]">⌘ K</kbd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                DD
              </span>
              <span className="hidden text-left md:block">
                <b className="block text-xs">Daniel Diniz</b>
                <small className="text-slate-400">Administrador</small>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </header>
          <PanelContent
            view={view}
            company={activeCompany}
            accessRole={impersonating ? "super_admin" : "owner"}
            say={say}
            setView={setView}
            setActiveCompany={setActiveCompany}
            setImpersonating={setImpersonating}
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
}: {
  view: View;
  company: string;
  accessRole: AccessRole;
  say: (message: string) => void;
  setView: (view: View) => void;
  setActiveCompany: (company: string) => void;
  setImpersonating: (impersonating: boolean) => void;
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

  if (view === "admin") return <Admin open={openCompany} say={say} />;
  if (view === "subscription") return <MySubscription checkout={openCheckout} company={company} />;
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

function Landing({ access, start }: { access: () => void; start: () => void }) {
  const wa =
    "https://wa.me/5585920109136?text=" +
    encodeURIComponent("Olá! Quero conhecer o ND7 e transformar a gestão da minha empresa.");
  const [cycle, setCycle] = useState("Mensal");
  const cycles = ["Mensal", "Trimestral", "Semestral", "Anual"];
  const prices: Record<string, string> = {
    Mensal: "R$ 129,90",
    Trimestral: "R$ 119,90",
    Semestral: "R$ 109,90",
    Anual: "R$ 99,90",
  };
  const billingByCycle: Record<string, string> = {
    Mensal: "cobrado mensalmente",
    Trimestral: "R$ 359,70 a cada 3 meses",
    Semestral: "R$ 659,40 a cada 6 meses",
    Anual: "R$ 1.198,80 a cada 12 meses",
  };
  return (
    <div className="overflow-hidden bg-[#ffffff] text-slate-900">
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
          <button
            onClick={access}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
          >
            Acessar Painel <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
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
      <section id="recursos" className="mx-auto max-w-6xl px-5 py-24">
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
      <section id="como-funciona" className="bg-[#071a3d] px-5 py-24 text-white">
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
      <section id="resultado" className="bg-slate-50 px-5 py-24">
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
      <section className="mx-auto max-w-6xl px-5 py-24">
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
      <section className="border-y border-slate-200 bg-white px-5 py-18">
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
      <section className="mx-auto max-w-6xl px-5 py-24">
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
        className="relative overflow-hidden bg-[#071a3d] px-5 py-24 text-center text-white"
      >
        <div className="pointer-events-none absolute -left-32 top-8 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" /> Oferta ND7
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
              A plataforma completa.{" "}
              <span className="text-blue-300">No ritmo que faz sentido para você.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
              Não vendemos módulos, limites ou versões reduzidas. Você escolhe a periodicidade e
              recebe o ND7 por inteiro desde o primeiro acesso.
            </p>
            <div className="mx-auto mt-6 inline-flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-blue-100">
              <span>
                <Check className="mr-1.5 inline h-4 w-4 text-emerald-300" />
                Acesso total em todos os planos
              </span>
              <span>
                <Check className="mr-1.5 inline h-4 w-4 text-emerald-300" />
                Sem taxa de implantação
              </span>
              <span>
                <Check className="mr-1.5 inline h-4 w-4 text-emerald-300" />
                Gestão da assinatura pelo painel
              </span>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {cycles.map((item) => (
              <button
                key={item}
                onClick={() => setCycle(item)}
                className={`relative min-h-[224px] rounded-2xl border p-5 transition duration-300 ${cycle === item ? "border-blue-300 bg-white text-[#071a3d] shadow-2xl shadow-blue-950/40" : "border-white/15 bg-white/[.07] text-white hover:-translate-y-1 hover:border-blue-200/60 hover:bg-white/[.11]"}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <b className={`text-sm ${cycle === item ? "text-[#071a3d]" : "text-white"}`}>
                    {item}
                  </b>
                  {item === "Anual" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                      melhor custo
                    </span>
                  )}
                </span>
                <p
                  className={`mt-8 text-xs font-semibold ${cycle === item ? "text-slate-500" : "text-blue-200"}`}
                >
                  A partir de
                </p>
                <b className="mt-1 block text-3xl tracking-tight">{prices[item]}</b>
                <span
                  className={`mt-1 block text-xs ${cycle === item ? "text-slate-500" : "text-blue-200"}`}
                >
                  por mês
                </span>
                <span
                  className={`mt-6 block border-t pt-4 text-[11px] font-bold ${cycle === item ? "border-slate-200 text-blue-700" : "border-white/15 text-blue-100"}`}
                >
                  {billingByCycle[item]}
                </span>
                {cycle === item && (
                  <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                    <Check className="h-3.5 w-3.5" /> Selecionado
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-5 max-w-6xl rounded-2xl border border-white/15 bg-white/[.08] p-5 text-left backdrop-blur md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                  Plano ND7 Profissional · {cycle}
                </p>
                <p className="mt-2 text-lg font-bold">Todos os recursos. Sem versões reduzidas.</p>
                <p className="mt-1 text-sm text-blue-100">
                  {billingByCycle[cycle]} · acesso liberado após a confirmação do pagamento.
                </p>
              </div>
              <button
                onClick={start}
                className="group shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-xl shadow-blue-950/20 transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Escolher {cycle.toLowerCase()}{" "}
                <ArrowRight className="ml-1 inline h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <div className="mx-auto mt-8 grid max-w-6xl gap-y-3 border-t border-white/15 pt-7 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Contatos e negócios ilimitados",
              "Funis, automações e mensagens",
              "Equipe, agenda e indicadores",
              "Suporte especializado incluso",
            ].map((item) => (
              <p key={item} className="text-sm text-blue-100">
                <Check className="mr-2 inline h-4 w-4 text-emerald-300" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-slate-200 bg-[#f8fbff] px-5 py-20">
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
      <section className="bg-slate-50 px-5 py-24">
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
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-20 text-center text-white">
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
      <BuyerPopup />
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
function BuyerPopup() {
  const buyers = [
    { name: "Mariana Costa", state: "Ceará", plan: "Anual", minutes: 1 },
    { name: "Rafael Lima", state: "São Paulo", plan: "Semestral", minutes: 2 },
    { name: "Ana Beatriz", state: "Minas Gerais", plan: "Trimestral", minutes: 3 },
    { name: "Pedro Henrique", state: "Pernambuco", plan: "Mensal", minutes: 4 },
    { name: "Luiza Martins", state: "Paraná", plan: "Anual", minutes: 5 },
    { name: "Gustavo Alves", state: "Bahia", plan: "Semestral", minutes: 6 },
    { name: "Camila Rocha", state: "Rio de Janeiro", plan: "Trimestral", minutes: 7 },
    { name: "Felipe Santos", state: "Goiás", plan: "Mensal", minutes: 2 },
    { name: "Juliana Nunes", state: "Santa Catarina", plan: "Anual", minutes: 3 },
    { name: "Bruno Ferreira", state: "Distrito Federal", plan: "Semestral", minutes: 4 },
    { name: "Carolina Melo", state: "Rio Grande do Sul", plan: "Trimestral", minutes: 5 },
    { name: "Diego Barbosa", state: "Paraíba", plan: "Mensal", minutes: 6 },
    { name: "Isabela Freitas", state: "Espírito Santo", plan: "Anual", minutes: 7 },
    { name: "Thiago Moreira", state: "Maranhão", plan: "Semestral", minutes: 1 },
    { name: "Larissa Oliveira", state: "Mato Grosso", plan: "Trimestral", minutes: 2 },
    { name: "André Ribeiro", state: "Amazonas", plan: "Mensal", minutes: 3 },
    { name: "Renata Souza", state: "Alagoas", plan: "Anual", minutes: 4 },
    { name: "Caio Mendes", state: "Pará", plan: "Semestral", minutes: 5 },
    { name: "Beatriz Cardoso", state: "Rio Grande do Norte", plan: "Trimestral", minutes: 6 },
    { name: "Vinícius Teixeira", state: "Sergipe", plan: "Mensal", minutes: 7 },
  ];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let hide: ReturnType<typeof setTimeout>;
    let repeat: ReturnType<typeof setInterval> | undefined;
    const reveal = () => {
      setVisible(true);
      hide = setTimeout(() => setVisible(false), 3000);
    };
    const first = setTimeout(() => {
      reveal();
      repeat = setInterval(() => {
        setIndex((current) => (current + 1) % buyers.length);
        reveal();
      }, 6000);
    }, 4000);
    return () => {
      clearTimeout(first);
      clearTimeout(hide);
      if (repeat) clearInterval(repeat);
    };
  }, [buyers.length]);
  return (
    <div
      className={`fixed bottom-6 left-5 z-40 flex max-w-[285px] items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-3.5 shadow-2xl shadow-blue-950/15 backdrop-blur transition-[opacity,transform] duration-500 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
        {buyers[index].name.slice(0, 1)}
      </span>
      <div className="min-w-0 text-xs leading-5 text-slate-600">
        <p className="truncate">
          <b className="text-slate-800">{buyers[index].name}</b> · {buyers[index].state}
        </p>
        <p>
          Plano <b className="text-slate-700">{buyers[index].plan}</b> · há {buyers[index].minutes}{" "}
          min
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </p>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Demonstração
        </span>
      </div>
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
}: {
  view: View;
  setView: (v: View) => void;
  menu: boolean;
  setMenu: (b: boolean) => void;
  impersonating: boolean;
  returnToAdmin: () => void;
}) {
  return (
    <aside
      className={`drawer-panel fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#111827] p-4 text-slate-300 shadow-2xl shadow-slate-950/40 ${menu ? "drawer-panel-open" : ""}`}
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
      className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue-600 text-white" : "hover:bg-white/5 hover:text-white"}`}
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
    "Fechado ganho",
  ];
  const stageGuidance: Record<string, string> = {
    "Novo lead": "Ainda não abordado",
    "Contato inicial": "Conecte e valide interesse",
    Diagnóstico: "Entenda cenário e necessidade",
    "Proposta enviada": "Apresente a solução ideal",
    Negociação: "Alinhe condições e decisão",
    "Fechado ganho": "Prepare o próximo passo",
  };
  const stageTone: Record<string, string> = {
    "Novo lead": "bg-sky-500",
    "Contato inicial": "bg-violet-500",
    Diagnóstico: "bg-amber-500",
    "Proposta enviada": "bg-blue-600",
    Negociação: "bg-fuchsia-500",
    "Fechado ganho": "bg-emerald-500",
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
      stage: "Fechado ganho",
      owner: "VS",
    },
  ]);
  const move = (id: string, target: string) => {
    setDeals((all) => all.map((deal) => (deal.id === id ? { ...deal, stage: target } : deal)));
    say(`Negócio movido para ${target}.`);
  };
  const card = (deal: (typeof deals)[number], compact = false) => (
    <article
      draggable
      onDragStart={() => setDragged(deal.id)}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md active:cursor-grabbing ${compact ? "flex items-center justify-between gap-4" : ""}`}
      key={deal.id}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <p className="text-sm font-bold">{deal.title}</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">{deal.company}</p>
      </div>
      <div
        className={compact ? "flex items-center gap-4" : "mt-4 flex items-center justify-between"}
      >
        <b className="text-sm text-slate-700">{deal.value}</b>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
          {deal.owner}
        </span>
        {!compact && (
          <select
            aria-label={`Mover ${deal.title}`}
            value={deal.stage}
            onChange={(event) => move(deal.id, event.target.value)}
            className="ml-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-blue-700"
          >
            <option value={deal.stage}>Mover</option>
            {stages
              .filter((stage) => stage !== deal.stage)
              .map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
          </select>
        )}
      </div>
    </article>
  );
  return (
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Vendas e oportunidades</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Funil de Vendas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {company} · Acompanhe cada oportunidade ao longo da jornada do cliente.
          </p>
        </div>
        <button
          onClick={() => say("Novo negócio criado.")}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200"
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Novo negócio
        </button>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            ["kanban", <LayoutDashboard className="h-4 w-4" />, "Kanban"],
            ["grid", <LayoutGrid className="h-4 w-4" />, "Grade"],
            ["list", <List className="h-4 w-4" />, "Lista"],
          ].map(([id, icon, label]) => (
            <button
              key={String(id)}
              onClick={() => setLayout(id as typeof layout)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${layout === id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
            >
              {icon as ReactNode}
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Arraste os cards ou use <b className="text-blue-700">Mover</b> para avançar uma
          oportunidade.
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
                className="min-h-[390px] rounded-2xl border border-slate-200/70 bg-slate-100/80 p-3"
              >
                <div className="mb-4 flex items-start justify-between gap-2 px-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${stageTone[stage]}`} />
                      <b className="text-xs text-slate-800">{stage}</b>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {stageGuidance[stage]}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
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
              <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                {deal.stage}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-[800px] space-y-2">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-xl border border-slate-100 p-3 hover:bg-blue-50"
              >
                <div>
                  <b className="text-sm">{deal.title}</b>
                  <p className="text-xs text-slate-500">{deal.company}</p>
                </div>
                <span className="text-sm">{deal.value}</span>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-center text-xs font-bold text-blue-700">
                  {deal.stage}
                </span>
                <span className="text-xs text-slate-500">Responsável: {deal.owner}</span>
                <select
                  value={deal.stage}
                  onChange={(event) => move(deal.id, event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-blue-700"
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-2xl bg-blue-100 p-4 text-blue-700">
          <Icon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-bold text-blue-700">{company}</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-xl text-slate-500">{description}</p>
        <button
          onClick={() => say(`${action} aberto.`)}
          className="mt-7 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
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
    role: AccessRole;
    status: "Ativo" | "Inativo";
  };
  const defaultMembers = (business: string): Member[] => [
    {
      id: "owner",
      name: "Responsável pela empresa",
      email: `${business.toLowerCase().replace(/\s/g, ".")}@empresa.com`,
      role: "owner",
      status: "Ativo",
    },
    {
      id: "operator-1",
      name: "Ana Martins",
      email: "ana@empresa.com",
      role: "operator",
      status: "Ativo",
    },
    {
      id: "operator-2",
      name: "Carlos Lima",
      email: "carlos@empresa.com",
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
  const [newRole, setNewRole] = useState<AccessRole>("operator");
  const canCreate = currentRole !== "operator";
  const allowedRoles: AccessRole[] =
    currentRole === "super_admin" ? ["owner", "operator"] : ["operator"];
  useEffect(() => {
    const saved = window.localStorage.getItem(`nd7:team:${company}`);
    setMembers(saved ? (JSON.parse(saved) as Member[]) : defaultMembers(company));
    setShowForm(false);
    setName("");
    setEmail("");
    setNewRole(currentRole === "super_admin" ? "owner" : "operator");
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
    if (!allowedRoles.includes(newRole)) {
      say("Seu nível de acesso não permite criar este perfil.");
      return;
    }
    persist([
      ...members,
      {
        id: `${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: newRole,
        status: "Ativo",
      },
    ]);
    setName("");
    setEmail("");
    setNewRole(currentRole === "super_admin" ? "owner" : "operator");
    setShowForm(false);
    say(`${roleLabel[newRole]} criado e convite preparado.`);
  };
  const canManage = (member: Member) => currentRole === "super_admin" || member.role === "operator";
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
          <p className="text-sm text-slate-500">{company} · Gestão de acessos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Equipe e permissões</h1>
          <p className="mt-1 text-sm text-slate-500">
            Convide as pessoas certas com o nível de acesso adequado.
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setShowForm((open) => !open)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Plus className="mr-1 inline h-4 w-4" /> Criar acesso
          </button>
        ) : (
          <span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500">
            Operadores não podem criar acessos
          </span>
        )}
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {[
          [
            "Super Admin",
            "Acesso absoluto à plataforma e às empresas. Perfil exclusivo.",
            "super_admin",
          ],
          ["Dono", "Responsável pela assinatura e pela criação de operadores.", "owner"],
          ["Operador", "Usa os módulos da empresa no dia a dia, sem criar acessos.", "operator"],
        ].map(([title, description, role]) => (
          <article
            key={title}
            className={`rounded-2xl border p-4 ${role === "super_admin" ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white"}`}
          >
            <span
              className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${roleStyle[role as AccessRole]}`}
            >
              {title}
            </span>
            <p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
      {showForm && canCreate && (
        <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Criar novo acesso</h2>
              <p className="mt-1 text-sm text-slate-600">
                {currentRole === "super_admin"
                  ? "Você pode criar Donos e Operadores."
                  : "Como Dono, você pode criar somente Operadores."}
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_180px_auto]">
            <label className="text-xs font-bold text-slate-700">
              Nome
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Nível de acesso
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value as AccessRole)}
                className="mt-1.5 w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={invite}
              className="self-end rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Criar
            </button>
          </div>
        </section>
      )}
      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold">Pessoas com acesso</h2>
            <p className="mt-1 text-xs text-slate-500">
              {members.filter((member) => member.status === "Ativo").length} acessos ativos
            </p>
          </div>
          <UsersRound className="h-5 w-5 text-blue-600" />
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                {member.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-[190px] flex-1">
                <b className="block text-sm">{member.name}</b>
                <span className="text-xs text-slate-500">{member.email}</span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${roleStyle[member.role]}`}
              >
                {roleLabel[member.role]}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
              >
                {member.status}
              </span>
              {canManage(member) ? (
                <button
                  onClick={() => changeStatus(member)}
                  className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {member.status === "Ativo" ? "Inativar" : "Ativar"}
                </button>
              ) : (
                <span className="ml-auto text-xs text-slate-400">Gerenciado pelo Super Admin</span>
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
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
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
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
      <span>
        <b className="block text-sm text-slate-800">{label}</b>
        <small className="mt-1 block max-w-lg text-xs leading-5 text-slate-500">
          {description}
        </small>
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={() => toggle(setting)}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" />
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
          <p className="text-sm text-slate-500">Administração da empresa</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ajuste como o ND7 trabalha para a sua operação.
          </p>
        </div>
        <button
          onClick={save}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <Check className="mr-1 inline h-4 w-4" /> Salvar alterações
        </button>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${tab === id ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
          <div className="hidden border-t border-slate-100 px-3 pt-5 text-xs leading-5 text-slate-500 lg:block">
            As alterações ficam salvas neste dispositivo nesta versão demonstrativa.
          </div>
        </nav>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {tab === "empresa" && (
            <>
              <span className="inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Building2 className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold">Dados da empresa</h2>
              <p className="mt-2 text-sm text-slate-500">
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
                  <label key={key} className="text-sm font-bold text-slate-700">
                    {label}
                    <input
                      value={form[key as keyof SettingsData] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [key]: event.target.value }))
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
              <span className="inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Workflow className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold">Processo comercial</h2>
              <p className="mt-2 text-sm text-slate-500">
                Defina preferências que orientam a rotina da sua equipe.
              </p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">
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
                <label className="text-sm font-bold text-slate-700">
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
                <label className="text-sm font-bold text-slate-700">
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
                <label className="text-sm font-bold text-slate-700">
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
              <span className="inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
                <MessageSquareText className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold">Notificações e alertas</h2>
              <p className="mt-2 text-sm text-slate-500">
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
              <span className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold">Segurança da conta</h2>
              <p className="mt-2 text-sm text-slate-500">
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
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <b className="text-sm">Sessão atual</b>
                    <p className="mt-1 text-xs text-slate-500">Este dispositivo · acesso atual</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Ativa
                  </span>
                </div>
              </div>
              <button
                onClick={() => say("As demais sessões foram encerradas nesta demonstração.")}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
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
  const [connected, setConnected] = useState(false);
  const connect = () => {
    setConnecting(true);
    window.setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      say("Canal WhatsApp conectado no modo demonstração.");
    }, 900);
  };
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <span className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <MessageSquareText className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm font-bold text-blue-700">{company}</p>
          <h1 className="mt-2 text-2xl font-bold">Conecte seu WhatsApp</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Conecte um número para centralizar conversas, responder clientes e disparar campanhas
            diretamente pelo ND7.
          </p>
          {connected ? (
            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                WhatsApp conectado
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-700">
                Canal pronto para mensagens individuais, automações e campanhas.
              </p>
              <button
                onClick={() => say("Configurações do canal abertas.")}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"
              >
                Gerenciar canal
              </button>
            </div>
          ) : (
            <div className="mt-7">
              <button
                onClick={connect}
                disabled={connecting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 disabled:opacity-70"
              >
                {connecting ? "Gerando QR Code..." : "Conectar WhatsApp"}
              </button>
              <p className="mt-3 text-xs text-slate-500">
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
              <div key={number} className="rounded-2xl bg-slate-50 p-4">
                <b className="text-blue-600">{number}</b>
                <p className="mt-2 text-xs font-semibold text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-3xl bg-[#111827] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Integração Evolution
          </p>
          <h2 className="mt-3 text-xl font-bold">Conexão preparada para sua API.</h2>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            As credenciais da Evolution devem ficar protegidas no backend, nunca nesta tela ou no
            navegador.
          </p>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
            {[
              "Conexão por QR Code",
              "Envio individual e em massa",
              "Automação por contatos e segmentos",
              "Histórico centralizado no CRM",
            ].map((item) => (
              <p key={item} className="flex gap-2 text-sm text-blue-100">
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
          <p className="text-sm font-bold text-blue-700">{company}</p>
          <h1 className="mt-1 text-2xl font-bold">Gerenciador de Mensagens</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie conversas, campanhas e automações para os seus contatos.
          </p>
        </div>
        <button
          onClick={() => say("Campanha salva como rascunho.")}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          <Send className="mr-1 inline h-4 w-4" />
          Salvar campanha
        </button>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              ["individual", "Mensagem individual"],
              ["mass", "Envio em massa"],
              ["automation", "Automação"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${mode === id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Destinatários
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {contacts.map((contact) => (
                <button
                  key={contact}
                  onClick={() => toggleContact(contact)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm ${selected.includes(contact) ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
                >
                  <span>{contact}</span>
                  {selected.includes(contact) && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-7 block text-xs font-bold uppercase tracking-widest text-slate-400">
            Mensagem
            <textarea
              className="mt-3 min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              defaultValue={
                mode === "automation"
                  ? "Olá, {{nome}}! Vimos que você demonstrou interesse. Posso ajudar?"
                  : "Olá, {{nome}}! Temos uma novidade para você."
              }
            />
          </label>
          <div className="mt-5 flex flex-wrap justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            <span>{selected.length} contato(s) selecionado(s)</span>
            <button
              onClick={() =>
                say(
                  `${mode === "automation" ? "Automação" : "Mensagem"} agendada para ${selected.length} contato(s).`,
                )
              }
              className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white"
            >
              {mode === "automation" ? "Ativar automação" : "Enviar mensagem"}
            </button>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-3xl bg-[#111827] p-6 text-white">
            <Zap className="h-6 w-6 text-yellow-300" />
            <h2 className="mt-4 text-lg font-bold">Envie com contexto.</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Use campos como <b>{"{{nome}}"}</b> para personalizar cada mensagem e mantenha a
              conversa humana, mesmo em escala.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Boas práticas</h2>
            {[
              "Envie apenas para contatos com consentimento",
              "Evite disparos repetidos",
              "Personalize a primeira linha",
              "Acompanhe respostas no CRM",
            ].map((item) => (
              <p key={item} className="mt-4 flex gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
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
          <p className="text-sm text-slate-500">Conta e cobrança</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Minha Assinatura</h1>
          <p className="mt-1 text-sm text-slate-500">
            {company} · Acompanhe seu plano atual e todo o histórico da sua empresa.
          </p>
        </div>
        <button
          onClick={checkout}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Gerenciar assinatura
        </button>
      </div>
      <section className="mt-7 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-xl shadow-blue-100">
        <div className="bg-gradient-to-r from-[#071a3d] to-[#0d6efd] p-6 text-white md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                ASSINATURA ATIVA
              </p>
              <h2 className="mt-5 text-2xl font-bold">ND7 Profissional</h2>
              <p className="mt-2 text-sm text-blue-100">
                Sua operação está protegida e com acesso total aos recursos do plano.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs text-blue-100">Próxima renovação</p>
              <b className="mt-1 block text-lg">26 de setembro de 2026</b>
              <p className="mt-1 text-xs text-emerald-200">Cobrança em dia</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-3 md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Periodicidade
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800">Mensal</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status atual
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Ativa e regular
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Forma de pagamento
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800">Cartão de crédito</p>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-600 md:px-8">
          <LockKeyhole className="mr-2 inline h-4 w-4 text-blue-600" />
          Seu acesso permanece liberado enquanto a assinatura estiver ativa e os pagamentos em dia.
        </div>
      </section>
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Histórico de assinaturas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registro de todos os ciclos e alterações da sua assinatura.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            3 registros
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400">
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
                <tr key={item[2]} className="border-t border-slate-100 text-sm">
                  <td className="py-4 font-semibold">{item[0]}</td>
                  <td>{item[1]}</td>
                  <td className="text-slate-500">{item[2]}</td>
                  <td className="text-slate-500">{item[3]}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item[5]}`}>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</span>
      </div>
      <b className="mt-5 block text-2xl tracking-tight">{value}</b>
      <p className="mt-2 text-xs text-emerald-600">
        ↑ {trend} <span className="text-slate-400">vs. mês anterior</span>
      </p>
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
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Terça-feira, 26 de agosto</p>
          <h1 className="mt-1 text-2xl font-bold">
            {company} <span className="text-blue-500">✦</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Aqui está o resumo da operação demonstrativa.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={admin}
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700"
          >
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            Super Admin
          </button>
          <button
            onClick={() => say("Formulário de novo contato aberto.")}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
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
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Funil de vendas</h2>
          <p className="mt-1 text-xs text-slate-500">Acompanhe seus negócios por etapa</p>
          <div className="mt-5 grid min-w-[600px] grid-cols-3 gap-3 overflow-x-auto">
            {["Qualificação", "Proposta enviada", "Negociação"].map((title, i) => (
              <div key={title} className="rounded-xl bg-slate-50 p-3">
                <div className="flex justify-between text-xs font-bold">
                  {title}
                  <span className="text-slate-400">{6 - i}</span>
                </div>
                <div className="mt-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                  <b className="text-xs">
                    {["Contrato corporativo", "Projeto de expansão", "Consultoria mensal"][i]}
                  </b>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {["Clínica Horizonte", "Almeida & Costa", "Núcleo Engenharia"][i]}
                  </p>
                  <p className="mt-3 text-xs font-bold">
                    {["R$ 24.000", "R$ 18.500", "R$ 8.200"][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Atividades</h2>
          <p className="mt-1 text-xs text-slate-500">Próximos compromissos</p>
          {[
            ["10:00", "Reunião de apresentação", "Almeida & Costa"],
            ["14:30", "Follow-up de proposta", "Núcleo Engenharia"],
            ["16:00", "Onboarding de cliente", "Clínica Horizonte"],
          ].map((a) => (
            <div key={a[0]} className="mt-5 flex gap-3">
              <b className="text-xs text-slate-400">{a[0]}</b>
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium">{a[1]}</p>
                <p className="text-xs text-slate-400">{a[2]}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
function Admin({ open, say }: { open: (company: string) => void; say: (s: string) => void }) {
  const [filter, setFilter] = useState("Todos");
  const rows = filter === "Todos" ? businesses : businesses.filter((x) => x[3] === filter);
  return (
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#071a3d] to-blue-700 p-6 text-white">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
              ♛ Área restrita
            </p>
            <h1 className="mt-3 text-2xl font-bold">Central Super Admin</h1>
            <p className="mt-1 text-sm text-blue-100">
              Visão global da plataforma, assinaturas e empresas.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-right">
            <small className="text-blue-200">Receita recorrente mensal</small>
            <b className="block text-xl">R$ 16.842</b>
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
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-semibold">Assinantes e empresas</h2>
            <p className="mt-1 text-xs text-slate-500">
              Gerencie acessos, cobrança e dados cadastrais.
            </p>
          </div>
          <button
            onClick={() =>
              say("O cliente deverá concluir o checkout para criar o acesso automaticamente.")
            }
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            <Plus className="mr-1 inline h-4 w-4" />
            Novo assinante
          </button>
        </div>
        <div className="flex gap-2 p-5 pb-0">
          {["Todos", "Ativa", "Pendente", "Expirada"].map((f) => (
            <button
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === f ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[760px] text-left">
            <thead className="text-[11px] uppercase text-slate-400">
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
                <tr key={x[0]} className="border-t border-slate-100 text-sm">
                  <td className="py-4">
                    <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                      {x[5]}
                    </span>
                    <span>
                      <b>{x[0]}</b>
                      <small className="ml-2 text-slate-400">{x[1]}</small>
                    </span>
                  </td>
                  <td>{x[2]}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${x[3] === "Ativa" ? "bg-emerald-50 text-emerald-700" : x[3] === "Pendente" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}
                    >
                      {x[3]}
                    </span>
                  </td>
                  <td>{x[4]}</td>
                  <td className="font-mono text-xs text-slate-400">nxs-{x[5].toLowerCase()}74f</td>
                  <td>
                    <button
                      onClick={() => open(x[0])}
                      className="rounded-lg border px-2.5 py-1.5 text-xs font-bold text-blue-700"
                    >
                      Acessar empresa
                    </button>
                    <button
                      onClick={() => say(`Opções de ${x[0]} abertas.`)}
                      className="ml-1 p-2 text-slate-400"
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
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button onClick={back} className="mb-12 text-sm font-medium text-blue-600">
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold">Que bom ter você de volta.</h1>
          <p className="mt-2 text-sm text-slate-500">Entre para acessar sua empresa.</p>
          {["E-mail", "Senha"].map((x, i) => (
            <label className="mt-5 block text-xs font-bold">
              {x}
              <input
                type={i ? "password" : "email"}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
                placeholder={i ? "••••••••" : "voce@empresa.com"}
              />
            </label>
          ))}
          <button
            onClick={enter}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
          >
            Entrar na minha conta
          </button>
          <button className="mt-4 w-full text-sm text-blue-600">Esqueci minha senha</button>
        </div>
      </div>
    </div>
  );
}
function Checkout({ back, done }: { back: () => void; done: () => void }) {
  const [payment, setPayment] = useState("card");
  const [cycle, setCycle] = useState("Mensal");
  const [cep, setCep] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepMessage, setCepMessage] = useState("");
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
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
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
    return digits.length <= 11
      ? digits.replace(/(\d{3})(\d)/g, "$1.").replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      : digits
          .replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/\.(\d{3})(\d)/, ".$1/$2")
          .replace(/(\d{4})(\d)/, "$1-$2");
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
          <button
            onClick={back}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white hover:text-blue-700"
          >
            ← Voltar para a oferta
          </button>
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
                {["Nome completo", "E-mail de acesso", "Nome da empresa"].map((label, i) => (
                  <label
                    key={label}
                    className={`text-xs font-bold ${i === 2 ? "md:col-span-2" : ""}`}
                  >
                    {label}
                    <input type={label.includes("E-mail") ? "email" : "text"} className={input} />
                  </label>
                ))}
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
                    inputMode="numeric"
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
                  <input inputMode="numeric" className={input} />
                </label>
                <label className="text-xs font-bold md:col-span-2">
                  Complemento
                  <input className={input} />
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
                  onClick={() => setPayment("card")}
                  className={`rounded-2xl border p-4 text-left ${payment === "card" ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <b className="ml-2 text-sm">Cartão de crédito</b>
                  <p className="mt-2 text-xs text-slate-500">Cobrança recorrente automática</p>
                </button>
                <button
                  onClick={() => setPayment("pix")}
                  className={`rounded-2xl border p-4 text-left ${payment === "pix" ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <b className="text-sm text-emerald-600">PIX</b>
                  <p className="mt-2 text-xs text-slate-500">
                    Disponível para o primeiro pagamento
                  </p>
                </button>
                <button
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
                  <div className="relative aspect-[1.58/1] overflow-hidden rounded-2xl bg-gradient-to-br from-[#071a3d] via-blue-700 to-sky-500 p-5 text-white shadow-xl shadow-blue-200">
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                    <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-cyan-300/20" />
                    <div className="relative flex items-start justify-between">
                      <span className="text-xs font-black tracking-[.22em]">ND7</span>
                      <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-black uppercase">
                        {cardBrand}
                      </span>
                    </div>
                    <div className="relative mt-8 h-8 w-11 rounded-md border border-amber-100/50 bg-gradient-to-br from-amber-100 to-amber-400" />
                    <p className="relative mt-5 font-mono text-sm tracking-[.14em]">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="relative mt-5 flex items-end justify-between">
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
                  Um QR Code PIX será gerado na próxima etapa.
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Um boleto bancário será gerado na próxima etapa. O acesso será liberado após a
                  confirmação do pagamento pela Asaas.
                </div>
              )}
            </div>
            <button
              onClick={done}
              className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
            >
              Continuar para pagamento seguro <LockKeyhole className="ml-2 inline h-4 w-4" />
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
