
import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { getCoachAdvice } from '../services/gemini';

interface AICoachProps {
  context?: string;
}

const AICoach: React.FC<AICoachProps> = ({ context }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    setIsOpen(true);
    const advice = await getCoachAdvice(context || "Dê uma mensagem de apoio matinal para alguém com TDAH.");
    setMessage(advice);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-28 right-6 z-50">
      {isOpen && message && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-3xl p-5 shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-slate-300 hover:text-slate-500"
          >
            <X size={16} />
          </button>
          <div className="flex gap-2 items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles size={16} />
            </div>
            <span className="font-semibold text-sm text-indigo-900">Coach Mindful</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "{message}"
          </p>
        </div>
      )}
      
      <button
        onClick={fetchAdvice}
        disabled={loading}
        title="Pedir conselho ao Coach"
        className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
        ) : (
          <Sparkles size={24} />
        )}
      </button>
    </div>
  );
};

export default AICoach;
