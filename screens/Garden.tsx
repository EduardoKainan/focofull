
import React from 'react';
import { Sparkles, Flower, TreePine, CloudSun, Stars, Leaf } from 'lucide-react';
import { GamificationState } from '../types';

interface GardenProps {
  state: GamificationState;
}

const Garden: React.FC<GardenProps> = ({ state }) => {
  // Lógica visual baseada no nível/pontos
  const plantsCount = Math.min(Math.floor(state.glowPoints / 50) + 1, 12);
  const elements = Array.from({ length: plantsCount });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest">Meu Espaço</h1>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          Seu jardim de luz
        </h2>
      </header>

      {/* Visual do Jardim */}
      <div className="relative flex-1 min-h-[300px] bg-gradient-to-b from-indigo-50 to-emerald-50 rounded-[40px] overflow-hidden border-4 border-white shadow-inner mb-8">
        {/* Atmosfera */}
        <div className="absolute top-8 left-8 text-yellow-500/40 animate-pulse">
          <CloudSun size={48} />
        </div>
        <div className="absolute top-12 right-12 text-indigo-200">
          <Stars size={32} />
        </div>

        {/* Chão e Elementos */}
        <div className="absolute bottom-0 w-full h-32 bg-emerald-100/50 blur-xl" />
        
        <div className="absolute inset-0 p-8 grid grid-cols-3 gap-8 items-end justify-items-center">
          {elements.map((_, i) => {
            const isTree = i % 3 === 0;
            const delay = i * 100;
            return (
              <div 
                key={i} 
                className="animate-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center"
                style={{ animationDelay: `${delay}ms` }}
              >
                {isTree ? (
                  <TreePine size={40 + (i * 2)} className="text-emerald-600 drop-shadow-sm" />
                ) : (
                  <Flower size={24 + (i * 2)} className="text-pink-400 drop-shadow-sm" />
                )}
                <div className="w-4 h-1 bg-black/5 rounded-full mt-1 blur-[1px]" />
              </div>
            );
          })}
        </div>

        {/* Overlay de Luzes flutuantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-yellow-200 rounded-full blur-[2px] animate-bounce"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + (i * 23) % 80}%`,
                animationDelay: `${i * 500}ms`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>

      {/* Estatísticas Lúdicas */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Luz Acumulada</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{state.glowPoints}</div>
          <p className="text-[10px] text-slate-400 mt-1">Cuidado que você se deu</p>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Leaf size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Nível de Paz</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{state.level}</div>
          <p className="text-[10px] text-slate-400 mt-1">Evolução suave</p>
        </div>
      </div>

      {/* Narrativa de Progresso */}
      <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-indigo-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">“Você voltou. Isso importa.”</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seu jardim cresce um pouquinho toda vez que você se prioriza, mesmo nos dias nublados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Garden;
