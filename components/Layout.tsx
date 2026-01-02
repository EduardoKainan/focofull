
import React from 'react';
import { Home, Timer, Flower2, Briefcase, Activity, FolderKanban, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Hoje' },
    { id: 'work', icon: Briefcase, label: 'Trabalho' },
    { id: 'habits', icon: Activity, label: 'Hábitos' },
    { id: 'focus', icon: Timer, label: 'Foco' },
    { id: 'projects', icon: FolderKanban, label: 'Projetos' },
    { id: 'garden', icon: Flower2, label: 'Jardim' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">MindfulFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id || (item.id === 'garden' && activeScreen === 'evolution');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all text-sm ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles size={40} />
            </div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Coach</p>
            <p className="text-sm font-medium leading-relaxed">
              "Respire fundo. Cada passo conta."
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-32 md:pb-12">
          {children}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex justify-around items-center z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id || (item.id === 'garden' && activeScreen === 'evolution');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-indigo-600 scale-110' : 'text-slate-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
