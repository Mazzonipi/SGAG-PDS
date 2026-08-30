import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import CadastroPerfil from './components/CadastroPerfil';
import GestaoGrupos from './components/GestaoGrupos';
import MatrizAvaliacao from './components/MatrizAvaliacao';
import SobrescritaAvaliacao from './components/SobrescritaAvaliacao'; // mantido para compatibilidade de testes
import DashboardMetrics from './components/DashboardMetrics';
import AuditLogs from './components/AuditLogs';
import LandingPage from './components/LandingPage';

function MainContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user?.role === 'professor') {
      setActiveTab('dashboard'); // Dashboard unificado é a tela principal do Professor
    } else if (user?.role === 'lider' || user?.role === 'vice_lider') {
      setActiveTab('matriz');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 gap-3">
        <span className="inline-block animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10" />
        <p className="text-sm font-medium">Carregando SGAG-PDS...</p>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <Login />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'professor' && (
          <>
            {activeTab === 'cadastro' && <CadastroPerfil />}
            {activeTab === 'grupos' && <GestaoGrupos />}
            {activeTab === 'audit' && <AuditLogs />}
          </>
        )}

        {(user.role === 'lider' || user.role === 'vice_lider') && (
          <>
            {activeTab === 'matriz' && <MatrizAvaliacao />}
          </>
        )}

        {activeTab === 'dashboard' && <DashboardMetrics />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        SGAG-PDS &copy; {new Date().getFullYear()} &mdash; Sistema de Gestão e Avaliação de Grupos
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
