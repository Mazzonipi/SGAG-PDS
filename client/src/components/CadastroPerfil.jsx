import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { UserPlus, Users, CheckCircle, AlertCircle, RefreshCw, Shield, Mail, User, Key } from 'lucide-react';

export default function CadastroPerfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('lider');

  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const carregarPerfis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/profiles');
      setPerfis(data || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar a lista de perfis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!nome || !email || !senha || !role) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      const novoperfil = await apiFetch('/profiles', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, role }),
      });

      setMessage(`Perfil de ${role === 'lider' ? 'Líder' : 'Vice-Líder'} (${novoperfil.nome}) cadastrado com sucesso!`);
      setNome('');
      setEmail('');
      setSenha('');
      setRole('lider');

      // Recarrega a lista de perfis
      carregarPerfis();
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar novo perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-400" />
            Cadastro Administrativo de Perfis
          </h2>
          <p className="text-sm text-slate-400">
            Cadastre as contas de acesso para os Líderes e Vice-Líderes das turmas.
          </p>
        </div>
        <button
          onClick={carregarPerfis}
          disabled={loading}
          className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg transition-colors border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Alertas */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>{message}</div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Grid: Formulário + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Novo Perfil
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-white text-sm outline-none transition-colors placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lider@exemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-white text-sm outline-none transition-colors placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-white text-sm outline-none transition-colors placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Papel / Função *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-white text-sm outline-none transition-colors"
              >
                <option value="lider">Líder de Grupo</option>
                <option value="vice_lider">Vice-Líder de Grupo</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              {submitting ? (
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Perfil
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabela de Perfis Cadastrados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Perfis Cadastrados ({perfis.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
              <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-6 h-6" />
              Carregando perfis...
            </div>
          ) : perfis.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
              Nenhum Líder ou Vice-Líder cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Papel</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {perfis.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">{p.nome}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.email}</td>
                      <td className="py-3.5 px-4">
                        {p.role === 'lider' ? (
                          <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Líder
                          </span>
                        ) : (
                          <span className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Vice-Líder
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
