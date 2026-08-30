import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { Edit3, MessageSquare, Save, AlertCircle, CheckCircle } from 'lucide-react';

const CRITERIOS = [
  { key: 'pontualidade', label: 'Pontualidade' },
  { key: 'qualidade_trabalho', label: 'Qualidade do Trabalho' },
  { key: 'respeito_grupo', label: 'Respeito ao Grupo' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'iniciativa', label: 'Iniciativa' },
];

const NOTAS_OPCOES = [0.00, 0.05, 0.10, 0.15, 0.20];

export default function SobrescritaAvaliacao() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState('');

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [scores, setScores] = useState({});
  const [comentarios, setComentarios] = useState({});

  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

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

  const carregarGrupos = async (turmaId) => {
    if (!turmaId) return;
    try {
      const data = await apiFetch(`/turmas/${turmaId}/grupos`);
      setGrupos(data || []);
      if (data && data.length > 0) {
        setSelectedGrupoId(data[0].id);
      } else {
        setSelectedGrupoId('');
        setAvaliacoes([]);
      }
    } catch (err) {
      setError(err.message || 'Falha ao carregar grupos');
    }
  };

  const carregarAvaliacoes = async (grupoId) => {
    if (!grupoId) return;
    setLoading(true);
    setError(null);
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
      setError(err.message || 'Falha ao carregar avaliações do grupo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      carregarGrupos(selectedTurma);
    }
  }, [selectedTurma]);

  useEffect(() => {
    if (selectedGrupoId) {
      carregarAvaliacoes(selectedGrupoId);
    }
  }, [selectedGrupoId]);

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
      setError(`⚠️ O comentário de esclarecimento é OBRIGATÓRIO para a sobrescrita do Professor (aluno ${nomeAluno}).`);
      return;
    }

    setSubmittingId(integranteId);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/grupos/${selectedGrupoId}/avaliacoes/${integranteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...integranteScores,
          comentario_esclarecimento: comentario.trim(),
        }),
      });

      setMessage(`Avaliação de ${nomeAluno} sobrescrita pelo Professor com sucesso!`);
      carregarAvaliacoes(selectedGrupoId);
    } catch (err) {
      setError(err.message || 'Erro ao sobrescrever avaliação');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-indigo-400" />
            Sobrescrita de Avaliações pelo Professor
          </h2>
          <p className="text-sm text-slate-400">
            Ajuste notas de integrantes submetidas pelos líderes. Exige comentário de esclarecimento obrigatório.
          </p>
        </div>

        {/* Seletores de Turma e Grupo */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-2 px-3 outline-none"
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  Turma: {t.nome_turma || t.codigo || t.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGrupoId}
              onChange={(e) => setSelectedGrupoId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-2 px-3 outline-none"
            >
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  Grupo: {g.nome_grupo}
                </option>
              ))}
            </select>
          </div>
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

      {/* Tabela de Sobrescrita */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-6 h-6" />
          Carregando avaliações...
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          Nenhum integrante cadastrado ou avaliado neste grupo.
        </div>
      ) : (
        <div className="space-y-6">
          {avaliacoes.map((item) => {
            const integranteId = item.integrante_id;
            const nomeAluno = item.integrantes?.nome_aluno || item.nome_aluno || 'Aluno';
            const userScore = scores[integranteId] || {};

            return (
              <div key={integranteId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{nomeAluno}</h3>
                    {item.alterado_por_professor && (
                      <span className="text-xs text-amber-400 font-medium">
                        ✏️ Esta nota já foi alterada pelo Professor anteriormente.
                      </span>
                    )}
                  </div>
                </div>

                {/* Seleção de Critérios */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {CRITERIOS.map((c) => (
                    <div key={c.key} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {c.label}
                      </label>
                      <select
                        value={userScore[c.key] ?? 0.20}
                        onChange={(e) => handleScoreChange(integranteId, c.key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg py-1 px-2 text-white outline-none"
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

                {/* Comentário Obrigatório de Esclarecimento */}
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Comentário de Esclarecimento (Obrigatório) *
                  </label>
                  <textarea
                    rows={2}
                    value={comentarios[integranteId] || ''}
                    onChange={(e) => handleComentarioChange(integranteId, e.target.value)}
                    placeholder="Justifique a alteração da nota efetuada pelo Professor..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSobrescreverNota(integranteId, nomeAluno)}
                    disabled={submittingId === integranteId}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-amber-600/20 inline-flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submittingId === integranteId ? (
                      <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Sobrescrita
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
