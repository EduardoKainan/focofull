
import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Task, Screen, Habit, Project, GamificationState, WorkTask } from './types';
import Layout from './components/Layout';
import AICoach from './components/AICoach';
import Auth from './screens/Auth';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Focus from './screens/Focus';
import Garden from './screens/Garden';
import Evolution from './screens/Evolution';
import Habits from './screens/Habits';
import Projects from './screens/Projects';
import Work from './screens/Work';
import { supabase, handleSupabaseError } from './services/supabase';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('auth');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gamification, setGamification] = useState<GamificationState>({
    glowPoints: 0,
    level: 1,
    unlockedElements: ['basic_flower'],
    lastActionDate: new Date().toISOString(),
    history: []
  });
  const [coachContext, setCoachContext] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) {
        setActiveScreen('auth');
        setIsSyncing(false);
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').single();
      
      if (!profileData || !profileData.onboarding_completed) {
        if (!['auth', 'onboarding'].includes(activeScreen)) setActiveScreen('onboarding');
      } else {
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name || 'Viajante',
          energyLevel: profileData.energy_level || 5,
          difficulties: profileData.difficulties || [],
          onboardingCompleted: true
        });
        setGamification(prev => ({
          ...prev,
          glowPoints: profileData.glow_points || 0,
          level: profileData.current_level || 1
        }));
        if (activeScreen === 'auth' || activeScreen === 'onboarding') setActiveScreen('home');
      }

      const [hRes, pRes, wRes] = await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('work_tasks').select('*')
      ]);

      if (hRes.data) {
        setHabits(hRes.data.map((h: any) => ({
          id: h.id,
          name: h.name,
          microAction: h.micro_action || 'Ação rápida',
          completedToday: h.completed_today || false,
          icon: h.icon || '🌱',
          projectId: h.project_id
        })));
      }
      if (pRes.data) {
        setProjects(pRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          nextAction: p.next_action || 'Definir passo',
          status: p.status || 'active'
        })));
      }
      if (wRes.data) {
        setWorkTasks(wRes.data.map((w: any) => ({
          id: w.id,
          title: w.title,
          description: w.description,
          energyRequired: w.energy_required || 2,
          status: w.status || 'pending'
        })));
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [activeScreen]);

  useEffect(() => {
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      if (session) fetchData();
      else setActiveScreen('auth');
    });
    return () => subscription.unsubscribe();
  }, [fetchData]);

  const addGlow = async (amount: number) => {
    setGamification(prev => ({
      ...prev,
      glowPoints: prev.glowPoints + amount,
      level: Math.floor((prev.glowPoints + amount) / 100) + 1
    }));
    try { await supabase.rpc('add_glow_points', { points_to_add: amount }); } catch (e) {}
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'completedToday'>) => {
    const tempId = Math.random().toString();
    setHabits(prev => [...prev, { ...habitData, id: tempId, completedToday: false }]);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { error } = await supabase.from('habits').insert([{
        user_id: user.id,
        name: habitData.name,
        micro_action: habitData.microAction,
        icon: habitData.icon
      }]);
      if (error) throw error;
      fetchData();
    } catch (error) {
      handleSupabaseError(error);
      setHabits(prev => prev.filter(h => h.id !== tempId));
    }
  };

  const toggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const newState = !habit.completedToday;
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: newState } : h));
    if (newState) addGlow(15);
    try { await supabase.from('habits').update({ completed_today: newState }).eq('id', id); } catch (e) {}
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'status'>) => {
    const tempId = Math.random().toString();
    setProjects(prev => [...prev, { ...projectData, id: tempId, status: 'active' }]);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { error } = await supabase.from('projects').insert([{
        user_id: user.id,
        name: projectData.name,
        next_action: projectData.nextAction,
        status: 'active'
      }]);
      if (error) throw error;
      fetchData();
    } catch (error) {
      handleSupabaseError(error);
      setProjects(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const completeProjectAction = async (id: string) => {
    addGlow(25);
    setCoachContext("Incrível! Qual o próximo mini-passo para este sonho?");
    try {
      await supabase.from('projects').update({ next_action: '...' }).eq('id', id);
      fetchData();
    } catch (e) {}
  };

  const addWorkTask = async (task: Omit<WorkTask, 'id' | 'status'>) => {
    const tempId = Math.random().toString();
    setWorkTasks(prev => [...prev, { ...task, id: tempId, status: 'pending' }]);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (user) {
        const { error } = await supabase.from('work_tasks').insert([{
          user_id: user.id,
          title: task.title,
          description: task.description,
          energy_required: task.energyRequired,
          status: 'pending'
        }]);
        if (error) throw error;
        fetchData();
      }
    } catch (e) {
      setWorkTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const completeWorkTask = async (id: string) => {
    setWorkTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
    addGlow(20);
    try { await supabase.from('work_tasks').update({ status: 'done' }).eq('id', id); } catch (e) {}
  };

  const deleteWorkTask = async (id: string) => {
    setWorkTasks(prev => prev.filter(t => t.id !== id));
    try { await supabase.from('work_tasks').delete().eq('id', id); } catch (e) {}
  };

  const handleUpdateEnergy = async (level: number) => {
    if (profile) setProfile({ ...profile, energyLevel: level });
    try { await supabase.from('profiles').update({ energy_level: level }).eq('id', profile?.id); } catch (e) {}
  };

  const renderScreen = () => {
    if (activeScreen === 'auth') return <Auth onSuccess={fetchData} />;
    if (activeScreen === 'onboarding') return <Onboarding onComplete={fetchData} />;

    const homeTasks: Task[] = workTasks.filter(t => t.status !== 'done').map(t => ({
      id: t.id,
      title: t.title,
      nextStep: t.description || 'Passo a passo',
      block: t.energyRequired === 3 ? 'morning' : t.energyRequired === 2 ? 'afternoon' : 'evening',
      status: 'pending'
    }));

    return (
      <Layout activeScreen={activeScreen} onNavigate={setActiveScreen}>
        {activeScreen === 'home' && (
          <Home 
            tasks={homeTasks} 
            energyLevel={profile?.energyLevel || 5} 
            glowPoints={gamification.glowPoints} 
            onCompleteTask={completeWorkTask}
            onUpdateEnergy={handleUpdateEnergy}
          />
        )}
        {activeScreen === 'work' && (
          <Work tasks={workTasks} onCompleteTask={completeWorkTask} onAddTask={addWorkTask} onDeleteTask={deleteWorkTask} />
        )}
        {activeScreen === 'habits' && (
          <Habits habits={habits} projects={projects} onToggleHabit={toggleHabit} onAddHabit={addHabit} />
        )}
        {activeScreen === 'projects' && (
          <Projects projects={projects} habits={habits} onCompleteNextAction={completeProjectAction} onAddProject={addProject} />
        )}
        {activeScreen === 'focus' && <Focus onComplete={(m) => addGlow(m * 2)} />}
        {activeScreen === 'garden' && <Garden state={gamification} />}
        {activeScreen === 'evolution' && <Evolution history={gamification.history} />}
        <AICoach context={coachContext} />
      </Layout>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {activeScreen !== 'auth' && activeScreen !== 'onboarding' && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isSyncing ? 'Sincronizando' : 'Nuvem Ativa'}
          </span>
        </div>
      )}
      {renderScreen()}
    </div>
  );
};

export default App;
