
import React from 'react';
import { Sparkles, Flower, TreePine, CloudSun, Stars, Leaf, ChevronRight, TrendingUp } from 'lucide-react';
import { GamificationState } from '../types';

interface GardenProps {
  state: GamificationState;
  onNavigateToEvolution?: () => void;
}

const Garden: React.FC<GardenProps> = ({ state, onNavigateToEvolution }) => {
  // Lógica visual baseada no nível/pontos
  const plantsCount = Math.min(Math.floor(state.glowPoints / 50) + 1, 12);
  const elements = Array.from({ length: plantsCount });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest">Meu Espaço</h1>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
            Seu jardim de luz
          </h2>
        </div>
        <button 
          onClick={onNavigateToEvolution}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-indigo-600 hover:shadow-md transition-all active:scale-95"
        >
          <TrendingUp size={16} /> Ver Estatísticas
        </button>
      </header>

      {/* Visual do Jardim */}
      <div className="relative flex-1 min-h-[400px] bg-gradient-to-b from-indigo-50 to-emerald-50 rounded-[56px] overflow-hidden border-8 border-white shadow-2xl mb-8 group">
        {/* Atmosfera */}
        <div className="absolute top-12 left-12 text-yellow-500/40 animate-pulse">
          <CloudSun size={64} />
        </div>
        <div className="absolute top-16 right-16 text-indigo-200">
          <Stars size={48} />
        </div>

        {/* Chão e Elementos */}
        <div className="absolute bottom-0 w-full h-48 bg-emerald-100/50 blur-3xl" />
        
        <div className="absolute inset-0 p-12 grid grid-cols-3 md:grid-cols-4 gap-12 items-end justify-items-center">
          {elements.map((_, i) => {
            const isTree = i % 3 === 0;
            const delay = i * 150;
            return (
              <div 
                key={i} 
                className="animate-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center hover:scale-110 transition-transform cursor-help"
                style={{ animationDelay: `${delay}ms` }}
              >
                {isTree ? (
                  <TreePine size={60 + (i * 4)} className="text-emerald-600 drop-shadow-xl" />
                ) : (
                  <Flower size={40 + (i * 4)} className="text-rose-400 drop-shadow-xl" />
                )}
                <div className="w-8 h-2 bg-black/5 rounded-full mt-2 blur-[2px]" />
              </div>
            );
          })}
        </div>

        {/* Overlay de Luzes flutuantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-3 h-3 bg-yellow-200 rounded-full blur-[3px] animate-bounce"
              style={{
                top: `${15 + i * 12}%`,
                left: `${5 + (i * 28) % 90}%`,
                animationDelay: `${i * 700}ms`,
                opacity: 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Estatísticas Lúdicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Luz Acumulada</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">{state.glowPoints}</div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pétalas de esforço consciente</p>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Leaf size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Nível de Paz</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">{state.level}</div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Harmonia interna alcançada</p>
        </div>
      </div>

      {/* Narrativa de Progresso */}
      <div 
        onClick={onNavigateToEvolution}
        className="bg-indigo-600 p-8 rounded-[40px] flex items-center gap-6 cursor-pointer hover:bg-indigo-700 transition-all group shadow-2xl shadow-indigo-100"
      >
        <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
          <TrendingUp size={32} />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-white text-xl tracking-tight mb-1">“Sua jornada é uma música única.”</h4>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
            Cada semente plantada hoje se torna a floresta de amanhã. Clique aqui para ver seus dados de evolução.
          </p>
        </div>
        <ChevronRight size={32} className="text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
      </div>
    </div>
  );
};

export default Garden;
