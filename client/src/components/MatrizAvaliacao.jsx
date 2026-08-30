import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { CheckSquare, Lock, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const CRITERIOS = [
  { key: 'pontualidade', label: 'Pontualidade' },
  { key: 'qualidade_trabalho', label: 'Qualidade do Trabalho' },
  { key: 'respeito_grupo', label: 'Respeito ao Grupo' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'iniciativa', label: 'Iniciativa' },
];

const NOTAS_OPCOES = [0.00, 0.05, 0.10, 0.15, 0.20];

export default function MatrizAvaliacao() {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [readOnly, setReadOnly] = useState(false);

  const [scores, setScores] = useState({}); // { integranteId: { pontualidade, ... } }
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const carregarGrupos = async () => {
    try {
      // Como o Líder/Vice está vinculado a um grupo, carregamos as turmas para encontrar seu grupo
      const turmasData = await apiFetch('/turmas');
      let allGrupos = [];
      for (const t of turmasData) {
        const gList = await apiFetch(`/turmas/${t.id}/grupos`);
        allGrupos = [...allGrupos, ...gList];
      }
      setGrupos(allGrupos);
      if (allGrupos.length > 0 && !selectedGrupoId) {
        setSelectedGrupoId(allGrupos[0].id);
      }
    } catch (err) {
      setError(err.message || 'Falha ao carregar grupos');
    }
  };

  const carregarAvaliacoes = async (grupoId) => {
    if (!grupoId) return;
    setLoading(true);
    setError(null);
    setReadOnly(false);

    try {
      const data = await apiFetch(`/grupos/${grupoId}/avaliacoes`);
      setAvaliacoes(data || []);

      // Preenche o estado local dos scores
      const initialScores = {};
      (data || []).forEach((item) => {
        initialScores[item.integrante_id] = {
          pontualidade: item.pontualidade ?? 0.20,
          qualidade_trabalho: item.qualidade_trabalho ?? 0.20,
          respeito_grupo: item.respeito_grupo ?? 0.20,
          comunicacao: item.comunicacao ?? 0.20,
          iniciativa: item.iniciativa ?? 0.20,
        };
      });
      setScores(initialScores);
    } catch (err) {
      if (err.status === 403) {
        setReadOnly(true);
        setError('🔒 O Líder do grupo já submeteu a avaliação. Seu acesso está em modo somente leitura.');
      } else {
        setError(err.message || 'Falha ao carregar avaliações do grupo');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (selectedGrupoId) {
      carregarAvaliacoes(selectedGrupoId);
    }
  }, [selectedGrupoId]);

  const handleScoreChange = (integranteId, criterio, valor) => {
    if (readOnly) return;

    setScores((prev) => ({
      ...prev,
      [integranteId]: {
        ...(prev[integranteId] || {
          pontualidade: 0.20,
          qualidade_trabalho: 0.20,
          respeito_grupo: 0.20,
          comunicacao: 0.20,
          iniciativa: 0.20,
        }),
        [criterio]: parseFloat(valor),
      },
    }));
  };

  const handleSalvarIntegrante = async (integranteId, nomeAluno) => {
    if (readOnly) return;
    const integranteScores = scores[integranteId];
    if (!integranteScores) return;

    setSubmittingId(integranteId);
    setMessage(null);
    setError(null);

    try {
      await apiFetch(`/grupos/${selectedGrupoId}/avaliacoes/${integranteId}`, {
        method: 'PUT',
        body: JSON.stringify(integranteScores),
      });

      setMessage(`Avaliação de ${nomeAluno} salva com sucesso!`);
      carregarAvaliacoes(selectedGrupoId);
    } catch (err) {
      if (err.status === 403) {
        setReadOnly(true);
        setError('🔒 O Líder do grupo submeteu a avaliação e travou as edições.');
      } else {
        setError(err.message || 'Erro ao salvar avaliação');
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const calcularNotaTotal = (integranteId) => {
    const item = scores[integranteId];
    if (!item) return 0;
    const sum = (
      (item.pontualidade || 0) +
      (item.qualidade_trabalho || 0) +
      (item.respeito_grupo || 0) +
      (item.comunicacao || 0) +
      (item.iniciativa || 0)
    );
    return sum.toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Matriz de Avaliação do Grupo
          </h2>
          <p className="text-sm text-slate-400">
            Avalie o desempenho de cada integrante de 0.00 a 0.20 por critério (Nota máxima total: 1.00).
          </p>
        </div>

        {/* Seletor de Grupo */}
        {grupos.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Grupo:
            </label>
            <select
              value={selectedGrupoId}
              onChange={(e) => setSelectedGrupoId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-2 px-4 outline-none focus:border-indigo-500 font-semibold"
            >
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome_grupo}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Trava / Somente leitura */}
      {readOnly && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-400 text-sm">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Modo Somente Leitura Ativo:</strong> As avaliações deste grupo já foram finalizadas pelo Líder.
          </div>
        </div>
      )}

      {/* Alertas */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>{message}</div>
        </div>
      )}

      {error && !readOnly && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Tabela de Avaliação */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-6 h-6" />
          Carregando integrantes do grupo...
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          Nenhum integrante cadastrado neste grupo para avaliar.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Integrante</th>
                {CRITERIOS.map((c) => (
                  <th key={c.key} className="py-3.5 px-3 text-center font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center font-bold text-indigo-400">Nota Total</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {avaliacoes.map((item) => {
                const integranteId = item.integrante_id;
                const nomeAluno = item.integrantes?.nome_aluno || item.nome_aluno || 'Aluno';
                const userScore = scores[integranteId] || {};
                const notaTotal = calcularNotaTotal(integranteId);

                return (
                  <tr key={integranteId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {nomeAluno}
                      {item.alterado_por_professor && (
                        <span className="block text-[10px] text-amber-400 font-normal">
                          ✏️ Editado pelo Professor
                        </span>
                      )}
                    </td>

                    {CRITERIOS.map((c) => (
                      <td key={c.key} className="py-4 px-3 text-center">
                        <select
                          value={userScore[c.key] ?? 0.20}
                          disabled={readOnly}
                          onChange={(e) => handleScoreChange(integranteId, c.key, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs rounded-lg py-1.5 px-2 text-white outline-none focus:border-indigo-500 disabled:opacity-60"
                        >
                          {NOTAS_OPCOES.map((n) => (
                            <option key={n} value={n}>
                              {n.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}

                    <td className="py-4 px-4 text-center font-bold text-emerald-400 text-base">
                      {notaTotal}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSalvarIntegrante(integranteId, nomeAluno)}
                        disabled={readOnly || submittingId === integranteId}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 transition-all disabled:opacity-40"
                      >
                        {submittingId === integranteId ? (
                          <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Salvar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
