
import React, { useState, useMemo } from 'react';
import { Sparkles, Leaf, Zap, Timer, ChevronRight, Info, Star, Cloud, Sun, Flame, Trophy, TrendingUp, Target } from 'lucide-react';
import { DailyStat } from '../types';
import { getCoachAdvice } from '../services/gemini';

interface EvolutionProps {
  history: DailyStat[];
  streak?: number;
  longestStreak?: number;
}

const Evolution: React.FC<EvolutionProps> = ({ history, streak = 0, longestStreak = 0 }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const existing = history.find(h => h.date === dateStr);
      return existing || { date: dateStr, points: 0, tasksDone: 0, energy: 0, focusMinutes: 0 };
    });
  }, [history]);

  const maxPoints = Math.max(...last7Days.map(h => h.points), 10);

  // Lógica para gerar o path do gráfico de área (Bezier Curves)
  const chartPath = useMemo(() => {
    const width = 1000;
    const height = 200;
    const padding = 40;
    const usableHeight = height - padding * 2;
    const step = width / (last7Days.length - 1);

    const points = last7Days.map((d, i) => ({
      x: i * step,
      y: height - padding - (d.points / (maxPoints || 1)) * usableHeight
    }));

    if (points.length === 0) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const controlX = (curr.x + next.x) / 2;
      path += ` C ${controlX} ${curr.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  }, [last7Days, maxPoints]);

  const handleRequestInsight = async () => {
    setLoading(true);
    const activeDays = history.filter(h => h.points > 0).length;
    const totalFocus = history.reduce((acc, curr) => acc + curr.focusMinutes, 0);
    const prompt = `Analise este progresso: ${activeDays} dias ativos, ${totalFocus} minutos de foco. Dê um feedback curto, lúdico e muito empático para alguém com TDAH.`;
    const response = await getCoachAdvice(prompt);
    setInsight(response);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-[0.4em]">Analytics Pessoal</h1>
          <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Sua Sinfonia Diária</h2>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolução em Tempo Real</span>
        </div>
      </header>

      {/* Flagship: Gráfico de Impacto Moderno */}
      <section className="mb-12">
        <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Rastro de Brilho
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pontos Glow Acumulados</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">7 Dias</span>
            </div>
          </div>

          <div className="relative h-[250px] w-full">
            <svg viewBox="0 0 1000 250" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradientGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Área Sombreada */}
              <path 
                d={`${chartPath} L 1000 250 L 0 250 Z`} 
                fill="url(#gradientGlow)" 
                className="animate-in fade-in duration-1000 delay-500"
              />

              {/* Linha Principal */}
              <path 
                d={chartPath} 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="6" 
                strokeLinecap="round" 
                filter="url(#glow)"
                className="animate-dash"
                style={{ strokeDasharray: 2000, strokeDashoffset: 0 }}
              />

              {/* Pontos de Interação */}
              {last7Days.map((d, i) => {
                const step = 1000 / (last7Days.length - 1);
                const x = i * step;
                const y = 250 - 40 - (d.points / (maxPoints || 1)) * 170;
                return (
                  <g key={i} className="cursor-pointer group/point">
                    <circle 
                      cx={x} cy={y} r="8" 
                      fill="white" 
                      stroke="#4F46E5" 
                      strokeWidth="4" 
                      className="transition-all duration-300 group-hover/point:r-12 shadow-lg" 
                    />
                    {d.points > 0 && (
                      <text 
                        x={x} y={y - 20} 
                        textAnchor="middle" 
                        className="text-[24px] font-black fill-indigo-600 opacity-0 group-hover/point:opacity-100 transition-opacity"
                      >
                        {d.points}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between mt-8 px-2">
            {last7Days.map((d, i) => (
              <span key={i} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Ofensiva Duolingo Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-orange-400 via-rose-500 to-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-orange-200/50 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <Flame size={24} className="fill-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Ofensiva Imbatível</span>
            </div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-8xl font-black tracking-tighter tabular-nums drop-shadow-lg">{streak}</span>
              <span className="text-2xl font-bold opacity-80">DIAS</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
               <Target size={16} /> 
               <span>Mantenha o foco por você</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-all duration-1000">
             <Trophy size={140} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
                <Trophy size={24} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recorde Eterno</span>
            </div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{longestStreak}</span>
              <span className="text-2xl font-bold text-slate-400">DIAS</span>
            </div>
          </div>
          <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden mt-6 border border-slate-100">
             <div 
               className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
               style={{ width: `${Math.min((streak / (longestStreak || 1)) * 100, 100)}%` }} 
             />
          </div>
        </div>
      </div>

      {/* Insight da IA Coach Glassmorphism */}
      <div className="bg-white/40 backdrop-blur-2xl p-10 rounded-[56px] border border-white shadow-2xl shadow-indigo-100/30 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Sparkles size={120} className="text-indigo-600" />
        </div>
        
        {!insight && !loading ? (
          <div className="text-center py-10">
            <button 
              onClick={handleRequestInsight}
              className="group relative inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-sm transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200"
            >
              <Sparkles size={20} className="group-hover:animate-spin" /> 
              Analisar meu Jardim com IA
            </button>
            <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Insights baseados no seu comportamento real</p>
          </div>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <Sparkles size={28} />
              </div>
              <div>
                <span className="text-xs font-black text-indigo-900 uppercase tracking-widest block">Sussurro do Coach</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gerado por IA agora</span>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                <div className="h-5 bg-indigo-50 rounded-full w-full animate-pulse" />
                <div className="h-5 bg-indigo-50 rounded-full w-3/4 animate-pulse" />
                <div className="h-5 bg-indigo-50 rounded-full w-1/2 animate-pulse" />
              </div>
            ) : (
              <p className="text-slate-800 font-bold leading-relaxed italic text-2xl tracking-tight">
                "{insight}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas de Foco */}
      <section className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Timer size={180} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Timer size={28} className="text-white" />
              </div>
              <h3 className="font-black text-2xl tracking-tight">Imersão Total</h3>
            </div>
            
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-9xl font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                {history.reduce((acc, curr) => acc + curr.focusMinutes, 0)}
              </span>
              <span className="text-3xl font-bold text-indigo-300">MINUTOS</span>
            </div>
            
            <p className="text-indigo-100/60 text-lg leading-relaxed font-medium max-w-md">
              Esse é o tempo que você dedicou inteiramente a si mesmo. Sem ruído, apenas fluxo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-sm">
                <Star className="text-yellow-400 mb-4" size={32} fill="currentColor" />
                <div className="text-4xl font-black mb-1">{history.filter(h => h.points > 50).length}</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dias Radiantes</div>
             </div>
             <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-sm">
                <Zap className="text-indigo-400 mb-4" size={32} fill="currentColor" />
                <div className="text-4xl font-black mb-1">{history.reduce((acc, curr) => acc + curr.tasksDone, 0)}</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ações Concluídas</div>
             </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-dash {
          animation: dash 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Evolution;
