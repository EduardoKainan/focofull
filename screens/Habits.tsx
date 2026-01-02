
import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, Plus, Zap, Bell, Clock, Shuffle, X, ChevronRight, Edit3, Trash2, Smile, BellOff, FolderKanban, Loader2 } from 'lucide-react';
import { Habit, ReminderType, Project } from '../types';
import { generateHabitPlan } from '../services/gemini';

interface HabitsProps {
  habits: Habit[];
  projects?: Project[];
  onToggleHabit: (id: string) => void;
  onUpdateHabit?: (habit: Habit) => void;
  onAddHabit?: (habit: Omit<Habit, 'id' | 'completedToday'>) => void;
  onDeleteHabit?: (id: string) => void;
}

const ICONS = ['🏃‍♂️', '🧘‍♀️', '📖', '💧', '🍎', '🧹', '🌱', '💻', '🎨', '🎸', '🛌', '✍️'];

const Habits: React.FC<HabitsProps> = ({ habits, projects = [], onToggleHabit, onUpdateHabit, onAddHabit, onDeleteHabit }) => {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  
  // Fix: Explicitly define the state type to allow optional reminder fields, matching the Habit interface
  const [formData, setFormData] = useState<{
    name: string;
    microAction: string;
    icon: string;
    projectId?: string;
    reminder: {
      type: ReminderType;
      windowStart?: string;
      windowEnd?: string;
      frequency?: number;
    };
  }>({
    name: '',
    microAction: '',
    icon: '🌱',
    projectId: undefined,
    reminder: { type: 'none', windowStart: '09:00', windowEnd: '11:00', frequency: 3 }
  });

  const handleAiGenerate = async () => {
    if (!aiGoal) return;
    setIsGenerating(true);
    try {
      const plan = await generateHabitPlan(aiGoal);
      setFormData({
        ...formData,
        name: plan.name,
        microAction: plan.microAction,
        icon: plan.icon || '🌱'
      });
      setAiGoal('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    // Fix: Properly assign optional reminder fields
    setFormData({
      name: habit.name,
      microAction: habit.microAction,
      icon: habit.icon,
      projectId: habit.projectId,
      reminder: habit.reminder || { type: 'none', windowStart: '09:00', windowEnd: '11:00', frequency: 3 }
    });
    setIsAddingNew(false);
  };

  const openAdd = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      microAction: '',
      icon: '🌱',
      projectId: undefined,
      reminder: { type: 'none', windowStart: '09:00', windowEnd: '11:00', frequency: 3 }
    });
    setIsAddingNew(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.microAction) return;
    if (editingHabit) {
      onUpdateHabit?.({ ...editingHabit, ...formData });
    } else {
      onAddHabit?.(formData);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (editingHabit && onDeleteHabit) {
      onDeleteHabit(editingHabit.id);
      closeModal();
    }
  };

  const closeModal = () => {
    setEditingHabit(null);
    setIsAddingNew(false);
    setAiGoal('');
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-[0.3em]">Rotina</h1>
          <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Sementes Diárias</h2>
        </div>
        <button 
          onClick={openAdd}
          className="w-14 h-14 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"
        >
          <Plus size={28} />
        </button>
      </header>

      <div className="bg-white p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center gap-6 border border-slate-100 shadow-sm">
        <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
          <Zap size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Pequenos atos, grandes impactos</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Cultive seus hábitos diários. Não sabe por onde começar? Use o botão + para pedir uma sugestão à IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {habits.map(habit => {
          const project = projects.find(p => p.id === habit.projectId);
          return (
            <div
              key={habit.id}
              className={`w-full p-8 rounded-[40px] border transition-all flex flex-col justify-between group min-h-[320px] relative overflow-hidden ${
                habit.completedToday 
                  ? 'bg-emerald-50 border-emerald-100 shadow-inner' 
                  : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl'
              }`}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <button onClick={() => onToggleHabit(habit.id)} className={`text-4xl transition-transform hover:scale-110 duration-500 ${habit.completedToday ? 'grayscale-0' : 'grayscale opacity-40'}`}>
                  {habit.icon}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(habit)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => onToggleHabit(habit.id)} className={`transition-all ${habit.completedToday ? 'text-emerald-500 scale-110' : 'text-slate-200'}`}>
                    {habit.completedToday ? <CheckCircle2 size={36} strokeWidth={2.5} /> : <Circle size={36} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                {project && (
                  <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                    <FolderKanban size={10} /> {project.name}
                  </div>
                )}
                <h4 className={`text-xl font-black transition-colors mb-2 ${habit.completedToday ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                  {habit.name}
                </h4>
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${habit.completedToday ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                     Ação: {habit.microAction}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={openAdd} className="group w-full min-h-[320px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-indigo-200 hover:bg-white hover:text-indigo-400 transition-all duration-500">
          <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-black text-sm uppercase tracking-[0.2em]">Plantar Semente</span>
        </button>
      </div>

      {(editingHabit || isAddingNew) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl relative animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <button onClick={closeModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all z-20">
                <X size={24} />
              </button>

              <header className="mb-10">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {editingHabit ? <Edit3 size={28} /> : <Sparkles size={28} />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{editingHabit ? 'Ajustar Semente' : 'Nova Semente Inteligente'}</h3>
                <p className="text-slate-500 font-medium">As sementes diárias nutrem seus grandes sonhos.</p>
              </header>

              {!editingHabit && (
                <div className="mb-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3 ml-1">Inspiração da IA (Ex: "Quero ser mais criativo")</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Qual seu objetivo?" 
                      className="flex-1 px-5 py-4 rounded-2xl bg-white border border-indigo-100 outline-none font-bold text-slate-700"
                      value={aiGoal}
                      onChange={e => setAiGoal(e.target.value)}
                    />
                    <button 
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiGoal}
                      className="bg-indigo-600 text-white px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">O que cultivar?</label>
                    <input type="text" placeholder="Ex: Exercício" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Micro-Ação</label>
                    <input type="text" placeholder="Ex: 5 agachamentos" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" value={formData.microAction} onChange={e => setFormData({...formData, microAction: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vincular a um Sonho (Projeto)</label>
                  <select 
                    value={formData.projectId || ''} 
                    onChange={e => setFormData({...formData, projectId: e.target.value || undefined})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700"
                  >
                    <option value="">Nenhum sonho vinculado</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Um Símbolo</label>
                  <div className="flex flex-wrap gap-3">
                    {ICONS.map(icon => (
                      <button key={icon} onClick={() => setFormData({...formData, icon})} className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${formData.icon === icon ? 'bg-indigo-600 scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lembrete Gentil</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setFormData({...formData, reminder: {...formData.reminder, type: 'none'}})} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reminder.type === 'none' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                      <BellOff size={18} /> <span className="text-[10px] font-black">NÃO</span>
                    </button>
                    <button onClick={() => setFormData({...formData, reminder: {...formData.reminder, type: 'fixed_window'}})} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reminder.type === 'fixed_window' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                      <Clock size={18} /> <span className="text-[10px] font-black">JANELA</span>
                    </button>
                    <button onClick={() => setFormData({...formData, reminder: {...formData.reminder, type: 'random'}})} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reminder.type === 'random' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                      <Shuffle size={18} /> <span className="text-[10px] font-black">ALEATÓRIO</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
              {editingHabit && <button onClick={handleDelete} className="px-6 py-4 rounded-2xl border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-all"><Trash2 size={18} /></button>}
              <div className="flex-1" />
              <button onClick={closeModal} className="px-8 py-4 rounded-2xl text-slate-400 font-bold text-sm">Cancelar</button>
              <button onClick={handleSubmit} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Sparkles size={18} /> {editingHabit ? 'Salvar' : 'Plantar'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
