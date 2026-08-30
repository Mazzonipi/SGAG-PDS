import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Users, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  GraduationCap 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'professor':
        return <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Professor</span>;
      case 'lider':
        return <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Líder</span>;
      case 'vice_lider':
        return <span className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Vice-Líder</span>;
      default:
        return <span className="bg-gray-600/20 text-gray-400 text-xs px-2.5 py-1 rounded-full">{role}</span>;
    }
  };

  const tabClass = (tab) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      activeTab === tab
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const mobileTabClass = (tab) =>
    `px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
      activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SGAG-PDS</h1>
              <p className="text-xs text-slate-400">Gestão &amp; Avaliação de Grupos</p>
            </div>
          </div>

          {/* Abas Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.role === 'professor' && (
              <>
                {/* Dashboard é a tela principal do professor */}
                <button onClick={() => setActiveTab('dashboard')} className={tabClass('dashboard')}>
                  <BarChart3 className="w-4 h-4" />
                  Início / Grupos
                </button>

                <button onClick={() => setActiveTab('cadastro')} className={tabClass('cadastro')}>
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Perfis
                </button>

                <button onClick={() => setActiveTab('grupos')} className={tabClass('grupos')}>
                  <Users className="w-4 h-4" />
                  Turmas &amp; Grupos
                </button>

                <button onClick={() => setActiveTab('audit')} className={tabClass('audit')}>
                  <ShieldCheck className="w-4 h-4" />
                  Auditoria
                </button>
              </>
            )}

            {(user?.role === 'lider' || user?.role === 'vice_lider') && (
              <>
                <button onClick={() => setActiveTab('matriz')} className={tabClass('matriz')}>
                  <CheckSquare className="w-4 h-4" />
                  Matriz de Avaliação
                </button>

                <button onClick={() => setActiveTab('dashboard')} className={tabClass('dashboard')}>
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
              </>
            )}
          </nav>

          {/* Usuário e Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user?.nome}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            {getRoleBadge(user?.role)}
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas Mobile */}
        <div className="flex md:hidden border-t border-slate-800 py-2 gap-1 overflow-x-auto">
          {user?.role === 'professor' && (
            <>
              <button onClick={() => setActiveTab('dashboard')} className={mobileTabClass('dashboard')}>
                Início
              </button>
              <button onClick={() => setActiveTab('cadastro')} className={mobileTabClass('cadastro')}>
                Cadastrar
              </button>
              <button onClick={() => setActiveTab('grupos')} className={mobileTabClass('grupos')}>
                Grupos
              </button>
              <button onClick={() => setActiveTab('audit')} className={mobileTabClass('audit')}>
                Auditoria
              </button>
            </>
          )}
          {(user?.role === 'lider' || user?.role === 'vice_lider') && (
            <>
              <button onClick={() => setActiveTab('matriz')} className={mobileTabClass('matriz')}>
                Matriz
              </button>
              <button onClick={() => setActiveTab('dashboard')} className={mobileTabClass('dashboard')}>
                Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
