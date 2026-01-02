
import React, { useState } from 'react';
import { Sparkles, Leaf, Zap, Timer, ChevronRight, Info, Star, Cloud, Sun } from 'lucide-react';
import { DailyStat } from '../types';
import { getCoachAdvice } from '../services/gemini';

interface EvolutionProps {
  history: DailyStat[];
}

const Evolution: React.FC<EvolutionProps> = ({ history }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const existing = history.find(h => h.date === dateStr);
    return existing || { date: dateStr, points: 0, tasksDone: 0, energy: 0, focusMinutes: 0 };
  });

  const handleRequestInsight = async () => {
    setLoading(true);
    const activeDays = history.filter(h => h.points > 0).length;
    const totalFocus = history.reduce((acc, curr) => acc + curr.focusMinutes, 0);
    const prompt = `Analise este progresso de um usuário com TDAH: ${activeDays} dias ativos, ${totalFocus} minutos de foco. Dê um feedback curto, lúdico e muito empático, comparando com um jardim que floresce no seu próprio tempo.`;
    const response = await getCoachAdvice(prompt);
    setInsight(response || "Seu jardim está crescendo lindamente, no seu ritmo.");
    setLoading(false);
  };

  const maxPoints = Math.max(...last7Days.map(h => h.points), 10);

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      <header className="mb-8">
        <h1 className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-[0.3em]">Minha Jornada</h1>
        <h2 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">Evolução Suave</h2>
      </header>

      {/* Insight da IA Coach - Acolhimento Narrativo (Agora solicitado) */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-white p-8 rounded-[40px] border border-indigo-100/50 shadow-sm mb-12 relative overflow-hidden min-h-[160px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={80} className="text-indigo-600" />
        </div>
        
        {!insight && !loading ? (
          <div className="text-center py-4">
            <button 
              onClick={handleRequestInsight}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <Sparkles size={18} /> Ouvir o que o Coach diz
            </button>
            <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Análise baseada no seu jardim</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Sparkles size={20} />
              </div>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Sussurro do Coach</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-indigo-100 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-indigo-100 rounded-full w-2/3 animate-pulse" />
              </div>
            ) : (
              <p className="text-slate-600 font-medium leading-relaxed italic text-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                "{insight}"
              </p>
            )}
          </>
        )}
      </div>

      {/* Gráfico 1: Céu de Constância (Presença) */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
            Céu de Constância
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Frequência</span>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          <div className="flex items-end justify-between h-32 gap-3 relative z-10">
            {last7Days.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-2xl transition-all duration-1000 relative flex items-center justify-center ${
                    h.points > 0 ? 'bg-indigo-500/30' : 'bg-white/5'
                  }`}
                  style={{ height: `${Math.max((h.points / maxPoints) * 100, 15)}%` }}
                >
                  {h.points > 0 && (
                    <Star 
                      size={16} 
                      className={`text-yellow-300 fill-yellow-300 transition-transform duration-700 ${h.points > (maxPoints * 0.7) ? 'scale-125' : 'scale-100'}`} 
                    />
                  )}
                </div>
                <div className="mt-4 text-[9px] font-bold text-slate-500 uppercase">
                  {new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
            <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
              Cada estrela brilha porque você escolheu aparecer por você mesmo hoje. Dias sem estrelas são dias de recarregar.
            </p>
          </div>
        </div>
      </section>

      {/* Gráfico 2: Colheita de Micro-vitórias */}
      <section className="mb-12">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 px-2">
          <Leaf size={18} className="text-emerald-500" />
          Colheita de Micro-vitórias
        </h3>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="grid grid-cols-7 gap-3 mb-8">
            {last7Days.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex flex-col-reverse gap-1.5 h-24 justify-start">
                  {h.tasksDone > 0 ? (
                    Array.from({ length: Math.min(h.tasksDone, 6) }).map((_, j) => (
                      <div 
                        key={j} 
                        className="w-full aspect-square bg-emerald-100 rounded-lg flex items-center justify-center animate-in zoom-in duration-300"
                        style={{ animationDelay: `${j * 100}ms` }}
                      >
                        <Leaf size={10} className="text-emerald-500" />
                      </div>
                    ))
                  ) : (
                    <div className="w-full aspect-square bg-slate-50 rounded-lg flex items-center justify-center opacity-30">
                      <Cloud size={10} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase">{new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-emerald-600/70 italic px-4">
            "Sua colheita não precisa ser grande para ser valiosa. Cada folha é um ato de cuidado."
          </p>
        </div>
      </section>

      {/* Gráfico 3: Maré de Energia */}
      <section className="mb-12">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 px-2">
          <Zap size={18} className="text-amber-500" />
          Sua Maré de Energia
        </h3>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex h-32 items-end justify-between px-2 relative">
             <svg className="absolute bottom-0 left-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0,80 C30,70 70,90 100,80 L100,100 L0,100 Z" fill="#FCD34D" />
             </svg>
             
             {last7Days.map((h, i) => {
               const height = h.energy > 0 ? (h.energy / 10) * 100 : 5;
               return (
                <div key={i} className="flex-1 flex flex-col items-center group/item">
                  <div 
                    className={`w-3 rounded-full transition-all duration-700 ${h.energy > 7 ? 'bg-amber-400' : h.energy > 4 ? 'bg-amber-200' : 'bg-slate-100'}`}
                    style={{ height: `${height}%` }}
                  />
                  {h.energy > 0 && (
                    <div className="absolute mb-1 opacity-0 group-hover/item:opacity-100 transition-opacity" style={{ bottom: `${height}%` }}>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {h.energy}
                      </span>
                    </div>
                  )}
                </div>
               );
             })}
          </div>
          <div className="mt-8 flex justify-between items-center text-[9px] font-black text-slate-400 tracking-tighter uppercase">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-100" />
              <span>Calma Profunda</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Fluxo Intenso</span>
              <div className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Tempo de Foco */}
      <section>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 rounded-[50px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Timer size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">Oásis de Foco</h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-6xl font-black tabular-nums tracking-tighter">
              {history.reduce((acc, curr) => acc + curr.focusMinutes, 0)}
            </span>
            <span className="text-2xl font-bold opacity-60">min</span>
          </div>
          
          <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
            Esse é o tempo total que você presenteou a si mesmo com atenção plena. Cada minuto foi uma vitória contra a distração.
          </p>
          
          <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 shadow-lg">
            Continuar cultivando <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Evolution;
