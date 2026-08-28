import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, X } from "lucide-react";

export type Buyer = {
  name: string;
  location: string;
  plan: string;
  timeAgo: string;
  avatarGradient: string;
};

const buyersList: Buyer[] = [
  { name: "Rodrigo Silva", location: "São Paulo, SP", plan: "Plano Anual", timeAgo: "há 2 segundos", avatarGradient: "from-blue-500 to-indigo-600" },
  { name: "Mariana Costa", location: "Belo Horizonte, MG", plan: "Plano Trimestral", timeAgo: "há 4 segundos", avatarGradient: "from-emerald-500 to-teal-600" },
  { name: "Gabriel Santos", location: "Curitiba, PR", plan: "Plano Mensal", timeAgo: "há 3 segundos", avatarGradient: "from-indigo-500 to-purple-600" },
  { name: "Camila Oliveira", location: "Rio de Janeiro, RJ", plan: "Plano Anual", timeAgo: "há 6 segundos", avatarGradient: "from-violet-500 to-fuchsia-600" },
  { name: "Felipe Almeida", location: "Florianópolis, SC", plan: "Plano Semestral", timeAgo: "há 5 segundos", avatarGradient: "from-cyan-500 to-blue-600" },
  { name: "Juliana Rocha", location: "Porto Alegre, RS", plan: "Plano Anual", timeAgo: "agora mesmo", avatarGradient: "from-rose-500 to-pink-600" },
  { name: "Lucas Ferreira", location: "Goiânia, GO", plan: "Plano Trimestral", timeAgo: "há 7 segundos", avatarGradient: "from-amber-500 to-orange-600" },
  { name: "Beatriz Lima", location: "Campinas, SP", plan: "Plano Mensal", timeAgo: "há 3 segundos", avatarGradient: "from-teal-500 to-emerald-600" },
  { name: "Thiago Mendes", location: "Salvador, BA", plan: "Plano Anual", timeAgo: "há 5 segundos", avatarGradient: "from-blue-600 to-cyan-600" },
  { name: "Larissa Carvalho", location: "Brasília, DF", plan: "Plano Semestral", timeAgo: "há 4 segundos", avatarGradient: "from-sky-500 to-indigo-600" },
  { name: "Rafael Barbosa", location: "Fortaleza, CE", plan: "Plano Trimestral", timeAgo: "há 2 segundos", avatarGradient: "from-emerald-600 to-green-700" },
  { name: "Fernanda Souza", location: "Recife, PE", plan: "Plano Anual", timeAgo: "agora mesmo", avatarGradient: "from-purple-500 to-pink-600" },
  { name: "Diego Martins", location: "Vitória, ES", plan: "Plano Mensal", timeAgo: "há 6 segundos", avatarGradient: "from-blue-500 to-sky-600" },
  { name: "Aline Duarte", location: "Ribeirão Preto, SP", plan: "Plano Anual", timeAgo: "há 5 segundos", avatarGradient: "from-pink-500 to-rose-600" },
  { name: "Bruno Cavalcanti", location: "Manaus, AM", plan: "Plano Semestral", timeAgo: "há 7 segundos", avatarGradient: "from-green-500 to-teal-600" },
  { name: "Isabela Freitas", location: "Santos, SP", plan: "Plano Trimestral", timeAgo: "há 3 segundos", avatarGradient: "from-indigo-600 to-violet-600" },
  { name: "Eduardo Nunes", location: "Joinville, SC", plan: "Plano Anual", timeAgo: "há 4 segundos", avatarGradient: "from-blue-600 to-slate-700" },
  { name: "Priscila Ramos", location: "Londrina, PR", plan: "Plano Mensal", timeAgo: "há 2 segundos", avatarGradient: "from-teal-600 to-cyan-700" },
  { name: "Gustavo Moreira", location: "Campo Grande, MS", plan: "Plano Anual", timeAgo: "há 6 segundos", avatarGradient: "from-amber-600 to-yellow-600" },
  { name: "Vanessa Ribeiro", location: "Sorocaba, SP", plan: "Plano Semestral", timeAgo: "há 5 segundos", avatarGradient: "from-fuchsia-600 to-purple-700" },
];

export function RecentBuyersPopup() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (isDismissed) return;

    let displayTimeout: NodeJS.Timeout;
    let nextPopupTimeout: NodeJS.Timeout;

    // 1. Início com 4 segundos de página aberta
    const initialTimer = setTimeout(() => {
      showNextBuyer(0);
    }, 4000);

    function showNextBuyer(index: number) {
      setCurrentIndex(index);
      setIsVisible(true);

      // Duração de 3 segundos visível
      displayTimeout = setTimeout(() => {
        setIsVisible(false);

        // Intervalo de 3 segundos antes do próximo
        nextPopupTimeout = setTimeout(() => {
          const nextIdx = (index + 1) % buyersList.length;
          showNextBuyer(nextIdx);
        }, 3000);
      }, 3000);
    }

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(displayTimeout);
      clearTimeout(nextPopupTimeout);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentBuyer = buyersList[currentIndex] ?? buyersList[0]!;
  const initials = currentBuyer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 right-4 z-50 w-auto sm:bottom-5 sm:left-5 sm:right-auto sm:w-[325px] transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      {/* Container Estilo Lovable (Dark Glassmorphism com borda sutil e glow) */}
      <div className="relative group flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-[#090d16]/90 p-2.5 sm:p-3 shadow-2xl shadow-blue-950/50 backdrop-blur-xl text-left text-white ring-1 ring-black/40">
        
        {/* Glow de fundo sutil */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-70 blur-sm pointer-events-none" />

        {/* Avatar com Degradê e Badge de Verificado */}
        <div className="relative flex-shrink-0">
          <div
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl font-black text-white shadow-md bg-gradient-to-br ${currentBuyer.avatarGradient} text-xs`}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[#090d16]">
            <CheckCircle2 className="h-2.5 w-2.5" />
          </span>
        </div>

        {/* Informações do Comprador */}
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-bold text-slate-100">
              {currentBuyer.name}
            </p>
            <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap">
              • {currentBuyer.timeAgo}
            </span>
          </div>

          <p className="truncate text-[10px] text-slate-400 leading-tight">
            {currentBuyer.location}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
              <Sparkles className="h-2 w-2 text-blue-400" />
              {currentBuyer.plan}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400/90 font-medium">
              <ShieldCheck className="h-2.5 w-2.5" />
              Verificado
            </span>
          </div>
        </div>

        {/* Botão Fechar Discreto */}
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Fechar notificação"
          className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
