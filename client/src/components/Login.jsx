import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, KeyRound, Mail } from 'lucide-react';

/**
 * Login screen para SGAG-PDS.
 * Design glassmorphism com gradiente CSS animado (leve, sem WebGL).
 */
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, senha);
    } catch (err) {
      setError(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoSenha) => {
    setEmail(demoEmail);
    setSenha(demoSenha);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#09090f]">

      {/* Gradiente animado CSS — leve e performático */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.10) 0%, transparent 55%), radial-gradient(ellipse at 60% 80%, rgba(34,255,136,0.07) 0%, transparent 50%)',
          animation: 'pulseGradient 8s ease-in-out infinite alternate',
        }}
      />

      {/* Grade de pontos decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <style>{`
        @keyframes pulseGradient {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease-out both; }
      `}</style>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md fade-in-up">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="p-4 rounded-2xl mb-4 border"
            style={{
              background: 'rgba(168,85,247,0.12)',
              borderColor: 'rgba(168,85,247,0.3)',
              boxShadow: '0 0 32px rgba(168,85,247,0.2)',
            }}
          >
            <GraduationCap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SGAG-PDS</h1>
          <p className="text-sm text-zinc-400 mt-1">Sistema de Gestão e Avaliação de Grupos</p>
        </div>

        {/* Formulário */}
        <div
          className="rounded-3xl p-8 border"
          style={{
            background: 'rgba(19,19,34,0.85)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.07)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.08)',
          }}
        >
          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="w-full py-2.5 pl-10 pr-4 text-sm text-white rounded-xl outline-none transition-all"
                  style={{
                    background: 'rgba(9,9,15,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full py-2.5 pl-10 pr-4 text-sm text-white rounded-xl outline-none transition-all"
                  style={{
                    background: 'rgba(9,9,15,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              id="btn-login"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                boxShadow: '0 0 20px rgba(168,85,247,0.3)',
              }}
            >
              {loading ? (
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>

        {/* Atalhos de Teste */}
        <div
          className="mt-4 rounded-2xl p-4 border"
          style={{
            background: 'rgba(19,19,34,0.6)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold text-center mb-3">
            Atalhos para Teste / Demonstração
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Professor', email: 'professor@sgag.com', senha: 'Senha123!', badge: 'bg-purple-900/40 text-purple-300' },
              { label: 'Líder',     email: 'lider1@sgag.com',    senha: 'Senha123!', badge: 'bg-blue-900/40 text-blue-300' },
            ].map(({ label, email: e, senha: s, badge }) => (
              <button
                key={e}
                type="button"
                onClick={() => handleQuickLogin(e, s)}
                className="text-xs text-zinc-300 py-2 px-3 rounded-lg text-left transition-colors flex items-center justify-between"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span>🔑 <strong>{label}:</strong> {e}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge}`}>Preencher</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
