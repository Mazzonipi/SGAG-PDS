import React from 'react';
import { GraduationCap, ArrowRight, ShieldCheck, Users, Edit3 } from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary-strong/30 overflow-x-hidden font-sans flex flex-col">
      
      {/* Navbar Minimalista */}
      <nav className="w-full px-6 py-6 border-b border-white/5 bg-surface/50 backdrop-blur-md fixed top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SGAG<span className="text-primary">-PDS</span></span>
        </div>
        <button 
          onClick={onLoginClick}
          className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
        >
          Acessar Sistema
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold uppercase tracking-widest mb-8 mt-12">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          Sistema de Gestão e Avaliação de Grupos
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 max-w-4xl tracking-tight leading-[1.1] mb-6">
          Avaliação de Projetos Finais sem Obstáculos.
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 leading-relaxed">
          Um formato interativo, limpo e totalmente digital. Substitua os formulários impressos por uma plataforma transparente onde líderes avaliam e professores têm o controle total em uma única tela.
        </p>
        
        <button 
          onClick={onLoginClick}
          className="bg-primary hover:bg-primary-strong text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] cursor-pointer"
        >
          Acessar como Professor ou Líder
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
          <div className="bg-surface border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Avaliação 360 Graus</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Líderes avaliam integrantes em 5 critérios com travas de submissão. Transparência na distribuição das notas do grupo.
            </p>
          </div>

          <div className="bg-surface border border-white/5 p-8 rounded-3xl hover:border-secondary/30 transition-colors group">
            <div className="bg-secondary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-secondary/20 group-hover:scale-110 transition-transform">
              <Edit3 className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Gestão Interativa</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Professores visualizam e editam notas na tela principal com uma gaveta interativa. Justificativa obrigatória em cada edição.
            </p>
          </div>

          <div className="bg-surface border border-white/5 p-8 rounded-3xl hover:border-accent/30 transition-colors group">
            <div className="bg-accent/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-accent/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Trilha de Auditoria</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Sistema imutável registra cada ação. Segurança e rastreabilidade total de tudo que acontece no sistema.
            </p>
          </div>
        </div>

      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-text-muted mt-auto">
        SGAG-PDS © {new Date().getFullYear()} - Sistema Simplificado de Avaliação
      </footer>

    </div>
  );
}
