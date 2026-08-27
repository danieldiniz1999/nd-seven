import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, X } from "lucide-react";

export type Buyer = {
  name: string;
  location: string;
  plan: string;
  timeAgo: string;
  avatarColor: string;
};

const buyersList: Buyer[] = [
  { name: "Rodrigo Silva", location: "São Paulo, SP", plan: "Plano Anual", timeAgo: "há 2 minutos", avatarColor: "bg-blue-600" },
  { name: "Mariana Costa", location: "Belo Horizonte, MG", plan: "Plano Trimestral", timeAgo: "há 4 minutos", avatarColor: "bg-emerald-600" },
  { name: "Gabriel Santos", location: "Curitiba, PR", plan: "Plano Mensal", timeAgo: "há 6 minutos", avatarColor: "bg-indigo-600" },
  { name: "Camila Oliveira", location: "Rio de Janeiro, RJ", plan: "Plano Anual", timeAgo: "há 8 minutos", avatarColor: "bg-purple-600" },
  { name: "Felipe Almeida", location: "Florianópolis, SC", plan: "Plano Semestral", timeAgo: "há 11 minutos", avatarColor: "bg-sky-600" },
  { name: "Juliana Rocha", location: "Porto Alegre, RS", plan: "Plano Anual", timeAgo: "há 14 minutos", avatarColor: "bg-rose-600" },
  { name: "Lucas Ferreira", location: "Goiânia, GO", plan: "Plano Trimestral", timeAgo: "há 17 minutos", avatarColor: "bg-amber-600" },
  { name: "Beatriz Lima", location: "Campinas, SP", plan: "Plano Mensal", timeAgo: "há 19 minutos", avatarColor: "bg-teal-600" },
  { name: "Thiago Mendes", location: "Salvador, BA", plan: "Plano Anual", timeAgo: "há 22 minutos", avatarColor: "bg-blue-700" },
  { name: "Larissa Carvalho", location: "Brasília, DF", plan: "Plano Semestral", timeAgo: "há 25 minutos", avatarColor: "bg-cyan-600" },
  { name: "Rafael Barbosa", location: "Fortaleza, CE", plan: "Plano Trimestral", timeAgo: "há 28 minutos", avatarColor: "bg-emerald-700" },
  { name: "Fernanda Souza", location: "Recife, PE", plan: "Plano Anual", timeAgo: "há 31 minutos", avatarColor: "bg-violet-600" },
  { name: "Diego Martins", location: "Vitória, ES", plan: "Plano Mensal", timeAgo: "há 34 minutos", avatarColor: "bg-blue-600" },
  { name: "Aline Duarte", location: "Ribeirão Preto, SP", plan: "Plano Anual", timeAgo: "há 37 minutos", avatarColor: "bg-pink-600" },
  { name: "Bruno Cavalcanti", location: "Manaus, AM", plan: "Plano Semestral", timeAgo: "há 40 minutos", avatarColor: "bg-green-600" },
  { name: "Isabela Freitas", location: "Santos, SP", plan: "Plano Trimestral", timeAgo: "há 43 minutos", avatarColor: "bg-indigo-700" },
  { name: "Eduardo Nunes", location: "Joinville, SC", plan: "Plano Anual", timeAgo: "há 46 minutos", avatarColor: "bg-blue-800" },
  { name: "Priscila Ramos", location: "Londrina, PR", plan: "Plano Mensal", timeAgo: "há 49 minutos", avatarColor: "bg-teal-700" },
  { name: "Gustavo Moreira", location: "Campo Grande, MS", plan: "Plano Anual", timeAgo: "há 52 minutos", avatarColor: "bg-amber-700" },
  { name: "Vanessa Ribeiro", location: "Sorocaba, SP", plan: "Plano Semestral", timeAgo: "há 55 minutos", avatarColor: "bg-purple-700" },
];

export function RecentBuyersPopup() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (isDismissed) return;

    let displayTimeout: NodeJS.Timeout;
    let nextPopupTimeout: NodeJS.Timeout;

    // 1. Initial trigger after 4 seconds
    const initialTimer = setTimeout(() => {
      showNextBuyer(0);
    }, 4000);

    function showNextBuyer(index: number) {
      setCurrentIndex(index);
      setIsVisible(true);

      // Display for 3 seconds
      displayTimeout = setTimeout(() => {
        setIsVisible(false);

        // Wait 3 seconds before the next buyer
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

  const currentBuyer = buyersList[currentIndex];
  const initials = currentBuyer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={`fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-50 transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 sm:p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md max-w-[290px] sm:max-w-[340px] text-left">
        {/* Avatar with Initials and Verification Badge */}
        <div className="relative flex-shrink-0">
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-bold text-white shadow-sm text-xs sm:text-sm ${currentBuyer.avatarColor}`}
          >
            {initials}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
            <CheckCircle2 className="h-3 w-3" />
          </span>
        </div>

        {/* Info Content */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-bold text-slate-900">
              {currentBuyer.name}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">• {currentBuyer.timeAgo}</span>
          </div>

          <p className="truncate text-[11px] text-slate-500">
            {currentBuyer.location}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
              <Sparkles className="h-2.5 w-2.5 text-blue-600" />
              {currentBuyer.plan}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Compra verificada
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Fechar notificação"
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
