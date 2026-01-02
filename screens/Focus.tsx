
import React, { useState, useEffect } from 'react';
import { Timer, Pause, Play, RotateCcw, Heart, Sparkles } from 'lucide-react';

interface FocusProps {
  onComplete: (mins: number) => void;
}

const Focus: React.FC<FocusProps> = ({ onComplete }) => {
  const [seconds, setSeconds] = useState(300); // 5 minutes default
  const [isActive, setIsActive] = useState(false);
  const [preset, setPreset] = useState(5);
  const [showReward, setShowReward] = useState(false);

  const supportiveMessages = [
    "Respire fundo. Você está indo bem.",
    "Apenas estes minutos. Nada mais importa agora.",
    "5 minutos já contam muito.",
    "Se cansar, respire. Estamos juntos.",
    "O mundo pode esperar um pouquinho."
  ];

  const [message, setMessage] = useState(supportiveMessages[0]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
        if (seconds % 60 === 0 && seconds !== (preset * 60)) {
          setMessage(supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)]);
        }
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setShowReward(true);
      onComplete(preset);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, preset, onComplete]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(preset * 60);
    setIsActive(false);
    setShowReward(false);
  };

  const setTime = (mins: number) => {
    setPreset(mins);
    setSeconds(mins * 60);
    setIsActive(false);
    setShowReward(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showReward) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500 px-6 text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-100">
          <Sparkles size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Você foi incrível!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Esses {preset} minutos trouxeram muita luz para o seu jardim hoje. Respire e aproveite a sensação.
        </p>
        <button 
          onClick={reset}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full pb-20 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Modo Foco</h2>
        <p className="text-slate-500">Sessões curtas, progresso real.</p>
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center mb-12">
        <div className={`absolute inset-0 rounded-full border-8 transition-all duration-1000 ${isActive ? 'border-indigo-600 scale-105 animate-pulse' : 'border-slate-100'}`} />
        <div className="text-6xl font-bold text-slate-800 tracking-tighter tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] mb-12 flex items-center gap-4 text-indigo-700 max-w-xs text-center border border-indigo-50 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-indigo-600" fill="currentColor" />
        </div>
        <p className="text-sm font-medium italic text-slate-600">"{message}"</p>
      </div>

      <div className="flex gap-3 mb-12">
        {[5, 10, 15].map(m => (
          <button 
            key={m}
            onClick={() => setTime(m)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${preset === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="flex gap-6 items-center">
        <button 
          onClick={reset}
          className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          onClick={toggle}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all scale-110 active:scale-95 ${isActive ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="white" className="ml-1" />}
        </button>

        <div className="w-14 h-14" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default Focus;
