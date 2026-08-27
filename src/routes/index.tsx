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
  Crown,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MapPin,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({ component: Nexus });
type View = "landing" | "crm" | "admin" | "login" | "checkout" | "subscription";
const businesses = [
  ["Almeida & Costa", "Mariana Almeida", "Profissional", "Ativa", "R$ 297", "AC"],
  ["Núcleo Engenharia", "Rafael Nunes", "Essencial", "Pendente", "R$ 147", "NE"],
  ["Clínica Horizonte", "Ana Clara", "Profissional", "Ativa", "R$ 297", "CH"],
  ["Studio Mosaico", "Pedro Lima", "Empresarial", "Expirada", "R$ 597", "SM"],
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
    [notice, setNotice] = useState("");
  const say = (t: string) => {
    setNotice(t);
    setTimeout(() => setNotice(""), 2800);
  };
  if (view === "landing")
    return <Landing access={() => setView("login")} start={() => setView("checkout")} />;
  if (view === "login")
    return <Login back={() => setView("landing")} enter={() => setView("crm")} />;
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
        <Sidebar view={view} setView={setView} menu={menu} setMenu={setMenu} />
        <main className="min-h-screen min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
            <div className="flex items-center gap-4">
              <button className="md:hidden" onClick={() => setMenu(true)}>
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
          {view === "admin" ? (
            <Admin
              open={() => {
                setView("crm");
                say("Visualizando a empresa como Super Admin.");
              }}
              say={say}
            />
          ) : view === "subscription" ? (
            <MySubscription checkout={() => setView("checkout")} />
          ) : (
            <Dashboard admin={() => setView("admin")} say={say} />
          )}
        </main>
      </div>
    </div>
  );
}

function Landing({ access, start }: { access: () => void; start: () => void }) {
  const wa =
    "https://wa.me/5585920109136?text=" +
    encodeURIComponent("Olá! Quero conhecer o ND7 e transformar a gestão da minha empresa.");
  const [cycle, setCycle] = useState("Mensal");
  const cycles = ["Mensal", "Trimestral", "Semestral", "Anual"];
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
            Transforme cada conversa em <span className="gradient-text">crescimento.</span>
          </h1>
          <p className="reveal delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            O ND7 reúne clientes, vendas, equipe e processos em um só lugar — para sua empresa
            vender melhor, sem perder o que importa.
          </p>
          <div className="reveal delay-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#planos"
              className="group rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-blue-300"
            >
              Ver oferta{" "}
              <ArrowRight className="ml-2 inline h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#planos"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              Conhecer a oferta
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
      <section className="border-y border-slate-200 bg-white px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Flexível por natureza
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Um CRM que se adapta ao seu modelo de negócio.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Serviços, vendas consultivas, imobiliárias, clínicas, equipes comerciais ou operações
              internas: comece com o essencial e evolua no seu ritmo.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Vendas consultivas", "Serviços e agências", "Saúde e bem-estar", "Equipes B2B"].map(
              (item) => (
                <div
                  key={item}
                  className="group rounded-2xl border border-slate-200 bg-[#ffffff] p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                    ND7
                  </span>
                  <p className="mt-5 text-sm font-bold">{item}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Estruture relações, oportunidades e acompanhamento em um único fluxo.
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
      <section id="planos" className="mx-auto max-w-6xl px-5 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Planos transparentes
        </p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Estrutura para o seu próximo nível.</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Escolha a frequência que faz sentido para sua operação. Os valores serão publicados em
          breve, sem alterar a estrutura do seu plano.
        </p>
        <div className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {cycles.map((item) => (
            <button
              key={item}
              onClick={() => setCycle(item)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${cycle === item ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}
            >
              {item}
              {item === "Anual" && (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] text-emerald-700">
                  melhor custo
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-7 grid max-w-4xl gap-5 text-left md:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border-2 border-blue-500 bg-white p-7 shadow-xl shadow-blue-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  Plano ND7
                </span>
                <h3 className="mt-4 text-2xl font-bold">Profissional</h3>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {cycle}
              </span>
            </div>
            <p className="mt-5 text-sm text-slate-500">Valor em definição</p>
            <p className="mt-1 text-3xl font-black tracking-tight">Consulte em breve</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Todas as ferramentas centrais para organizar clientes, vendas e time desde o primeiro
              dia.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Contatos e negócios ilimitados",
                "Funis personalizados",
                "Automação de processos",
                "Equipe e permissões",
                "Painel de indicadores",
                "Suporte especializado",
              ].map((x) => (
                <p key={x} className="text-sm text-slate-700">
                  <Check className="mr-2 inline h-4 w-4 text-blue-600" />
                  {x}
                </p>
              ))}
            </div>
            <button
              onClick={start}
              className="mt-7 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg"
            >
              Quero este plano
            </button>
          </div>
          <aside className="rounded-3xl bg-[#111827] p-7 text-white">
            <Sparkles className="h-6 w-6 text-blue-300" />
            <h3 className="mt-5 text-xl font-bold">Cresça com previsibilidade.</h3>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              Você poderá escolher mensal, trimestral, semestral ou anual. Quando os valores forem
              definidos, cada período será apresentado de forma clara no checkout.
            </p>
            <div className="mt-7 border-t border-white/10 pt-5 text-sm text-blue-100">
              <Check className="mr-2 inline h-4 w-4 text-emerald-300" />
              Sem surpresa na cobrança
              <br />
              <Check className="mr-2 mt-3 inline h-4 w-4 text-emerald-300" />
              Gestão centralizada da assinatura
            </div>
          </aside>
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
                "Sim. A contratação estará disponível nas modalidades mensal, trimestral, semestral e anual assim que os valores forem publicados.",
              ],
              [
                "Como funciona a criação de acesso?",
                "Após a aprovação do pagamento, o sistema cria o acesso da empresa e envia as instruções de entrada por e-mail.",
              ],
              [
                "Minha equipe poderá usar o sistema?",
                "Sim. O plano inclui gestão de equipe e permissões para que cada pessoa tenha o nível de acesso adequado.",
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
}: {
  view: View;
  setView: (v: View) => void;
  menu: boolean;
  setMenu: (b: boolean) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111827] p-4 text-slate-300 transition-transform md:static ${menu ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="flex items-center gap-3 px-2">
        <Logo />
        <div>
          <b className="text-white">ND7</b>
          <small className="block text-[9px] uppercase tracking-[.18em] text-blue-300">
            CRM inteligente
          </small>
        </div>
        <button className="ml-auto md:hidden" onClick={() => setMenu(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Visão geral
      </p>
      <Nav
        icon={<LayoutDashboard />}
        label="Painel"
        active={view === "crm"}
        action={() => setView("crm")}
      />
      <Nav icon={<ContactRound />} label="Contatos" />
      <Nav icon={<ClipboardList />} label="Negócios" />
      <Nav icon={<CalendarDays />} label="Agenda" />
      <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Gerenciar
      </p>
      <Nav icon={<UsersRound />} label="Equipe" />
      <Nav
        icon={<CircleDollarSign />}
        label="Minha Assinatura"
        active={view === "subscription"}
        action={() => setView("subscription")}
      />
      <Nav icon={<Settings />} label="Configurações" />
      <div className="mt-auto rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3">
        <Crown className="h-4 w-4 text-blue-300" />
        <b className="mt-2 block text-xs text-white">Plano Profissional</b>
        <p className="mt-1 text-[11px] text-slate-400">Tudo para sua operação crescer.</p>
        <button
          onClick={() => setView("subscription")}
          className="mt-3 w-full rounded-lg bg-blue-500 py-2 text-xs font-bold text-white"
        >
          Gerenciar plano
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
      className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-blue-600 text-white" : "hover:bg-white/5 hover:text-white"}`}
    >
      <span className="h-4 w-4">{icon}</span>
      {label}
    </button>
  );
}
function MySubscription({ checkout }: { checkout: () => void }) {
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
            Acompanhe seu plano atual e todo o histórico da sua empresa.
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
function Dashboard({ admin, say }: { admin: () => void; say: (s: string) => void }) {
  return (
    <div className="mx-auto max-w-[1440px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Terça-feira, 26 de agosto</p>
          <h1 className="mt-1 text-2xl font-bold">
            Bom dia, Daniel <span className="text-blue-500">✦</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Aqui está o resumo da sua operação.</p>
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
function Admin({ open, say }: { open: () => void; say: (s: string) => void }) {
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
        <Card label="Empresas ativas" value="56" trend="8,1%" icon={<Building2 />} />
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
                      onClick={open}
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
  const input =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  return (
    <div className="min-h-screen bg-[#f6f5fb] px-5 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
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
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
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
            <p className="mt-8 text-xs font-bold uppercase tracking-widest text-blue-600">
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
                {[
                  ["Nome completo", "Como devemos chamar você?"],
                  ["E-mail de acesso", "voce@empresa.com"],
                  ["Celular / WhatsApp", "(00) 00000-0000"],
                  ["CPF ou CNPJ", "000.000.000-00"],
                  ["Nome da empresa", "Como sua empresa será identificada no ND7?"],
                ].map(([label, placeholder], i) => (
                  <label
                    key={label}
                    className={`text-xs font-bold ${i === 4 ? "md:col-span-2" : ""}`}
                  >
                    {label}
                    <input
                      type={label.includes("E-mail") ? "email" : "text"}
                      placeholder={placeholder}
                      className={input}
                    />
                  </label>
                ))}
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
                {[
                  ["CEP", "00000-000", "md:col-span-2"],
                  ["Rua / Avenida", "Informe seu endereço", "md:col-span-4"],
                  ["Número", "000", "md:col-span-2"],
                  ["Complemento", "Sala, bloco, apto...", "md:col-span-2"],
                  ["Bairro", "Seu bairro", "md:col-span-2"],
                  ["Cidade", "Sua cidade", "md:col-span-3"],
                  ["Estado", "Selecione", "md:col-span-3"],
                ].map(([label, placeholder, span]) => (
                  <label key={label} className={`text-xs font-bold ${span}`}>
                    {label}
                    {label === "Estado" ? (
                      <select className={input} defaultValue="">
                        <option value="" disabled>
                          Selecione o estado
                        </option>
                        {[
                          "AC",
                          "AL",
                          "AP",
                          "AM",
                          "BA",
                          "CE",
                          "DF",
                          "ES",
                          "GO",
                          "MA",
                          "MG",
                          "PA",
                          "PE",
                          "PR",
                          "RJ",
                          "RS",
                          "SC",
                          "SP",
                        ].map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </select>
                    ) : (
                      <input placeholder={placeholder} className={input} />
                    )}
                  </label>
                ))}
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
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
              </div>
              {payment === "card" ? (
                <div className="mt-5 grid gap-4 md:grid-cols-6">
                  {[
                    ["Nome impresso no cartão", "Nome como está no cartão", "md:col-span-6"],
                    ["Número do cartão", "0000 0000 0000 0000", "md:col-span-6"],
                    ["Validade", "MM/AA", "md:col-span-3"],
                    ["CVV", "000", "md:col-span-3"],
                  ].map(([label, placeholder, span]) => (
                    <label key={label} className={`text-xs font-bold ${span}`}>
                      {label}
                      <input placeholder={placeholder} className={input} />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  Um QR Code PIX será gerado na próxima etapa.
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
          </section>
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl bg-[#111827] text-white shadow-2xl">
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
              </div>
              <div className="p-6">
                <label className="text-xs font-bold text-blue-200">
                  Periodicidade
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none"
                  >
                    <option className="text-slate-900">Mensal</option>
                    <option className="text-slate-900">Trimestral</option>
                    <option className="text-slate-900">Semestral</option>
                    <option className="text-slate-900">Anual</option>
                  </select>
                </label>
                <hr className="my-6 border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Plano Profissional</span>
                  <b>{cycle}</b>
                </div>
                <div className="mt-5 flex justify-between">
                  <span className="text-sm text-blue-100">Valor da assinatura</span>
                  <b className="text-right">
                    A definir
                    <small className="block text-[10px] font-normal text-blue-200">
                      antes do pagamento
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
                    Compra protegida
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-blue-100">
                    O acesso só é criado após aprovação da Asaas.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
