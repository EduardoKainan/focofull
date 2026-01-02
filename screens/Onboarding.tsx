
import React, { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: any) => Promise<void> | void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState(5);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const difficultyOptions = [
    { id: 'starting', label: 'Começar tarefas' },
    { id: 'memory', label: 'Lembrar da rotina' },
    { id: 'focus', label: 'Manter o foco' },
    { id: 'finishing', label: 'Finalizar projetos' },
  ];

  const handleToggleDifficulty = (id: string) => {
    setDifficulties(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleFinalize = async () => {
    setIsCompleting(true);
    try {
      await onComplete({ energy, difficulties });
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      // Mesmo com erro, o App.tsx deve nos tirar daqui, mas resetamos o loading por segurança
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-8">
      <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
              Olá, vamos tornar seu dia <span className="text-indigo-600 underline decoration-wavy">mais leve</span>?
            </h1>
            <p className="text-slate-500 text-lg mb-12">
              Não somos uma lista de tarefas comum. Estamos aqui para te apoiar.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Começar <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Como está sua energia hoje?</h2>
            <p className="text-slate-500 mb-8">Não há resposta errada. Seja sincero com você.</p>
            
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex justify-between text-2xl">
                <span>🔋</span>
                <span>⚡</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={energy} 
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-center font-bold text-indigo-600 text-xl">Nível {energy}</p>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Próximo <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Onde costuma travar?</h2>
            <p className="text-slate-500 mb-8">Selecione o que faz sentido para você agora.</p>
            
            <div className="grid grid-cols-1 gap-3 mb-12">
              {difficultyOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleToggleDifficulty(opt.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${
                    difficulties.includes(opt.id) 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  {difficulties.includes(opt.id) && <Check size={20} className="text-indigo-600" />}
                </button>
              ))}
            </div>

            <button 
              onClick={handleFinalize}
              disabled={isCompleting}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
            >
              {isCompleting ? (
                <>Processando... <Loader2 size={20} className="animate-spin" /></>
              ) : (
                <>Tudo pronto <Check size={20} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
