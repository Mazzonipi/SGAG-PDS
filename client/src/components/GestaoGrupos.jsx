import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { Users, Plus, Trash2, Shield, UserCheck, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function GestaoGrupos() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [perfis, setPerfis] = useState([]);

  const [nomeGrupo, setNomeGrupo] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [selectedGrupoId, setSelectedGrupoId] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittingGroup, setSubmittingGroup] = useState(false);
  const [submittingMember, setSubmittingMember] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const carregarTurmas = async () => {
    try {
      const data = await apiFetch('/turmas');
      setTurmas(data || []);
      if (data && data.length > 0 && !selectedTurma) {
        setSelectedTurma(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Falha ao carregar turmas');
    }
  };

  const carregarPerfis = async () => {
    try {
      const data = await apiFetch('/profiles');
      setPerfis(data || []);
    } catch (err) {
      console.error('Falha ao carregar perfis:', err);
    }
  };

  const carregarGrupos = async (turmaId) => {
    if (!turmaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/turmas/${turmaId}/grupos`);
      setGrupos(data || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar grupos da turma');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
    carregarPerfis();
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      carregarGrupos(selectedTurma);
    }
  }, [selectedTurma]);

  const handleCriarGrupo = async (e) => {
    e.preventDefault();
    if (!nomeGrupo.trim() || !selectedTurma) return;

    setSubmittingGroup(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/turmas/${selectedTurma}/grupos`, {
        method: 'POST',
        body: JSON.stringify({ nome_grupo: nomeGrupo.trim() }),
      });
      setMessage(`Grupo "${nomeGrupo}" criado com sucesso!`);
      setNomeGrupo('');
      carregarGrupos(selectedTurma);
    } catch (err) {
      setError(err.message || 'Erro ao criar grupo');
    } finally {
      setSubmittingGroup(false);
    }
  };

  const handleDeletarGrupo = async (grupoId, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o grupo "${nome}"?`)) return;

    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/grupos/${grupoId}`, { method: 'DELETE' });
      setMessage(`Grupo "${nome}" excluído com sucesso!`);
      carregarGrupos(selectedTurma);
    } catch (err) {
      setError(err.message || 'Erro ao excluir grupo');
    }
  };

  const handleAdicionarIntegrante = async (e, grupoId) => {
    e.preventDefault();
    if (!nomeAluno.trim()) return;

    setSubmittingMember(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/grupos/${grupoId}/integrantes`, {
        method: 'POST',
        body: JSON.stringify({ nome_aluno: nomeAluno.trim() }),
      });
      setMessage(`Integrante "${nomeAluno}" adicionado ao grupo!`);
      setNomeAluno('');
      setSelectedGrupoId('');
      carregarGrupos(selectedTurma);
    } catch (err) {
      setError(err.message || 'Erro ao adicionar integrante');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoverIntegrante = async (grupoId, integranteId, nome) => {
    if (!window.confirm(`Remover integrante "${nome}"?`)) return;

    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/grupos/${grupoId}/integrantes/${integranteId}`, { method: 'DELETE' });
      setMessage(`Integrante "${nome}" removido!`);
      carregarGrupos(selectedTurma);
    } catch (err) {
      setError(err.message || 'Erro ao remover integrante');
    }
  };

  const handleDesignarPapel = async (grupoId, perfilId, papel) => {
    if (!perfilId) return;

    setMessage(null);
    setError(null);

    const endpoint = papel === 'lider' ? `/grupos/${grupoId}/lider` : `/grupos/${grupoId}/vice-lider`;

    try {
      await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ perfil_id: perfilId }),
      });
      setMessage(`Designado com sucesso!`);
      carregarGrupos(selectedTurma);
    } catch (err) {
      setError(err.message || `Erro ao designar ${papel}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Gestão de Turmas e Grupos
          </h2>
          <p className="text-sm text-slate-400">
            Gerencie os grupos (máx 5/turma), seus integrantes (máx 7/grupo) e a designação de Líderes.
          </p>
        </div>

        {/* Seletor de Turma */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Turma:
          </label>
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-2 px-4 outline-none focus:border-indigo-500 font-semibold"
          >
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome_turma || t.codigo || t.id}
              </option>
            ))}
          </select>
        </div>
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

      {/* Criar Novo Grupo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Criar Novo Grupo na Turma Atual ({grupos.length}/5)
        </h3>

        <form onSubmit={handleCriarGrupo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nomeGrupo}
            onChange={(e) => setNomeGrupo(e.target.value)}
            placeholder="Nome do Grupo (ex: Grupo Alpha)"
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none transition-colors"
            required
            disabled={grupos.length >= 5}
          />
          <button
            type="submit"
            disabled={submittingGroup || grupos.length >= 5}
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {submittingGroup ? 'Criando...' : 'Criar Grupo'}
          </button>
        </form>
        {grupos.length >= 5 && (
          <p className="text-xs text-amber-400 mt-2">
            ⚠️ Limite de 5 grupos para esta turma foi atingido.
          </p>
        )}
      </div>

      {/* Lista de Grupos */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-6 h-6" />
          Carregando grupos da turma...
        </div>
      ) : grupos.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          Nenhum grupo cadastrado nesta turma ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grupos.map((g) => {
            const integrantes = g.integrantes || [];
            const lideres = perfis.filter((p) => p.role === 'lider');
            const viceLideres = perfis.filter((p) => p.role === 'vice_lider');

            return (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{g.nome_grupo}</h4>
                      <span className="text-xs text-slate-400">
                        {integrantes.length}/7 Integrantes
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletarGrupo(g.id, g.nome_grupo)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir Grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Designação de Líder e Vice-Líder */}
                  <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                        Líder do Grupo:
                      </label>
                      <select
                        value={g.lider_id || ''}
                        onChange={(e) => handleDesignarPapel(g.id, e.target.value, 'lider')}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg py-1.5 px-3 outline-none"
                      >
                        <option value="">-- Selecionar Líder --</option>
                        {lideres.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                        Vice-Líder do Grupo:
                      </label>
                      <select
                        value={g.vice_lider_id || ''}
                        onChange={(e) => handleDesignarPapel(g.id, e.target.value, 'vice_lider')}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg py-1.5 px-3 outline-none"
                      >
                        <option value="">-- Selecionar Vice-Líder --</option>
                        {viceLideres.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lista de Integrantes */}
                  <div className="space-y-2 mb-6">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Integrantes do Grupo
                    </h5>

                    {integrantes.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">Nenhum integrante adicionado.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {integrantes.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between bg-slate-950/40 px-3 py-2 rounded-lg text-sm text-slate-300 border border-slate-800/40"
                          >
                            <span>{m.nome_aluno}</span>
                            <button
                              onClick={() => handleRemoverIntegrante(g.id, m.id, m.nome_aluno)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title="Remover integrante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Form para Adicionar Integrante */}
                <form
                  onSubmit={(e) => handleAdicionarIntegrante(e, g.id)}
                  className="pt-4 border-t border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={selectedGrupoId === g.id ? nomeAluno : ''}
                    onChange={(e) => {
                      setSelectedGrupoId(g.id);
                      setNomeAluno(e.target.value);
                    }}
                    placeholder="Nome do Aluno..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-xl py-2 px-3 text-white outline-none"
                    disabled={integrantes.length >= 7}
                  />
                  <button
                    type="submit"
                    disabled={integrantes.length >= 7 || (selectedGrupoId === g.id && !nomeAluno.trim())}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-40"
                  >
                    + Add
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
