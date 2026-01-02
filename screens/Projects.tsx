
import React, { useState } from 'react';
import { FolderKanban, Play, CheckCircle2, ArrowRight, Sparkles, Plus, Edit3, Trash2, X, Clock, Shuffle, BellOff, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { Project, ReminderType, Habit } from '../types';
import { generateProjectPlan } from '../services/gemini';

interface ProjectsProps {
  projects: Project[];
  habits: Habit[];
  onCompleteNextAction: (id: string) => void;
  onAddProject?: (project: Omit<Project, 'id' | 'status'>) => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
  onUpdateHabit?: (habit: Habit) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, habits, onCompleteNextAction, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  
  // Fix: Explicitly define the state type to allow optional reminder fields, matching the Project interface
  const [formData, setFormData] = useState<{
    name: string;
    nextAction: string;
    reminder: {
      type: ReminderType;
      windowStart?: string;
      windowEnd?: string;
    };
  }>({
    name: '',
    nextAction: '',
    reminder: { type: 'none', windowStart: '09:00', windowEnd: '11:00' }
  });

  const handleAiGenerate = async () => {
    if (!aiGoal) return;
    setIsGenerating(true);
    try {
      const plan = await generateProjectPlan(aiGoal);
      setFormData({
        ...formData,
        name: plan.name,
        nextAction: plan.nextAction
      });
      setAiGoal('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    // Fix: Properly assign optional reminder fields
    setFormData({
      name: project.name,
      nextAction: project.nextAction,
      reminder: project.reminder || { type: 'none', windowStart: '09:00', windowEnd: '11:00' }
    });
    setIsAddingNew(false);
  };

  const openAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      nextAction: '',
      reminder: { type: 'none', windowStart: '09:00', windowEnd: '11:00' }
    });
    setIsAddingNew(true);
  };

  const closeModal = () => {
    setEditingProject(null);
    setIsAddingNew(false);
    setAiGoal('');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.nextAction) return;
    if (editingProject) {
      onUpdateProject?.({ ...editingProject, ...formData });
    } else {
      onAddProject?.(formData);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (editingProject && onDeleteProject) {
      onDeleteProject(editingProject.id);
      closeModal();
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-[0.3em]">Sonhos</h1>
          <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Grandes Jornadas</h2>
        </div>
        <button onClick={openAdd} className="w-14 h-14 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-110 transition-all active:scale-95">
          <Plus size={28} />
        </button>
      </header>

      <div className="bg-amber-50 p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center gap-6 border border-amber-100">
        <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
          <FolderKanban size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950 mb-1">Passos de formiga, mente de gigante</h3>
          <p className="text-sm text-amber-900/60 font-medium leading-relaxed">
            Não consegue quebrar um objetivo grande? Use a varinha mágica da IA ao criar um novo sonho.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map(project => {
          const linkedHabits = habits.filter(h => h.projectId === project.id);
          return (
            <div key={project.id} className="bg-white rounded-[48px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FolderKanban size={120} />
              </div>
              
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{project.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em Florescimento</span>
                  </div>
                </div>
                <button onClick={() => openEdit(project)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <Edit3 size={20} />
                </button>
              </div>

              <div className="bg-slate-50/80 backdrop-blur-sm rounded-[32px] p-8 border border-slate-100 mb-6 flex-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-4">Única próxima ação:</span>
                <p className="text-slate-700 font-bold text-xl mb-8 flex items-start gap-3 leading-tight">
                  <ArrowRight size={24} className="text-indigo-400 mt-1 shrink-0" />
                  {project.nextAction}
                </p>
                
                <button 
                  onClick={() => onCompleteNextAction(project.id)}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 size={20} /> Finalizar micro-etapa
                </button>
              </div>

              {linkedHabits.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Hábitos Nutrientes:</span>
                  <div className="flex flex-wrap gap-2">
                    {linkedHabits.map(h => (
                      <div key={h.id} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold ${h.completedToday ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                        <span>{h.icon}</span>
                        <span>{h.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(editingProject || isAddingNew) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl relative animate-in zoom-in duration-500 max-h-[90vh] flex flex-col">
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <button onClick={closeModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all z-20">
                <X size={24} />
              </button>

              <header className="mb-10">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {editingProject ? <Edit3 size={28} /> : <Sparkles size={28} />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  {editingProject ? 'Refinar Sonho' : 'Novo Sonho Inteligente'}
                </h3>
                <p className="text-slate-500 font-medium">Dividir para conquistar. Use a IA para quebrar seu grande plano.</p>
              </header>

              {!editingProject && (
                <div className="mb-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3 ml-1">O que você quer conquistar? (IA)</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Ex: Abrir meu próprio negócio" 
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Sonho</label>
                  <input type="text" placeholder="Ex: Aprender a tocar Piano" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">A Próxima Pequena Ação</label>
                  <input type="text" placeholder="Ex: Abrir o app de piano" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700" value={formData.nextAction} onChange={e => setFormData({...formData, nextAction: e.target.value})} />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lembrete Flexível para Ação</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFormData({...formData, reminder: {...formData.reminder, type: 'none'}})} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reminder.type === 'none' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                      <BellOff size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">Nenhum</span>
                    </button>
                    <button onClick={() => setFormData({...formData, reminder: {...formData.reminder, type: 'fixed_window'}})} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.reminder.type === 'fixed_window' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                      <Clock size={20} /> <span className="text-[11px] font-black uppercase tracking-widest">Janela</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
              {editingProject && <button onClick={handleDelete} className="px-6 py-4 rounded-2xl border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-all"><Trash2 size={18} /></button>}
              <div className="flex-1" />
              <button onClick={closeModal} className="px-8 py-4 rounded-2xl text-slate-400 font-bold text-sm">Cancelar</button>
              <button onClick={handleSubmit} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Sparkles size={18} /> {editingProject ? 'Salvar Sonho' : 'Iniciar Sonho'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
