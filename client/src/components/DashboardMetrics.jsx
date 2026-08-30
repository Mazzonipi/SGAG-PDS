import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { BarChart3, GraduationCap, Users, CheckCircle2, Clock, Filter, RefreshCw, ChevronDown, ChevronUp, Edit3, MessageSquare, Save, AlertCircle } from 'lucide-react';

const CRITERIOS = [
  { key: 'pontualidade', label: 'Pontualidade' },
  { key: 'qualidade_trabalho', label: 'Qualidade do Trabalho' },
  { key: 'respeito_grupo', label: 'Respeito ao Grupo' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'iniciativa', label: 'Iniciativa' },
];

const NOTAS_OPCOES = [0.00, 0.05, 0.10, 0.15, 0.20];

export default function DashboardMetrics() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [metricas, setMetricas] = useState(null);
  
  // Grupos state
  const [grupos, setGrupos] = useState([]);
  const [expandedGrupoId, setExpandedGrupoId] = useState(null);
  
  // Avaliações state for the expanded group
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [scores, setScores] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarTurmas = async () => {
    try {
      const data = await apiFetch('/turmas');
      setTurmas(data || []);
      // Auto-select first turma if none selected, to avoid empty state if preferred
      if (data && data.length > 0 && !selectedTurma) {
        setSelectedTurma(data[0].id);
      }
    } catch (err) {
      console.error('Falha ao carregar turmas:', err);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpointMetricas = selectedTurma ? `/dashboard?turmaId=${selectedTurma}` : '/dashboard';
      const metricaData = await apiFetch(endpointMetricas);
      setMetricas(metricaData);

      // Carregar Grupos
      let gruposData = [];
      if (selectedTurma) {
        gruposData = await apiFetch(`/turmas/${selectedTurma}/grupos`);
      } else {
        // Se todas as turmas, carrega grupos de todas em paralelo
        const allGruposReqs = turmas.map(t => apiFetch(`/turmas/${t.id}/grupos`).catch(() => []));
        const allGruposRes = await Promise.all(allGruposReqs);
        gruposData = allGruposRes.flat();
      }
      setGrupos(gruposData || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  useEffect(() => {
    if (turmas.length >= 0) {
      carregarDados();
      setExpandedGrupoId(null);
    }
  }, [selectedTurma, turmas]);

  const carregarAvaliacoesGrupo = async (grupoId) => {
    setLoadingAvaliacoes(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const data = await apiFetch(`/grupos/${grupoId}/avaliacoes`);
      setAvaliacoes(data || []);

      const initialScores = {};
      const initialComentarios = {};
      (data || []).forEach((item) => {
        initialScores[item.integrante_id] = {
          pontualidade: item.pontualidade ?? 0.20,
          qualidade_trabalho: item.qualidade_trabalho ?? 0.20,
          respeito_grupo: item.respeito_grupo ?? 0.20,
          comunicacao: item.comunicacao ?? 0.20,
          iniciativa: item.iniciativa ?? 0.20,
        };
        initialComentarios[item.integrante_id] = item.comentario_esclarecimento || '';
      });
      setScores(initialScores);
      setComentarios(initialComentarios);
    } catch (err) {
      setActionError(err.message || 'Falha ao carregar avaliações do grupo');
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  const handleToggleGrupo = (grupoId) => {
    if (expandedGrupoId === grupoId) {
      setExpandedGrupoId(null);
    } else {
      setExpandedGrupoId(grupoId);
      carregarAvaliacoesGrupo(grupoId);
    }
  };

  const handleScoreChange = (integranteId, criterio, valor) => {
    setScores((prev) => ({
      ...prev,
      [integranteId]: {
        ...(prev[integranteId] || {}),
        [criterio]: parseFloat(valor),
      },
    }));
  };

  const handleComentarioChange = (integranteId, texto) => {
    setComentarios((prev) => ({
      ...prev,
      [integranteId]: texto,
    }));
  };

  const handleSobrescreverNota = async (integranteId, nomeAluno) => {
    const integranteScores = scores[integranteId];
    const comentario = comentarios[integranteId];

    if (!comentario || !comentario.trim()) {
      setActionError(`⚠️ O comentário de esclarecimento é OBRIGATÓRIO para a sobrescrita do Professor (aluno ${nomeAluno}).`);
      return;
    }

    setSubmittingId(integranteId);
    setActionMessage(null);
    setActionError(null);

    try {
      await apiFetch(`/grupos/${expandedGrupoId}/avaliacoes/${integranteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...integranteScores,
          comentario_esclarecimento: comentario.trim(),
        }),
      });

      setActionMessage(`Avaliação de ${nomeAluno} salva com sucesso!`);
      // Recarrega avaliações do grupo atual para garantir status
      await carregarAvaliacoesGrupo(expandedGrupoId);
      // Recarrega métricas globais para refletir nova conclusão se houver
      await carregarDados();
    } catch (err) {
      setActionError(err.message || 'Erro ao sobrescrever avaliação');
    } finally {
      setSubmittingId(null);
    }
  };

  const concluidas = metricas?.avaliacoes?.concluidas ?? 0;
  const pendentes = metricas?.avaliacoes?.pendentes ?? 0;
  const totalAvaliacoes = concluidas + pendentes;
  const percentualConcluido = totalAvaliacoes > 0 ? Math.round((concluidas / totalAvaliacoes) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Dashboard & Gestão de Grupos
          </h2>
          <p className="text-sm text-slate-400">
            Acompanhe o preenchimento de avaliações e gerencie notas em uma única tela.
          </p>
        </div>

        {/* Filtro por Turma */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-2 px-4 outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="">Todas as Turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                Turma: {t.nome_turma || t.codigo || t.id}
              </option>
            ))}
          </select>

          <button
            onClick={carregarDados}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-8 h-8" />
          Carregando informações...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Cards Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Turmas</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{metricas?.total_turmas ?? 0}</h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupos</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{metricas?.total_grupos ?? 0}</h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concluídas</p>
                <h3 className="text-3xl font-bold text-emerald-400 tracking-tight">{concluidas}</h3>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-2xl">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendentes</p>
                <h3 className="text-3xl font-bold text-amber-400 tracking-tight">{pendentes < 0 ? 0 : pendentes}</h3>
              </div>
            </div>
          </div>

          {/* Lista de Grupos Expansível */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Gerenciar Avaliações dos Grupos</h3>
            {grupos.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                Nenhum grupo encontrado para a seleção.
              </div>
            ) : (
              <div className="space-y-4">
                {grupos.map((grupo) => {
                  const isExpanded = expandedGrupoId === grupo.id;
                  
                  return (
                    <div key={grupo.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
                      {/* Accordion Header */}
                      <button 
                        onClick={() => handleToggleGrupo(grupo.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors focus:outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-indigo-400" />
                          <div className="text-left">
                            <h4 className="text-base font-bold text-white">{grupo.nome_grupo}</h4>
                            <p className="text-xs text-slate-400">Turma: {turmas.find(t => t.id === grupo.turma_id)?.nome_turma || 'N/A'}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {/* Accordion Body (Avaliações) */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-slate-800 bg-slate-900/40">
                          {actionMessage && (
                            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              {actionMessage}
                            </div>
                          )}
                          {actionError && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              {actionError}
                            </div>
                          )}

                          {loadingAvaliacoes ? (
                            <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                              <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-4 h-4" />
                              Carregando notas...
                            </div>
                          ) : avaliacoes.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm">
                              Nenhum integrante cadastrado ou avaliado neste grupo.
                            </div>
                          ) : (
                            <div className="mt-4 space-y-5">
                              {avaliacoes.map((item) => {
                                const integranteId = item.integrante_id;
                                const nomeAluno = item.integrantes?.nome_aluno || item.nome_aluno || 'Aluno';
                                const userScore = scores[integranteId] || {};
                                const isDirty = (
                                  userScore.pontualidade !== item.pontualidade ||
                                  userScore.qualidade_trabalho !== item.qualidade_trabalho ||
                                  userScore.respeito_grupo !== item.respeito_grupo ||
                                  userScore.comunicacao !== item.comunicacao ||
                                  userScore.iniciativa !== item.iniciativa
                                );
                                const showEsclarecimento = isDirty || item.alterado_por_professor;

                                return (
                                  <div key={integranteId} className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative">
                                    <div className="flex items-center justify-between mb-4">
                                      <h5 className="font-bold text-white text-sm">{nomeAluno}</h5>
                                      {item.alterado_por_professor && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                                          ✏️ Alterado por Professor
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                      {CRITERIOS.map((c) => (
                                        <div key={c.key}>
                                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            {c.label}
                                          </label>
                                          <select
                                            value={userScore[c.key] ?? 0.20}
                                            onChange={(e) => handleScoreChange(integranteId, c.key, e.target.value)}
                                            className={`w-full text-xs rounded-lg py-1.5 px-2 outline-none transition-colors ${
                                              userScore[c.key] !== (item[c.key] ?? 0.20)
                                                ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300'
                                                : 'bg-slate-900 border border-slate-700 text-white'
                                            }`}
                                          >
                                            {NOTAS_OPCOES.map((n) => (
                                              <option key={n} value={n}>
                                                {n.toFixed(2)}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Mostrar Esclarecimento Apenas se Habilitado */}
                                    <div className={`mt-4 transition-all duration-300 overflow-hidden ${showEsclarecimento ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                      <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Justificativa da Alteração (Obrigatório)
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={comentarios[integranteId] || ''}
                                        onChange={(e) => handleComentarioChange(integranteId, e.target.value)}
                                        placeholder="Por que esta nota está sendo sobrescrita?"
                                        className="w-full bg-slate-900 border border-amber-500/30 focus:border-amber-500 rounded-xl p-2.5 text-white text-xs outline-none"
                                      />
                                    </div>

                                    {/* Botão de Salvar visível ao alterar */}
                                    {(showEsclarecimento) && (
                                      <div className="mt-3 flex justify-end">
                                        <button
                                          onClick={() => handleSobrescreverNota(integranteId, nomeAluno)}
                                          disabled={submittingId === integranteId}
                                          className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
                                        >
                                          {submittingId === integranteId ? (
                                            <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
                                          ) : (
                                            <>
                                              <Save className="w-3.5 h-3.5" />
                                              Confirmar Nota
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
