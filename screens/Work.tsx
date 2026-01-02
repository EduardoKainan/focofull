
import React, { useState } from 'react';
// Added Activity to imports to fix the missing name error
import { Briefcase, Plus, Sparkles, CheckCircle2, Trash2, X, Zap, ArrowRight, Timer, AlertCircle, Activity } from 'lucide-react';
import { WorkTask } from '../types';
import { breakDownTask } from '../services/gemini';

interface WorkProps {
  tasks: WorkTask[];
  onCompleteTask: (id: string) => void;
  onAddTask: (task: Omit<WorkTask, 'id' | 'status'>) => void;
  onDeleteTask: (id: string) => void;
}

const Work: React.FC<WorkProps> = ({ tasks, onCompleteTask, onAddTask, onDeleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', energyRequired: 2 as 1 | 2 | 3 });

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const totalEnergy = pendingTasks.reduce((acc, t) => acc + t.energyRequired, 0);

  const handleAddTask = () => {
    if (!newTask.title) return;
    onAddTask(newTask);
    setNewTask({ title: '', description: '', energyRequired: 2 });
    setIsAdding(false);
  };

  const handleBreakdown = async (task: WorkTask) => {
    setLoadingIA(task.id);
    const result = await breakDownTask(task.title);
    // Aqui poderíamos atualizar a tarefa com os novos passos se tivéssemos a função de update
    setLoadingIA(null);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-[0.3em]">Ambiente Profissional</h1>
          <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Foco & Entrega</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
             <Zap size={14} className="text-indigo-600" />
             <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Carga Mental: {totalEnergy}</span>
           </div>
           <button 
             onClick={() => setIsAdding(true)}
             className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"
           >
             <Plus size={24} />
           </button>
        </div>
      </header>

      {/* Grid de Tarefas por Energia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map(energy => {
          const energyTasks = pendingTasks.filter(t => t.energyRequired === energy);
          const labels = ["Tarefas Leves", "Foco Moderado", "Deep Work"];
          const colors = ["text-emerald-500", "text-amber-500", "text-rose-500"];
          const bgColors = ["bg-emerald-50", "bg-amber-50", "bg-rose-50"];

          return (
            <div key={energy} className="flex flex-col gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 ${bgColors[energy-1]} rounded-2xl w-fit`}>
                <Zap size={12} className={colors[energy-1]} fill="currentColor" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${colors[energy-1]}`}>{labels[energy-1]}</span>
              </div>

              <div className="space-y-4">
                {energyTasks.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
                      </div>
                      <button 
                        onClick={() => onCompleteTask(task.id)}
                        className="text-slate-100 hover:text-emerald-500 transition-all hover:scale-125 shrink-0"
                      >
                        <CheckCircle2 size={28} />
                      </button>
                    </div>

                    {task.microSteps && task.microSteps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                        {task.microSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                            <ArrowRight size={10} className="text-indigo-300" /> {step}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleBreakdown(task)}
                        disabled={loadingIA === task.id}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        {loadingIA === task.id ? <div className="animate-spin h-3 w-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full" /> : <><Sparkles size={12} /> Micro-Passos</>}
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-rose-50 hover:text-rose-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Adição */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative animate-in zoom-in duration-500">
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full">
              <X size={24} />
            </button>
            
            <header className="mb-8">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={28} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Novo Desafio</h3>
              <p className="text-slate-500 font-medium">O que vamos enfrentar hoje?</p>
            </header>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tarefa</label>
                <input 
                  type="text" 
                  placeholder="Ex: Refatorar módulo de auth" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contexto (Opcional)</label>
                <textarea 
                  placeholder="Por que isso importa?" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-medium text-slate-600 h-24 resize-none"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Esforço Mental Estimado</label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(e => (
                    <button
                      key={e}
                      onClick={() => setNewTask({...newTask, energyRequired: e as 1 | 2 | 3})}
                      className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newTask.energyRequired === e ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400'
                      }`}
                    >
                      <Zap size={16} fill={newTask.energyRequired === e ? "currentColor" : "none"} />
                      <span className="text-[10px] font-black">{e === 1 ? 'LEVE' : e === 2 ? 'MÉDIO' : 'ALTO'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
              >
                <Sparkles size={20} /> Adicionar à Pauta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dica de ADHD para Trabalho */}
      <div className="bg-indigo-600 rounded-[40px] p-8 text-white flex items-center gap-8 shadow-2xl shadow-indigo-100">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
          <Timer size={40} />
        </div>
        <div>
          <h4 className="text-xl font-black mb-2 flex items-center gap-2">
            Pausa Obrigatória <Activity size={20} />
          </h4>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-xl">
            Sua mente é um processador potente, mas precisa de resfriamento. A cada 45 minutos de foco, dê a si mesmo 5 minutos de <strong>não fazer nada</strong>. Seu jardim de produtividade agradece.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Work;
