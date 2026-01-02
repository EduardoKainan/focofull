
import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Task, Screen, Habit, Project, GamificationState, DailyStat, WorkTask } from './types';
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
  const [tasks, setTasks] = useState<Task[]>([]);
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
    console.log('App: Sincronizando dados...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('App: Sem usuário.');
        setActiveScreen('auth');
        setIsSyncing(false);
        return;
      }

      // Carregar Perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      // LÓGICA DE PROTEÇÃO CONTRA LOOP:
      // Se estamos em uma tela de "conteúdo", não forçamos a volta para o onboarding mesmo que o fetch demore
      const isInsideApp = ['home', 'work', 'habits', 'projects', 'focus', 'garden', 'evolution'].includes(activeScreen);

      if (profileError || !profileData || !profileData.onboarding_completed) {
        if (!isInsideApp) {
          console.log('App: Onboarding necessário.');
          setActiveScreen('onboarding');
        } else {
          console.log('App: Perfil incompleto no banco, mas usuário já está na Home. Mantendo.');
        }
      } else {
        console.log('App: Perfil ok.');
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name || 'Viajante',
          energyLevel: profileData.energy_level,
          difficulties: profileData.difficulties,
          onboardingCompleted: profileData.onboarding_completed
        });
        setGamification(prev => ({
          ...prev,
          glowPoints: profileData.glow_points || 0,
          level: profileData.current_level || 1
        }));
        
        // Só mudamos para home se estivermos saindo de uma tela de "bloqueio"
        if (activeScreen === 'auth' || activeScreen === 'onboarding') {
          setActiveScreen('home');
        }
      }

      // Carregar Restante dos Dados
      const [{ data: habitsData }, { data: projectsData }, { data: workData }] = await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('work_tasks').select('*')
      ]);

      if (habitsData) setHabits(habitsData as any);
      if (projectsData) setProjects(projectsData as any);
      if (workData) setWorkTasks(workData as any);

    } catch (error) {
      handleSupabaseError(error);
    } finally {
      setIsSyncing(false);
    }
  }, [activeScreen]); // activeScreen adicionado aqui para a lógica de proteção

  // Observar mudanças na sessão
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchData();
      } else {
        setActiveScreen('auth');
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const addGlow = async (amount: number) => {
    setGamification(prev => {
      const newPoints = prev.glowPoints + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      return { ...prev, glowPoints: newPoints, level: newLevel };
    });

    try {
      await supabase.rpc('add_glow_points', { points_to_add: amount });
    } catch (error) {
      handleSupabaseError(error);
    }
  };

  const completeWorkTask = async (id: string) => {
    setWorkTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
    addGlow(25);
    
    try {
      await supabase.from('work_tasks').update({ status: 'done' }).eq('id', id);
      setCoachContext("Um passo gigante na sua carreira. Respire e descanse agora.");
    } catch (error) {
      handleSupabaseError(error);
    }
  };

  const addWorkTask = async (task: Omit<WorkTask, 'id' | 'status'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_tasks')
        .insert([{ ...task, user_id: user.id, status: 'pending' }])
        .select()
        .single();
      
      if (data) {
        setWorkTasks(prev => [...prev, data as any]);
        setCoachContext("Nova missão profissional aceita. Vamos com calma.");
      }
    } catch (error) {
      handleSupabaseError(error);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    // 1. Transição Otimista Imediata para evitar o loop
    setActiveScreen('home');
    setProfile(prev => ({
      ...(prev || {}),
      id: 'pending',
      fullName: 'Viajante',
      energyLevel: data.energy,
      difficulties: data.difficulties,
      onboardingCompleted: true
    } as Profile));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('App: Persistindo onboarding no Supabase...');
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          energy_level: data.energy,
          difficulties: data.difficulties,
          onboarding_completed: true,
          full_name: 'Viajante'
        });

        if (error) {
          console.error('App: Erro detalhado ao finalizar onboarding:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log('App: Sucesso. Atualizando dados...');
        await fetchData();
      }
    } catch (error) {
      // Já estamos na home (estado otimista), não interrompemos o fluxo
      handleSupabaseError(error);
    }
  };

  const renderScreen = () => {
    if (activeScreen === 'auth') return <Auth onSuccess={fetchData} />;
    if (activeScreen === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

    return (
      <Layout activeScreen={activeScreen} onNavigate={setActiveScreen}>
        {activeScreen === 'home' && <Home tasks={tasks} energyLevel={profile?.energyLevel || 5} onCompleteTask={() => {}} glowPoints={gamification.glowPoints} />}
        {activeScreen === 'work' && <Work tasks={workTasks} onCompleteTask={completeWorkTask} onAddTask={addWorkTask} onDeleteTask={() => {}} />}
        {activeScreen === 'habits' && <Habits habits={habits} projects={projects} onToggleHabit={(id) => {}} />}
        {activeScreen === 'projects' && <Projects projects={projects} habits={habits} onCompleteNextAction={(id) => {}} />}
        {activeScreen === 'focus' && <Focus onComplete={(m) => addGlow(m * 2)} />}
        {activeScreen === 'garden' && <Garden state={gamification} />}
        {activeScreen === 'evolution' && <Evolution history={gamification.history} />}
        <AICoach context={coachContext} />
      </Layout>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Indicador de Nuvem */}
      {activeScreen !== 'auth' && activeScreen !== 'onboarding' && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
          {isSyncing ? (
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
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
