
import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, Circle, Sparkles, AlertCircle, Zap, Smile, Frown, Meh, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../types';
import { breakDownTask } from '../services/gemini';

interface HomeProps {
  tasks: Task[];
  energyLevel: number;
  glowPoints: number;
  streak?: number;
  streakActive?: boolean;
  onCompleteTask: (id: string) => void;
  onUpdateEnergy?: (level: number) => void;
}

interface FloatingEffect {
  id: number;
  x: number;
  y: number;
}

const Home: React.FC<HomeProps> = ({ tasks, energyLevel, glowPoints, streak = 0, streakActive = false, onCompleteTask, onUpdateEnergy }) => {
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [aiBreakdown, setAiBreakdown] = useState<{steps: string[], quote: string} | null>(null);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);
  const [isCounterPulsing, setIsCounterPulsing] = useState(false);
  const [showEnergyPicker, setShowEnergyPicker] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  const greeting = energyLevel < 4 ? "Respire fundo. Vamos devagar?" : "Que bom te ver! Vamos um passo por vez?";

  useEffect(() => {
    if (glowPoints > 0) {
      setIsCounterPulsing(true);
      const timer = setTimeout(() => setIsCounterPulsing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [glowPoints]);

  const handleHelpMeStart = async (task: Task) => {
    setLoadingStep(task.id);
    const result = await breakDownTask(task.title);
    setAiBreakdown({
      steps: result.steps,
      quote: result.motivationalQuote
    });
    setLoadingStep(null);
  };

  const handleComplete = (e: React.MouseEvent, id: string) => {
    const x = e.clientX;
    const y = e.clientY;
    const newEffect = { id: Date.now(), x, y };
    setFloatingEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setFloatingEffects(prev => prev.filter(ef => ef.id !== newEffect.id));
    }, 1000);
    onCompleteTask(id);
  };

  return (
    <div className="pb-10 relative animate-in fade-in duration-700">
      {floatingEffects.map(effect => (
        <div 
          key={effect.id}
          className="fixed pointer-events-none z-[100] flex flex-col items-center animate-float-up-fade"
          style={{ left: effect.x - 20, top: effect.y - 40 }}
        >
          <div className="text-indigo-600 flex items-center gap-1 font-bold text-lg drop-shadow-sm">
            <Sparkles size={20} className="animate-pulse" />
            <span>+15</span>
          </div>
        </div>
      ))}

      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-[0.3em]">Hoje</h1>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {greeting}
          </h2>
        </div>
        
        <div className="flex gap-4 shrink-0">
          {/* Streak Badge estilo Duolingo */}
          <div className={`px-5 py-3 rounded-full border flex items-center gap-3 transition-all duration-500 ${streakActive ? 'bg-orange-50 border-orange-100 shadow-sm' : 'bg-white border-slate-100 opacity-60'}`}>
             <div className="relative">
               <Zap size={20} className={`${streakActive ? 'text-orange-500 fill-orange-500 animate-bounce' : 'text-slate-300'}`} />
               {streakActive && <div className="absolute inset-0 bg-orange-400 blur-md rounded-full opacity-20 animate-pulse" />}
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ofensiva</span>
               <span className={`text-xl font-black ${streakActive ? 'text-orange-600' : 'text-slate-400'}`}>{streak} d</span>
             </div>
          </div>

          <div 
            ref={counterRef}
            className={`bg-white px-6 py-4 rounded-[32px] shadow-sm border border-indigo-50 flex items-center gap-3 group cursor-default transition-all duration-500 ${
              isCounterPulsing ? 'scale-110 border-indigo-200 shadow-indigo-100 ring-8 ring-indigo-50' : 'scale-100'
            }`}
          >
            <Sparkles size={20} className={`text-indigo-600 transition-transform ${isCounterPulsing ? 'rotate-12 scale-110' : ''}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Glow</span>
              <span className={`text-2xl font-black tabular-nums transition-colors ${isCounterPulsing ? 'text-indigo-600' : 'text-slate-900'}`}>
                {glowPoints}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Superior: IA Insight + Energia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
        {/* Check-in de Energia Amigável */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
          <div 
            onClick={() => setShowEnergyPicker(!showEnergyPicker)}
            className="flex items-center gap-4 px-6 py-6 bg-white border border-slate-100 rounded-[32px] shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${energyLevel > 7 ? 'bg-amber-100 text-amber-600' : energyLevel > 4 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
              <Zap size={24} fill={energyLevel > 4 ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Minha Bateria</div>
              <div className="text-xl font-black text-slate-900">Nível {energyLevel}/10</div>
            </div>
            <button className="text-indigo-600 text-xs font-bold px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">Ajustar</button>
          </div>

          {showEnergyPicker && (
            <div className="p-8 bg-indigo-600 rounded-[40px] text-white animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap size={80} />
              </div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10">
                <Smile size={24} /> Como está seu brilho?
              </h3>
              <div className="flex items-center gap-6 relative z-10">
                <Frown size={24} className="opacity-50" />
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energyLevel} 
                  onChange={(e) => onUpdateEnergy?.(parseInt(e.target.value))}
                  className="flex-1 h-3 bg-indigo-400 rounded-full appearance-none cursor-pointer accent-white"
                />
                <Smile size={24} className="opacity-50" />
              </div>
              <div className="mt-6 flex justify-between text-[11px] font-bold text-indigo-200 tracking-widest relative z-10">
                <span>RECOLHIDO</span>
                <span>RADIANTE</span>
              </div>
              <button 
                onClick={() => setShowEnergyPicker(false)}
                className="w-full mt-8 bg-white text-indigo-600 py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-all relative z-10"
              >
                Confirmar Vibração
              </button>
            </div>
          )}
        </div>

        {/* Breakdown IA (quando ativo) */}
        {aiBreakdown && (
          <div className="lg:col-span-8 bg-white rounded-[40px] p-8 border border-indigo-100 shadow-xl shadow-indigo-50 animate-in zoom-in duration-500 relative overflow-hidden order-1 lg:order-2">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Micro-Passos Sugeridos</h3>
              </div>
              <button onClick={() => setAiBreakdown(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                <Meh size={24} />
              </button>
            </div>
            <p className="text-slate-500 italic text-base mb-8 relative z-10 font-medium">"{aiBreakdown.quote}"</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {aiBreakdown.steps.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-700 leading-snug">{step}</span>
                </div>
              ))}
            </div>
            <button 
              className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
              onClick={() => setAiBreakdown(null)}
            >
              Vamos nessa!
            </button>
          </div>
        )}
      </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
            Fluxo Diário
          </h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pendingTasks.length} Restantes</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {['morning', 'afternoon', 'evening'].map(block => {
            const blockTasks = pendingTasks.filter(t => t.block === block);
            const blockLabel = block === 'morning' ? 'Brisa da Manhã' : block === 'afternoon' ? 'Sol da Tarde' : 'Paz da Noite';
            
            return (
              <div key={block} className="flex flex-col gap-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  {blockLabel}
                </h4>
                
                <div className="space-y-6">
                  {blockTasks.length > 0 ? blockTasks.map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h5 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">{task.title}</h5>
                          <div className="flex items-center gap-2 text-indigo-600 text-[11px] font-bold bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100">
                            <AlertCircle size={12} />
                            {task.nextStep}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => handleComplete(e, task.id)}
                          className="text-slate-100 hover:text-emerald-500 transition-all hover:scale-125 relative shrink-0"
                        >
                          <Circle size={32} strokeWidth={1.5} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleHelpMeStart(task)}
                        disabled={loadingStep === task.id}
                        className="mt-4 w-full flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-xs font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all disabled:opacity-50 shadow-sm"
                      >
                        {loadingStep === task.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-indigo-600" />
                        ) : (
                          <><Sparkles size={16} /> Me ajuda a começar?</>
                        )}
                      </button>
                    </div>
                  )) : (
                    <div className="p-8 rounded-[32px] border-2 border-dashed border-slate-100 flex items-center justify-center text-center">
                      <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Tudo certo aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {pendingTasks.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[60px] border border-emerald-50 shadow-inner">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mb-8 shadow-inner animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="font-black text-3xl text-slate-900 mb-4 tracking-tight">Céu de Brigadeiro!</h3>
            <p className="text-slate-500 text-lg max-w-sm mx-auto font-medium">
              Você completou sua jornada por hoje. <br/> Seu jardim está irradiando luz e paz.
            </p>
          </div>
        )}
      </section>

      {/* Seção Discreta de Concluídas */}
      {completedTasks.length > 0 && (
        <section className="mt-12 opacity-60 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-colors mb-4 group"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tarefas Florescidas ({completedTasks.length})</span>
          </button>
          
          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-white/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 line-through truncate">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style>{`
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 1; transform: translateY(-10px) scale(1.1); }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
        .animate-float-up-fade { animation: float-up-fade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Home;
